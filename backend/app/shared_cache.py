from __future__ import annotations
"""
Shared server-side cache for expensive computations.
Two strategies:
1. get_or_compute: blocks until fresh data (for fast endpoints)
2. get_cached_or_refresh_bg: returns stale data instantly, refreshes in background (for screener)
"""

import json
import time
import threading
from pathlib import Path

CACHE_DIR = Path.home() / ".equilima_data" / "shared_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

SCREENER_TTL = 15 * 60      # 15 min — when to trigger background refresh
DASHBOARD_TTL = 10 * 60
RESEARCH_TTL = 30 * 60
CRYPTO_TTL = 10 * 60

_locks = {}
_bg_running = set()


def _get_lock(key):
    if key not in _locks:
        _locks[key] = threading.Lock()
    return _locks[key]


def get_cached(key, ttl=None):
    """Get cached JSON data. If ttl=None, return any cached data regardless of age."""
    path = CACHE_DIR / f"{key}.json"
    if not path.exists():
        return None
    if ttl is not None:
        age = time.time() - path.stat().st_mtime
        if age >= ttl:
            return None
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return None


def get_cached_any(key):
    """Get cached data regardless of age. Returns None only if no cache exists."""
    return get_cached(key, ttl=None)


def set_cached(key, data):
    """Save data to shared cache."""
    path = CACHE_DIR / f"{key}.json"
    try:
        with open(path, "w") as f:
            json.dump(data, f)
    except Exception as e:
        print(f"[shared_cache] Failed to write {key}: {e}")


def is_stale(key, ttl):
    """Check if cache is stale (older than TTL)."""
    path = CACHE_DIR / f"{key}.json"
    if not path.exists():
        return True
    age = time.time() - path.stat().st_mtime
    return age >= ttl


def get_or_compute(key, ttl, compute_fn):
    """Get from cache or compute. Blocks until data is ready."""
    cached = get_cached(key, ttl)
    if cached is not None:
        return cached

    lock = _get_lock(key)
    if not lock.acquire(blocking=False):
        stale = get_cached_any(key)
        if stale:
            return stale
        lock.acquire()

    try:
        cached = get_cached(key, ttl)
        if cached is not None:
            return cached
        start = time.time()
        data = compute_fn()
        elapsed = time.time() - start
        set_cached(key, data)
        print(f"[shared_cache] Computed {key} in {elapsed:.1f}s")
        return data
    finally:
        lock.release()


def get_cached_or_refresh_bg(key, ttl, compute_fn):
    """
    ALWAYS returns cached data instantly (even if stale).
    If stale, triggers background refresh. Users never wait.
    Only blocks on first-ever request when no cache exists.
    """
    existing = get_cached_any(key)

    if existing is not None:
        # Always serve what we have immediately
        if is_stale(key, ttl):
            # Trigger background refresh (non-blocking)
            _refresh_background(key, compute_fn)
        return existing

    # No cache at all — must compute (first time only)
    lock = _get_lock(key)
    with lock:
        existing = get_cached_any(key)
        if existing is not None:
            return existing
        start = time.time()
        data = compute_fn()
        elapsed = time.time() - start
        set_cached(key, data)
        print(f"[shared_cache] First compute {key} in {elapsed:.1f}s")
        return data


def _refresh_background(key, compute_fn):
    """Refresh cache in a background thread. Only one refresh per key at a time."""
    if key in _bg_running:
        return  # already refreshing

    def _do_refresh():
        _bg_running.add(key)
        try:
            start = time.time()
            data = compute_fn()
            elapsed = time.time() - start
            set_cached(key, data)
            print(f"[shared_cache] BG refresh {key} in {elapsed:.1f}s")
        except Exception as e:
            print(f"[shared_cache] BG refresh {key} FAILED: {e}")
        finally:
            _bg_running.discard(key)

    thread = threading.Thread(target=_do_refresh, daemon=True)
    thread.start()


def invalidate(key):
    path = CACHE_DIR / f"{key}.json"
    path.unlink(missing_ok=True)


def cache_stats():
    stats = []
    for path in CACHE_DIR.glob("*.json"):
        age = time.time() - path.stat().st_mtime
        size = path.stat().st_size
        stats.append({
            "key": path.stem,
            "size_kb": round(size / 1024, 1),
            "age_min": round(age / 60, 1),
            "refreshing": path.stem in _bg_running,
        })
    return sorted(stats, key=lambda x: x["age_min"])

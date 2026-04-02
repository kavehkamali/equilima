import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { fetchTerminalChart, fetchTerminalIndicators } from '../../api';
import { Loader2 } from 'lucide-react';

const INDICATOR_COLORS = {
  sma_20: '#6366f1',
  sma_50: '#f59e0b',
  sma_200: '#ef4444',
  ema_12: '#06b6d4',
  ema_26: '#8b5cf6',
  bb_upper: '#ffffff30',
  bb_lower: '#ffffff30',
  bb_middle: '#ffffff18',
};

export default function CandlestickChart({ symbol, timeframe, interval, indicators, focused, onSymbolChange }) {
  const wrapperRef = useRef(null);
  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const extraRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbolInput, setSymbolInput] = useState(symbol);
  const [ready, setReady] = useState(false);

  useEffect(() => { setSymbolInput(symbol); }, [symbol]);

  // Create chart
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let attempts = 0;
    let timer;

    const tryInit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if ((w === 0 || h === 0) && attempts < 30) {
        attempts++;
        timer = setTimeout(tryInit, 50);
        return;
      }

      try {
        const chart = createChart(el, {
          width: w || 600,
          height: h || 400,
          layout: {
            background: { color: '#08080d' },
            textColor: '#555',
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 11,
          },
          grid: {
            vertLines: { color: '#ffffff06' },
            horzLines: { color: '#ffffff06' },
          },
          crosshair: {
            mode: 0,
            vertLine: { color: '#ffffff20', labelBackgroundColor: '#1a1a2e' },
            horzLine: { color: '#ffffff20', labelBackgroundColor: '#1a1a2e' },
          },
          rightPriceScale: {
            borderColor: '#ffffff10',
            scaleMargins: { top: 0.05, bottom: 0.12 },
          },
          timeScale: {
            borderColor: '#ffffff10',
            timeVisible: !['1d', '1wk', '1mo'].includes(interval),
          },
        });

        // v5 API: chart.addSeries(SeriesDefinition, options)
        const candles = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderUpColor: '#22c55e',
          borderDownColor: '#ef4444',
          wickUpColor: '#22c55e80',
          wickDownColor: '#ef444480',
        });

        chartRef.current = chart;
        candleRef.current = candles;

        const ro = new ResizeObserver(entries => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) chart.resize(width, height);
          }
        });
        ro.observe(el);
        el._cleanup_ro = ro;

        setReady(true);
      } catch (err) {
        console.error('Chart init error:', err);
        setError('Chart init failed: ' + err.message);
      }
    };

    tryInit();

    return () => {
      clearTimeout(timer);
      setReady(false);
      if (el._cleanup_ro) { el._cleanup_ro.disconnect(); delete el._cleanup_ro; }
      if (chartRef.current) {
        try { chartRef.current.remove(); } catch {}
        chartRef.current = null;
        candleRef.current = null;
        extraRef.current = [];
      }
    };
  }, [interval]);

  // Load data
  useEffect(() => {
    if (!ready || !chartRef.current || !candleRef.current) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [chartRes, indRes] = await Promise.all([
          fetchTerminalChart(symbol, timeframe, interval),
          fetchTerminalIndicators(symbol, timeframe, interval, indicators.join(',')),
        ]);
        if (cancelled) return;

        const chart = chartRef.current;
        const candles = candleRef.current;
        if (!chart || !candles) return;

        candles.setData(chartRes.data);

        // Remove old extras
        for (const s of extraRef.current) {
          try { chart.removeSeries(s); } catch {}
        }
        extraRef.current = [];

        const indData = indRes.indicators || {};

        // Volume
        if (indData.volume) {
          const vs = chart.addSeries(HistogramSeries, {
            priceScaleId: 'vol',
            priceFormat: { type: 'volume' },
          });
          chart.priceScale('vol').applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
          });
          vs.setData(indData.volume);
          extraRef.current.push(vs);
        }

        // Line overlays
        for (const [key, data] of Object.entries(indData)) {
          if (key === 'volume' || key === 'rsi' || key.startsWith('macd')) continue;
          if (!data || data.length === 0) continue;
          const color = INDICATOR_COLORS[key] || '#ffffff30';
          const ls = chart.addSeries(LineSeries, {
            color,
            lineWidth: key.startsWith('bb_') ? 1 : 2,
            lineStyle: key.startsWith('bb_') ? 2 : 0,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
          });
          ls.setData(data);
          extraRef.current.push(ls);
        }

        chart.timeScale().fitContent();
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [ready, symbol, timeframe, interval, indicators.join(',')]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const s = symbolInput.trim().toUpperCase();
    if (s && s !== symbol) onSymbolChange(s);
  };

  return (
    <div style={{
      position: 'relative', display: 'flex', flexDirection: 'column', height: '100%',
      background: '#08080d', borderRadius: 8, overflow: 'hidden',
      border: focused ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.04)',
      boxShadow: focused ? '0 0 12px rgba(99,102,241,0.08)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0a0a10', flexShrink: 0,
      }}>
        <form onSubmit={handleSubmit}>
          <input
            type="text" value={symbolInput}
            onChange={e => setSymbolInput(e.target.value.toUpperCase())}
            style={{
              width: 70, background: 'transparent', border: 'none', color: '#fff',
              fontSize: 12, fontWeight: 700, outline: 'none', fontFamily: 'inherit',
            }}
            spellCheck={false}
          />
        </form>
        <span style={{ fontSize: 9, color: '#444', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4 }}>{interval}</span>
        <div style={{ flex: 1 }} />
        {loading && <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#6366f180' }} />}
      </div>

      {/* Chart container */}
      <div ref={wrapperRef} style={{ flex: 1, minHeight: 0, position: 'relative' }} />

      {/* Error */}
      {error && !loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(8,8,13,0.9)', zIndex: 20,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 4 }}>{error}</div>
            <button onClick={() => { setError(null); setReady(false); setTimeout(() => setReady(true), 100); }}
              style={{ color: '#888', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

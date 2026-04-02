import { useState, useEffect, useMemo } from 'react';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { fetchCrypto } from '../api';

function fmtPrice(v) {
  if (v == null) return '—';
  if (v < 0.001) return `$${v.toFixed(8)}`;
  if (v < 1) return `$${v.toFixed(4)}`;
  if (v < 100) return `$${v.toFixed(2)}`;
  return `$${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function fmtCap(v) {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function fmtVol(v) {
  if (!v) return '—';
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
}

function Pct({ value }) {
  if (value == null) return <span className="text-gray-700">—</span>;
  const c = value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-gray-500';
  return <span className={`${c} font-mono`}>{value > 0 ? '+' : ''}{value}%</span>;
}

function Sparkline({ data, width = 100, height = 28 }) {
  if (!data?.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  const up = data[data.length - 1] >= data[0];
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id={`cg_${up ? 'up' : 'dn'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? '#22c55e' : '#ef4444'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={up ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={up ? '#22c55e' : '#ef4444'} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

function HeatmapTile({ coin }) {
  const val = coin.change_1d;
  const intensity = Math.min(Math.abs(val) / 8, 1);
  const bg = val >= 0
    ? `rgba(34, 197, 94, ${0.08 + intensity * 0.35})`
    : `rgba(239, 68, 68, ${0.08 + intensity * 0.35})`;
  const borderColor = val >= 0
    ? `rgba(34, 197, 94, ${0.15 + intensity * 0.25})`
    : `rgba(239, 68, 68, ${0.15 + intensity * 0.25})`;

  return (
    <div className="rounded-xl p-3 text-center transition-all hover:scale-[1.02]"
      style={{ background: bg, borderWidth: 1, borderColor, borderStyle: 'solid' }}>
      <div className="text-xs font-bold text-white">{coin.symbol}</div>
      <div className="text-[10px] text-gray-400 truncate">{coin.name}</div>
      <div className={`text-lg font-bold mt-1 ${val >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
        {val > 0 ? '+' : ''}{val}%
      </div>
      <div className="text-[10px] text-gray-400 mt-0.5">{fmtPrice(coin.price)}</div>
    </div>
  );
}

export default function CryptoPanel() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('heatmap'); // heatmap | table
  const [sortKey, setSortKey] = useState('market_cap');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetchCrypto()
      .then(d => setCoins(d.coins || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = useMemo(() => {
    return [...coins].sort((a, b) => {
      let va = a[sortKey] ?? -Infinity;
      let vb = b[sortKey] ?? -Infinity;
      return sortAsc ? va - vb : vb - va;
    });
  }, [coins, sortKey, sortAsc]);

  // Heatmap: sort by market cap descending, bigger tiles for bigger coins
  const heatmapCoins = useMemo(() => {
    return [...coins].sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
  }, [coins]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading crypto data...</div>;
  if (error) return <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">{error}</div>;

  // Summary stats
  const totalMcap = coins.reduce((sum, c) => sum + (c.market_cap || 0), 0);
  const btc = coins.find(c => c.symbol === 'BTC');
  const eth = coins.find(c => c.symbol === 'ETH');
  const btcDom = btc && totalMcap ? ((btc.market_cap / totalMcap) * 100).toFixed(1) : '—';

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div>
          <div className="text-[9px] text-gray-500 uppercase">Total Market Cap</div>
          <div className="text-sm font-bold text-white">{fmtCap(totalMcap)}</div>
        </div>
        <div className="w-px h-8 bg-white/10" />
        {btc && (
          <div>
            <div className="text-[9px] text-gray-500 uppercase">BTC</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{fmtPrice(btc.price)}</span>
              <Pct value={btc.change_1d} />
            </div>
          </div>
        )}
        <div className="w-px h-8 bg-white/10" />
        {eth && (
          <div>
            <div className="text-[9px] text-gray-500 uppercase">ETH</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{fmtPrice(eth.price)}</span>
              <Pct value={eth.change_1d} />
            </div>
          </div>
        )}
        <div className="w-px h-8 bg-white/10" />
        <div>
          <div className="text-[9px] text-gray-500 uppercase">BTC Dominance</div>
          <div className="text-sm font-bold text-indigo-400">{btcDom}%</div>
        </div>
        <div className="flex-1" />
        {/* View toggle */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
          {[{ id: 'heatmap', label: 'Heatmap' }, { id: 'table', label: 'Table' }].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                view === v.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'
              }`}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* Heatmap View */}
      {view === 'heatmap' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {heatmapCoins.map(coin => (
            <HeatmapTile key={coin.symbol} coin={coin} />
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="bg-[#0e0e16]">
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="text-left py-2.5 px-3 font-medium w-8">#</th>
                  <th className="text-left py-2.5 px-3 font-medium">Coin</th>
                  <th className="py-2.5 px-2 font-medium w-24">30D</th>
                  <th className="text-right py-2.5 px-3 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('price')}>
                    Price {sortKey === 'price' && <ArrowUpDown className="inline w-2.5 h-2.5" />}
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('change_1d')}>
                    24h {sortKey === 'change_1d' && <ArrowUpDown className="inline w-2.5 h-2.5" />}
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium">7D</th>
                  <th className="text-right py-2.5 px-3 font-medium">30D</th>
                  <th className="text-right py-2.5 px-3 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('market_cap')}>
                    Market Cap {sortKey === 'market_cap' && <ArrowUpDown className="inline w-2.5 h-2.5" />}
                  </th>
                  <th className="text-right py-2.5 px-3 font-medium cursor-pointer hover:text-gray-300" onClick={() => handleSort('volume_24h')}>
                    Volume 24h {sortKey === 'volume_24h' && <ArrowUpDown className="inline w-2.5 h-2.5" />}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((coin, i) => (
                  <tr key={coin.symbol} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-gray-600">{i + 1}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-white">{coin.symbol}</div>
                      <div className="text-[9px] text-gray-500">{coin.name}</div>
                    </td>
                    <td className="py-2 px-2"><Sparkline data={coin.sparkline} /></td>
                    <td className="py-2 px-3 text-right text-gray-200 font-mono">{fmtPrice(coin.price)}</td>
                    <td className="py-2 px-3 text-right"><Pct value={coin.change_1d} /></td>
                    <td className="py-2 px-3 text-right"><Pct value={coin.changes?.['1W']} /></td>
                    <td className="py-2 px-3 text-right"><Pct value={coin.changes?.['1M']} /></td>
                    <td className="py-2 px-3 text-right text-gray-300">{fmtCap(coin.market_cap)}</td>
                    <td className="py-2 px-3 text-right text-gray-400">{fmtVol(coin.volume_24h)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

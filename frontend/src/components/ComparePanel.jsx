import { useState } from 'react';
import { Play, Loader2, Plus, X } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ${p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function ComparePanel({ strategies, onCompare, results, loading }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [selected, setSelected] = useState(['sma_crossover', 'buy_and_hold']);
  const [period, setPeriod] = useState('max');
  const [capital, setCapital] = useState(100000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const toggleStrategy = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleRun = () => {
    onCompare({
      symbol: symbol.toUpperCase(),
      strategies: selected,
      period,
      initial_capital: capital,
      start_date: startDate || null,
      end_date: endDate || null,
    });
  };

  // Merge equity curves for overlay chart
  const mergedEquity = [];
  if (results?.length) {
    const maxLen = Math.max(...results.map(r => r.equity_curve.length));
    const step = Math.max(1, Math.floor(maxLen / 500));
    for (let i = 0; i < maxLen; i += step) {
      const point = {};
      results.forEach(r => {
        if (i < r.equity_curve.length) {
          point.date = r.equity_curve[i].date;
          point[r.strategy] = r.equity_curve[i].equity;
        }
      });
      mergedEquity.push(point);
    }
    // Always include last point
    const lastPoint = {};
    results.forEach(r => {
      const last = r.equity_curve[r.equity_curve.length - 1];
      lastPoint.date = last.date;
      lastPoint[r.strategy] = last.equity;
    });
    if (mergedEquity[mergedEquity.length - 1]?.date !== lastPoint.date) {
      mergedEquity.push(lastPoint);
    }
  }

  return (
    <div className="space-y-6">
      {/* Config */}
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Data History</label>
            <div className="flex gap-1.5">
              {[
                { value: '1y', label: '1Y' },
                { value: '2y', label: '2Y' },
                { value: '5y', label: '5Y' },
                { value: '10y', label: '10Y' },
                { value: 'max', label: 'MAX' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    period === opt.value
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/5 text-gray-500 border border-white/5 hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Initial Capital ($)</label>
            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50" />
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3">Strategies to Compare</label>
            <div className="space-y-2">
              {strategies.map(s => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggleStrategy(s.id)}
                    className="accent-indigo-500"
                  />
                  <span className={`text-sm ${selected.includes(s.id) ? 'text-white' : 'text-gray-500'} group-hover:text-gray-300 transition-colors`}>
                    {s.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={loading || selected.length < 2}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Comparing...</>
            ) : (
              <><Play className="w-4 h-4" /> Compare ({selected.length} strategies)</>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Running comparisons...
            </div>
          )}

          {!loading && !results && (
            <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
              Select strategies and run comparison
            </div>
          )}

          {results && (
            <>
              {/* Equity overlay */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Equity Curves Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={mergedEquity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#666' }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => {
                        const s = strategies.find(s => s.id === value);
                        return s?.name || value;
                      }}
                    />
                    {results.map((r, i) => (
                      <Line
                        key={r.strategy}
                        type="monotone"
                        dataKey={r.strategy}
                        stroke={COLORS[i % COLORS.length]}
                        strokeWidth={1.5}
                        dot={false}
                        name={r.strategy}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Table */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Performance Comparison</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-500 border-b border-white/5">
                      <th className="text-left py-2 px-3">Strategy</th>
                      <th className="text-right py-2 px-3">Total %</th>
                      <th className="text-right py-2 px-3">Annual %</th>
                      <th className="text-right py-2 px-3">Sharpe</th>
                      <th className="text-right py-2 px-3">Max DD</th>
                      <th className="text-right py-2 px-3">Win Rate</th>
                      <th className="text-right py-2 px-3">Trades</th>
                      <th className="text-right py-2 px-3">Profit Factor</th>
                      <th className="text-right py-2 px-3">Sortino</th>
                      <th className="text-right py-2 px-3">Calmar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const name = strategies.find(s => s.id === r.strategy)?.name || r.strategy;
                      return (
                        <tr key={r.strategy} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-medium" style={{ color: COLORS[i % COLORS.length] }}>
                            {name}
                          </td>
                          <td className={`py-2 px-3 text-right ${r.total_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.total_return_pct}%
                          </td>
                          <td className={`py-2 px-3 text-right ${r.annual_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.annual_return_pct}%
                          </td>
                          <td className={`py-2 px-3 text-right ${r.sharpe_ratio >= 1 ? 'text-emerald-400' : 'text-gray-400'}`}>
                            {r.sharpe_ratio}
                          </td>
                          <td className="py-2 px-3 text-right text-red-400">{r.max_drawdown_pct}%</td>
                          <td className="py-2 px-3 text-right text-gray-300">{r.win_rate}%</td>
                          <td className="py-2 px-3 text-right text-gray-400">{r.num_trades}</td>
                          <td className={`py-2 px-3 text-right ${r.profit_factor >= 1.5 ? 'text-emerald-400' : 'text-gray-400'}`}>
                            {r.profit_factor}
                          </td>
                          <td className="py-2 px-3 text-right text-gray-400">{r.sortino_ratio}</td>
                          <td className="py-2 px-3 text-right text-gray-400">{r.calmar_ratio}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Play, Loader2 } from 'lucide-react';

export default function StrategyPanel({ strategies, onRun, loading }) {
  const [symbol, setSymbol] = useState('AAPL');
  const [strategy, setStrategy] = useState('sma_crossover');
  const [period, setPeriod] = useState('max');
  const [capital, setCapital] = useState(100000);
  const [commission, setCommission] = useState(0.1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [params, setParams] = useState({});

  const selected = strategies.find(s => s.id === strategy);

  const handleStrategyChange = (id) => {
    setStrategy(id);
    const strat = strategies.find(s => s.id === id);
    const defaults = {};
    (strat?.params || []).forEach(p => { defaults[p.name] = p.default; });
    setParams(defaults);
  };

  const handleRun = () => {
    onRun({
      symbol: symbol.toUpperCase(),
      strategy,
      period,
      initial_capital: capital,
      commission_pct: commission / 100,
      start_date: startDate || null,
      end_date: endDate || null,
      params,
    });
  };

  return (
    <div className="space-y-4">
      {/* Symbol */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
          Symbol
        </label>
        <input
          type="text"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
          placeholder="AAPL, MSFT, TSLA..."
        />
      </div>

      {/* History Period */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
          Data History
        </label>
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

      {/* Strategy */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
          Strategy
        </label>
        <select
          value={strategy}
          onChange={e => handleStrategyChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none"
        >
          {strategies.map(s => (
            <option key={s.id} value={s.id} className="bg-[#1a1a2e]">
              {s.name}
            </option>
          ))}
        </select>
        {selected && (
          <p className="mt-2 text-xs text-gray-500">{selected.description}</p>
        )}
      </div>

      {/* Strategy Parameters */}
      {selected?.params?.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <label className="block text-xs text-gray-500 uppercase tracking-wider">
            Parameters
          </label>
          {selected.params.map(p => (
            <div key={p.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{p.name.replace(/_/g, ' ')}</span>
                <span className="text-indigo-400">{params[p.name] ?? p.default}</span>
              </div>
              <input
                type="range"
                min={p.min}
                max={p.max}
                step={p.type === 'float' ? 0.1 : 1}
                value={params[p.name] ?? p.default}
                onChange={e => setParams({
                  ...params,
                  [p.name]: p.type === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value),
                })}
                className="w-full accent-indigo-500 h-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Date Range */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
          Date Range (optional)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text" placeholder="YYYY-MM-DD"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type="text" placeholder="YYYY-MM-DD"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Capital & Commission */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
            Initial Capital ($)
          </label>
          <input
            type="text" inputMode="decimal"
            value={capital}
            onChange={e => setCapital(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
            Commission (%)
          </label>
          <input
            type="text" inputMode="decimal"
            step="0.01"
            value={commission}
            onChange={e => setCommission(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRun}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
        ) : (
          <><Play className="w-4 h-4" /> Run Backtest</>
        )}
      </button>
    </div>
  );
}

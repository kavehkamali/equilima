import { BarChart3 } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Backtest Lab
          </h1>
        </div>

        <nav className="flex gap-0.5 bg-white/5 rounded-lg p-1">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'screener', label: 'Screener' },
            { id: 'research', label: 'Research' },
            { id: 'terminal', label: 'Terminal' },
            { id: 'backtest', label: 'Backtesting' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { fetchStrategies, compareStrategies } from './api';
import DashboardPanel from './components/DashboardPanel';
import ComparePanel from './components/ComparePanel';
import ScreenerPanel from './components/ScreenerPanel';
import ResearchPanel from './components/ResearchPanel';
import TerminalPanel from './components/terminal/TerminalPanel';
import Header from './components/Header';

function App() {
  const [strategies, setStrategies] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [compareResults, setCompareResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStrategies().then(d => setStrategies(d.strategies)).catch(() => {});
  }, []);

  const handleCompare = async (params) => {
    setLoading(true);
    setError(null);
    setCompareResults(null);
    try {
      const res = await compareStrategies(params);
      setCompareResults(res.results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isTerminal = activeTab === 'terminal';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {isTerminal && <TerminalPanel />}

      {!isTerminal && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 mt-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {activeTab === 'dashboard' && <DashboardPanel />}
          {activeTab === 'screener' && <ScreenerPanel />}
          {activeTab === 'research' && <ResearchPanel />}
          {activeTab === 'backtest' && (
            <ComparePanel
              strategies={strategies}
              onCompare={handleCompare}
              results={compareResults}
              loading={loading}
            />
          )}
        </main>
      )}
    </div>
  );
}

export default App;

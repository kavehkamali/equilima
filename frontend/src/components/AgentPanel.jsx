import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User, Sparkles, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { agentQuick, agentChat, agentHealth, fetchTerminalChart } from '../api';

// ─── Markdown-lite renderer ───
function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-bold text-white mt-4 mb-1">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-base font-bold text-white mt-4 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 text-xs text-gray-300 ml-2 my-0.5">
          <span className="text-indigo-400 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(line.slice(2)) }} />
        </div>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="text-xs text-gray-300 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: boldify(line) }} />);
    }
    i++;
  }
  return <div>{elements}</div>;
}

function boldify(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-white/5 px-1 rounded text-indigo-300 text-[10px]">$1</code>');
}

// ─── Mini price chart for a ticker ───
function TickerChart({ ticker }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!ticker) return;
    fetchTerminalChart(ticker, '3mo', '1d')
      .then(d => setData(d.data))
      .catch(() => {});
  }, [ticker]);

  if (!data || data.length < 5) return null;

  const first = data[0].close;
  const last = data[data.length - 1].close;
  const change = ((last / first - 1) * 100).toFixed(2);
  const up = last >= first;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold text-white">{ticker}</span>
          <span className="text-[10px] text-gray-500 ml-2">3M</span>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-white">${last.toFixed(2)}</span>
          <span className={`text-[10px] ml-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>{up ? '+' : ''}{change}%</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="agcg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={up ? '#22c55e' : '#ef4444'} stopOpacity={0.15} />
              <stop offset="100%" stopColor={up ? '#22c55e' : '#ef4444'} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff04" />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip content={({ active, payload }) => active && payload?.length ? (
            <div className="bg-[#1a1a2e] border border-white/10 rounded px-2 py-1 text-[9px] text-white">${payload[0].value.toFixed(2)}</div>
          ) : null} />
          <Area type="monotone" dataKey="close" stroke={up ? '#22c55e' : '#ef4444'} fill="url(#agcg)" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Chat message ───
function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'bg-indigo-600/20 border-indigo-500/20' : 'bg-white/[0.03] border-white/5'} border rounded-xl px-4 py-3`}>
        {isUser ? (
          <p className="text-sm text-white">{msg.content}</p>
        ) : (
          <>
            <RenderMarkdown text={msg.content} />
            {msg.ticker && <TickerChart ticker={msg.ticker} />}
          </>
        )}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
}

// ─── Main ───
export default function AgentPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('quick'); // quick | full
  const [agentOnline, setAgentOnline] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    agentHealth().then(d => setAgentOnline(d.status === 'ok'));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const fn = mode === 'full' ? agentChat : agentQuick;
      const resp = await fn(msg);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: resp.response,
        ticker: resp.ticker || '',
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error:** ${e.message}\n\nThe AI agent may be temporarily unavailable. Please try again.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Analyze NVDA — is it a good buy right now?",
    "What's the outlook for the S&P 500 this quarter?",
    "Compare AAPL vs MSFT for long-term investment",
    "Which tech stocks are oversold right now?",
    "Give me a risk assessment for TSLA",
    "What sectors are showing strength this week?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] max-w-4xl mx-auto">
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Equilima AI</h1>
          <p className="text-sm text-gray-500 text-center max-w-md mb-1">
            Your AI-powered market research assistant. Ask about any stock, market trend, or investment strategy.
          </p>
          <div className="flex items-center gap-2 mb-8">
            <div className={`w-2 h-2 rounded-full ${agentOnline ? 'bg-emerald-400' : agentOnline === false ? 'bg-red-400' : 'bg-yellow-400'}`} />
            <span className="text-[10px] text-gray-600">
              {agentOnline ? 'DeepSeek-R1-32B online' : agentOnline === false ? 'Agent offline' : 'Checking...'}
            </span>
          </div>

          {/* Suggestion chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => { setInput(s); }}
                className="text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-200">{s}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  {mode === 'full' ? 'Running multi-agent analysis...' : 'Thinking...'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5 bg-white/5 rounded-lg p-0.5">
            <button onClick={() => setMode('quick')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${mode === 'quick' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'}`}>
              <Zap className="w-3 h-3" /> Quick
            </button>
            <button onClick={() => setMode('full')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${mode === 'full' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-500 hover:text-gray-300'}`}>
              <Bot className="w-3 h-3" /> Full Analysis
            </button>
          </div>
          <span className="text-[9px] text-gray-600">
            {mode === 'quick' ? 'Fast direct response' : 'Multi-agent deep analysis (slower)'}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about any stock, market trend, or strategy..."
            disabled={loading}
            className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/40 disabled:opacity-50 placeholder-gray-600"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-gray-700 text-center mt-2">
          Powered by DeepSeek-R1 · Not financial advice · Always do your own research
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, TrendingDown, ExternalLink, Clock } from 'lucide-react';
import { fetchMarketOverview, fetchCrypto, fetchNews } from '../api';

// ─── Helpers ───
function Sparkline({ data, width = 100, height = 32 }) {
  if (!data?.length) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
  return <svg width={width} height={height}><polyline fill="none" stroke={data[data.length - 1] >= data[0] ? '#22c55e' : '#ef4444'} strokeWidth="1.5" points={pts} /></svg>;
}
function Pct({ value }) {
  if (value == null) return <span className="text-gray-600">—</span>;
  const c = value > 0 ? 'text-emerald-400' : value < 0 ? 'text-red-400' : 'text-gray-500';
  return <span className={`${c} font-mono text-xs`}>{value > 0 ? '+' : ''}{value}%</span>;
}
function fmtPrice(v) {
  if (v >= 10000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return v.toFixed(2);
}
function fmtCap(v) {
  if (!v) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v}`;
}
function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function MarketCard({ item }) {
  const up = item.change_1d >= 0;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between mb-1.5">
        <div className="text-[10px] text-gray-500 truncate max-w-[80px]">{item.name}</div>
        <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {up ? '+' : ''}{item.change_1d}%
        </div>
      </div>
      <div className={`text-sm font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>{fmtPrice(item.price)}</div>
      <div className="mt-1.5"><Sparkline data={item.sparkline} width={120} height={28} /></div>
      <div className="flex gap-2 mt-1.5 flex-wrap">
        {['1W', '1M', 'YTD'].map(k => item.changes?.[k] != null && (
          <div key={k} className="text-center">
            <div className="text-[7px] text-gray-600">{k}</div>
            <Pct value={item.changes[k]} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SectorHeatmap({ sectors }) {
  if (!sectors?.length) return null;
  const maxAbs = Math.max(...sectors.map(s => Math.abs(s.change_1d)), 1);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
      {sectors.map(s => {
        const intensity = Math.min(Math.abs(s.change_1d) / maxAbs, 1);
        const bg = s.change_1d >= 0 ? `rgba(34,197,94,${0.1 + intensity * 0.4})` : `rgba(239,68,68,${0.1 + intensity * 0.4})`;
        return (
          <div key={s.symbol} className="rounded-lg p-2.5 text-center border border-white/5" style={{ background: bg }}>
            <div className="text-[10px] text-gray-300 font-medium truncate">{s.name}</div>
            <div className={`text-sm font-bold ${s.change_1d >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{s.change_1d > 0 ? '+' : ''}{s.change_1d}%</div>
            <div className="text-[8px] text-gray-500 mt-0.5">YTD: <Pct value={s.changes?.YTD} /></div>
          </div>
        );
      })}
    </div>
  );
}

function CryptoRow({ coin }) {
  const up = coin.change_1d >= 0;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
      <div className="w-16 text-xs font-bold text-white">{coin.symbol}</div>
      <div className="flex-1 text-xs text-gray-400">{fmtPrice(coin.price)}</div>
      <div className={`text-xs font-mono ${up ? 'text-emerald-400' : 'text-red-400'}`}>{up ? '+' : ''}{coin.change_1d}%</div>
      <div className="text-[10px] text-gray-500">{fmtCap(coin.market_cap)}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPanel() {
  const [market, setMarket] = useState(null);
  const [crypto, setCrypto] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMarketOverview().catch(() => null),
      fetchCrypto().catch(() => null),
      fetchNews('^GSPC,^IXIC,AAPL,MSFT,NVDA,TSLA,AMZN').catch(() => null),
    ]).then(([m, c, n]) => {
      setMarket(m);
      setCrypto(c);
      setNews(n);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading dashboard...</div>;

  const cryptoCoins = (crypto?.coins || []).slice(0, 10);
  const articles = (news?.articles || []).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Indices */}
      {market?.indices && (
        <Section title="Market Indices">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {market.indices.map(item => <MarketCard key={item.symbol} item={item} />)}
          </div>
        </Section>
      )}

      {/* Sector Heatmap */}
      {market?.sectors && (
        <Section title="Sector Performance">
          <SectorHeatmap sectors={market.sectors} />
        </Section>
      )}

      {/* 3-column: Commodities | Crypto | News */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commodities + Bonds + Currencies */}
        <div className="space-y-5">
          {market?.commodities && (
            <Section title="Commodities">
              <div className="grid grid-cols-2 gap-2">
                {market.commodities.map(item => <MarketCard key={item.symbol} item={item} />)}
              </div>
            </Section>
          )}
          {market?.bonds && (
            <Section title="Bonds & Yields">
              <div className="grid grid-cols-2 gap-2">
                {market.bonds.map(item => <MarketCard key={item.symbol} item={item} />)}
              </div>
            </Section>
          )}
          {market?.currencies && (
            <Section title="Currencies">
              <div className="grid grid-cols-2 gap-2">
                {market.currencies.map(item => <MarketCard key={item.symbol} item={item} />)}
              </div>
            </Section>
          )}
        </div>

        {/* Crypto */}
        <div>
          <Section title="Crypto">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              {cryptoCoins.map(coin => <CryptoRow key={coin.symbol} coin={coin} />)}
            </div>
          </Section>
          {market?.housing && (
            <div className="mt-5">
              <Section title="Housing & Real Estate">
                <div className="grid grid-cols-2 gap-2">
                  {market.housing.map(item => <MarketCard key={item.symbol} item={item} />)}
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* News */}
        <div>
          <Section title="Market News">
            <div className="space-y-2">
              {articles.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                  className="block bg-white/[0.02] border border-white/5 rounded-lg p-2.5 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                  <div className="text-[11px] font-medium text-gray-200 group-hover:text-white line-clamp-2">{a.title}</div>
                  <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500">
                    {a.source && <span>{a.source}</span>}
                    <span>{timeAgo(a.date)} ago</span>
                    {a.tickers?.slice(0, 3).map((t, j) => (
                      <span key={j} className="px-1 rounded bg-white/5 text-indigo-400 text-[8px]">{t}</span>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

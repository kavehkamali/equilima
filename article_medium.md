# I Built an AI-Powered Stock Analysis Platform That Runs Entirely on Open Source — Here's How It Beat My Paid Subscriptions

## How a weekend project turned into a full-stack trading terminal with AI research agents, and why I'm giving it away for free.

---

*"The stock market is a device for transferring money from the impatient to the patient." — Warren Buffett*

But what if you could be both patient **and** informed — without paying $300/month for the privilege?

That's the question that started everything.

---

### The $2,400/Year Problem

If you're serious about stock analysis, you know the pain. Seeking Alpha Premium runs $239/year. Simply Wall St charges $120. TradingView Pro is $155. A Bloomberg Terminal? That's $24,000. Add in a decent screener, a backtesting platform, and maybe a news aggregator, and suddenly you're spending more on tools than you're making in dividends.

I was paying for four different services last year. Each one did one thing well and five things poorly. My Seeking Alpha subscription gave me great research but terrible charts. TradingView had beautiful charts but no fundamental analysis. My screener couldn't backtest. My backtesting tool couldn't screen.

One evening, after watching my Seeking Alpha tab load for the third time, I closed my laptop and thought: *What if I just built all of this myself?*

Six weeks later, [Equilima](https://equilima.com) was live.

---

### What Is Equilima?

Equilima is a free, open-source stock analysis platform that combines everything a serious investor needs into a single interface:

- **AI Research Agent** — Chat with a local LLM that analyzes stocks in real-time
- **Professional Screener** — 3,700+ stocks with 30+ filterable columns and interactive radar filters
- **Deep Research** — Seeking Alpha-style analysis with financial statements, earnings, dividends, ownership, and analyst ratings
- **Simply Wall St-style Snowflake Charts** — Visual health scores across Value, Growth, Past Performance, Financial Health, and Dividends
- **Candlestick Terminal** — Real-time charting with technical indicators
- **Strategy Backtesting** — 8 proven strategies including a walk-forward ML Transformer model
- **Market Dashboard** — Live indices, commodities, bonds, crypto, sector heatmaps

All of it. Free. Open source. Running on a $3/month server.

**Live demo:** [equilima.com](https://equilima.com)
**Source code:** [github.com/kavehkamali/equilima](https://github.com/kavehkamali/equilima)

---

### The AI Agent That Changed Everything

Let me tell you about the feature that surprised me the most.

I'd built all the traditional tools — the screener, the charts, the research pages. They were good. They replaced my paid subscriptions. But they were still tools. You had to know what to look for.

Then I added the AI agent.

It's a chat interface powered by a locally-running large language model (Gemma3 on a 48GB GPU). You ask it a question like *"Give me a risk assessment for TSLA"* and it returns a structured analysis with current prices, key support/resistance levels, recent performance data, risk factors, and an outlook — formatted in clean markdown with headers, bullet points, and bold numbers.

But here's what makes it different from ChatGPT or Perplexity: **it's connected to the platform.** When the AI mentions a stock ticker, a mini insight card appears below the response showing:

- A 6-month price chart
- Monthly return bars
- A snowflake quality radar
- Key stats (P/E, market cap, EPS, dividend yield)
- Performance badges across multiple timeframes
- Direct links to the full Research page, the charting Terminal, and the Screener

It's not just text. It's text with context. The AI tells you what to think about, and the platform shows you the data to verify it.

The agent runs on [TradingAgents](https://github.com/TauricResearch/TradingAgents), an open-source multi-agent trading framework, with Ollama serving the model locally. No API costs. No rate limits. No data leaving your infrastructure.

---

### The Screener: Where Most Platforms Fall Short

Every broker has a stock screener. Most of them are terrible.

They give you a table of numbers. Maybe some filters. You can sort by P/E ratio or market cap. That's it. No visual context. No sense of shape.

Equilima's screener is different because of three features I haven't seen anywhere else:

**1. Interactive Snowflake Filters**

Below the traditional filters (P/E range, market cap, RSI, etc.), there are three interactive radar charts:

- **Quality** — Value, Future Growth, Past Performance, Health, Dividends
- **Technical** — RSI, MACD, Volume, Trend, Bollinger position
- **Momentum** — 1-day, 5-day, 1-month, 3-month, 52-week performance

Each radar has draggable points. You grab a point and pull it outward to increase the minimum threshold for that dimension. The spline curve reshapes in real-time. Stocks that don't meet your shape get filtered out instantly.

It's like sculpting your ideal stock profile with your hands.

**2. 3,700+ Stocks, Instant Load**

The screener covers every NYSE, NASDAQ, and AMEX stock with a price above $3 and market cap above $200M. No penny stocks, no shell companies. Just investable securities.

Thanks to an aggressive caching architecture, returning users get instant results. The server pre-computes screener data in the background and serves cached results to all visitors. When the data gets stale, it silently refreshes behind the scenes. You never wait.

**3. One-Click Deep Dive**

Click any stock in the screener and a detail panel slides in with a price chart, key stats, and technical indicators. Want more? Click "Full Research" and you're on a page that would cost you $20/month on Seeking Alpha — complete with financial statements, earnings history, analyst ratings, insider transactions, institutional holders, dividend growth rates, and a DCF fair value calculation.

---

### The Research Page: Seeking Alpha Meets Simply Wall St

I spent more time on the Research tab than anything else. It has 9 sub-tabs:

**Summary** — The landing page shows everything at a glance:
- A snowflake radar chart scoring the stock across 5 dimensions (with smooth spline curves and glow effects — because details matter)
- A DCF fair value bar showing if the stock is overvalued or undervalued
- An ownership pie chart (Insiders / Institutions / Public)
- A health checklist with 10 automated risk checks (debt ratio, profitability, growth, valuation, short interest)
- Quant grades (A through F) for Valuation, Growth, Profitability, and Momentum
- Revenue & earnings trend chart
- Analyst price target range

**Ratings** — Wall Street consensus with a visual buy/hold/sell bar, recent analyst rating changes with firm names and date

**Financials** — Income statement, balance sheet, and cash flow — both annual and quarterly, with all standard line items

**Earnings** — EPS estimate vs actual, surprise percentages, revenue trend chart

**Dividends** — Yield, payout ratio, consecutive growth years, 3-year and 5-year CAGR, dividend history chart

**Risk** — Sharpe ratio, Sortino ratio, max drawdown, annualized volatility, Value at Risk (95%), performance across all timeframes

**Ownership** — Top institutional holders, mutual fund holders, insider transactions (color-coded buys and sells)

**Peers** — Side-by-side comparison with sector peers across 7 metrics

**News** — Latest articles with thumbnails and sources

All of this data comes from Yahoo Finance through yfinance — free, no API key required, cached aggressively so it doesn't hit rate limits.

---

### Backtesting Without Data Leakage

This is where most retail backtesting tools silently lie to you.

They compute signals using future data. They don't account for transaction costs. They don't use walk-forward validation. The result? Strategies that look amazing in backtests and lose money in real life.

Equilima's backtesting engine was built with paranoia about data leakage:

- **All signals are shifted by one bar** — you trade on the next bar's open, not the current bar's close
- **Transaction costs and slippage are included** in every simulation
- **Walk-forward validation** for the ML model — the Transformer is retrained every 60 bars on an expanding window of past data only
- **Purge gap** — 10 days + horizon embargo between training and test data
- **Feature scaling fitted only on training data** — no information from the future leaks into the scaler

The platform includes 8 strategies:
1. SMA Crossover
2. EMA Crossover
3. RSI
4. MACD
5. Bollinger Bands
6. Mean Reversion
7. Momentum
8. **ML Transformer** — An encoder-only Transformer that predicts P(stock goes up X% in N days)

You can compare any combination of these head-to-head against Buy & Hold, with customizable parameters, on any stock, over any time period from 1 year to the full available history.

The metrics are comprehensive: total return, annualized return, Sharpe ratio, Sortino ratio, Calmar ratio, max drawdown, win rate, profit factor, average trade return. Plus equity curves, drawdown charts, monthly return bars, and a full trade log.

---

### The Tech Stack (For the Engineers)

If you're a developer, here's what's under the hood:

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS + Recharts + lightweight-charts |
| Backend | Python FastAPI + yfinance + ta (technical analysis) + PyTorch |
| AI Agent | Ollama (local LLM) + TradingAgents framework |
| Database | SQLite (users, analytics, interactions) |
| Caching | Disk-based shared cache with background refresh |
| Deployment | AWS EC2 + Caddy (auto-HTTPS) + GitHub webhook auto-deploy |

The entire codebase is ~12,000 lines across about 30 files. It's not a monolith — each feature is cleanly separated. The screener doesn't know about the terminal. The research page doesn't know about the backtester. The AI agent calls the same APIs that the frontend does.

Deployment is a single `git push`. A webhook triggers the server to pull, rebuild the frontend, and restart — typically in under 30 seconds. Zero downtime for the cache layer since it's file-based.

---

### Why Open Source?

I could have charged for this. Similar platforms charge $10-30/month. At scale, the server costs are minimal — a $3 t2.micro instance handles dozens of concurrent users thanks to the caching layer.

But I built this because I was frustrated with expensive, fragmented tools. Charging for it would make me the problem I was trying to solve.

More practically: **open source makes it better faster.** If you're a developer who knows a better way to calculate support/resistance levels, you can submit a PR. If you're a quant who wants to add a new backtesting strategy, the architecture makes it easy. If you're a designer who thinks the snowflake chart could look even better, the SVG is right there in `SnowflakeChart.jsx`.

The data comes from Yahoo Finance, which is free. The AI runs on your own hardware (or mine, if you use the hosted version). There are no API costs to pass on to users.

The only thing that costs money is the EC2 instance, and I'm happy to eat that cost in exchange for an open-source project that actually helps people make better investment decisions.

---

### What I Learned Building This

**1. Caching is everything.** The difference between a 30-second page load and a 200ms page load is entirely in the caching strategy. I cache at three levels: yfinance data (15 min), fundamental data (24 hours), and computed results (shared across all users with background refresh). The first visitor is slow. Everyone after that is instant.

**2. Data leakage in backtesting is subtle and everywhere.** It's not enough to avoid using future prices. Your indicators need to be computed on rolling windows. Your scaler needs to be fitted on training data only. Your signals need to be shifted before execution. Every "obvious" shortcut introduces bias.

**3. AI is most useful when it's connected to tools.** A chatbot that tells you "AAPL has a P/E of 30" is marginally useful. A chatbot that tells you that AND shows you the chart, links to the full research page, and displays the snowflake analysis is 10x more useful. Context is everything.

**4. Good financial tools are expensive because of data, not code.** The code to build a screener is not that complex. The reason Seeking Alpha charges $239/year is the data collection and analysis pipeline. By using yfinance (free) and computed analysis (open source), you can replicate 80% of the value at 0% of the cost.

**5. You don't need a Bloomberg Terminal.** You need the right information, organized well, with good defaults and easy navigation. A dark theme and clean typography go further than you'd think.

---

### Try It Yourself

**Use the hosted version:** [equilima.com](https://equilima.com) — free, no credit card, works in your browser.

**Run it locally:**
```bash
git clone https://github.com/kavehkamali/equilima.git
cd equilima
cd backend && pip install -r requirements.txt && uvicorn app.main:app --port 8000 &
cd ../frontend && npm install && npm run dev
```

Open `localhost:5173` and you're in.

**Contribute:** The GitHub repo is at [github.com/kavehkamali/equilima](https://github.com/kavehkamali/equilima). Issues, PRs, and feature requests are welcome. The codebase is clean, well-organized, and documented.

---

### What's Next

The roadmap includes:
- **Real-time streaming** for the AI agent (word-by-word output)
- **Portfolio tracking** with P&L visualization
- **Options analysis** chain viewer
- **Stripe integration** for a premium tier (power features, not paywalls on basic analysis)
- **Mobile-optimized layout**
- **Community features** — shared watchlists, public analysis

But honestly? It already does more than my $2,400/year stack did. And it does it faster, in one tab, with a better UI.

If you're tired of paying for fragmented tools that each solve 20% of your problem, give Equilima a try. If you're a developer who's been wanting to build something in fintech, fork the repo and make it yours.

The market doesn't care what tools you use. But the right tools make it a lot easier to care about the market.

---

*Kaveh Kamali is a software engineer and quantitative researcher. Equilima is an open-source project released under the MIT license.*

*Disclaimer: Equilima is for educational and informational purposes only. It does not provide financial advice. Past performance is not indicative of future results. Always do your own research and consult a qualified financial advisor before making investment decisions.*

---

**Tags:** #AI #StockMarket #Trading #OpenSource #FinTech #MachineLearning #Investing #Python #React #DataScience

**If you found this useful, give it a clap 👏 and star the repo:** [github.com/kavehkamali/equilima](https://github.com/kavehkamali/equilima)

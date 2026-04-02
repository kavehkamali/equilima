"""
Seeking Alpha-style research data endpoints.
Comprehensive stock analysis: summary, financials, earnings, dividends, peers, ratings.
"""

from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
import math
from .cache import fetch_price_cached, fetch_fundamentals_cached

router = APIRouter(prefix="/api/research", tags=["research"])


def _safe(val, decimals=2):
    if val is None or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
        return None
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (float, np.floating)):
        return round(float(val), decimals)
    return val


def _fmt_large(v):
    if v is None:
        return None
    v = float(v)
    if abs(v) >= 1e12:
        return f"${v/1e12:.2f}T"
    if abs(v) >= 1e9:
        return f"${v/1e9:.2f}B"
    if abs(v) >= 1e6:
        return f"${v/1e6:.1f}M"
    return f"${v:,.0f}"


def _grade(value, thresholds, reverse=False):
    """Assign A-F grade based on value and thresholds [F,D,C,B,A]."""
    if value is None:
        return {"grade": "N/A", "score": None}
    grades = ["F", "D", "C", "B", "A"] if not reverse else ["A", "B", "C", "D", "F"]
    for i, t in enumerate(thresholds):
        if value < t:
            return {"grade": grades[i], "score": _safe(value)}
    return {"grade": grades[-1], "score": _safe(value)}


@router.get("/{symbol}")
def get_research(symbol: str):
    """Full Seeking Alpha-style research page data."""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}

        # ─── Summary / Key Stats ───
        price = _safe(info.get("currentPrice") or info.get("regularMarketPrice"))
        prev_close = _safe(info.get("previousClose") or info.get("regularMarketPreviousClose"))
        change = round(price - prev_close, 2) if price and prev_close else None
        change_pct = round((change / prev_close) * 100, 2) if change and prev_close else None

        summary = {
            "symbol": symbol,
            "name": info.get("longName") or info.get("shortName") or symbol,
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "description": info.get("longBusinessSummary", ""),
            "website": info.get("website"),
            "employees": info.get("fullTimeEmployees"),
            "country": info.get("country"),
            "exchange": info.get("exchange"),
            "currency": info.get("currency", "USD"),
            "price": price,
            "previous_close": prev_close,
            "change": change,
            "change_pct": change_pct,
            "open": _safe(info.get("open")),
            "day_high": _safe(info.get("dayHigh")),
            "day_low": _safe(info.get("dayLow")),
            "high_52w": _safe(info.get("fiftyTwoWeekHigh")),
            "low_52w": _safe(info.get("fiftyTwoWeekLow")),
            "market_cap": info.get("marketCap"),
            "market_cap_fmt": _fmt_large(info.get("marketCap")),
            "enterprise_value": info.get("enterpriseValue"),
            "enterprise_value_fmt": _fmt_large(info.get("enterpriseValue")),
            "volume": info.get("volume"),
            "avg_volume": info.get("averageVolume"),
            "avg_volume_10d": info.get("averageVolume10days"),
            "beta": _safe(info.get("beta")),
            "pe_trailing": _safe(info.get("trailingPE")),
            "pe_forward": _safe(info.get("forwardPE")),
            "peg_ratio": _safe(info.get("pegRatio")),
            "price_to_sales": _safe(info.get("priceToSalesTrailing12Months")),
            "price_to_book": _safe(info.get("priceToBook")),
            "ev_to_revenue": _safe(info.get("enterpriseToRevenue")),
            "ev_to_ebitda": _safe(info.get("enterpriseToEbitda")),
            "eps_trailing": _safe(info.get("trailingEps")),
            "eps_forward": _safe(info.get("forwardEps")),
            "dividend_rate": _safe(info.get("dividendRate")),
            "dividend_yield": _safe(info.get("dividendYield"), 4),
            "dividend_yield_pct": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else None,
            "ex_dividend_date": info.get("exDividendDate"),
            "payout_ratio": _safe(info.get("payoutRatio"), 4),
            "target_mean": _safe(info.get("targetMeanPrice")),
            "target_high": _safe(info.get("targetHighPrice")),
            "target_low": _safe(info.get("targetLowPrice")),
            "analyst_count": info.get("numberOfAnalystOpinions"),
            "recommendation": info.get("recommendationKey"),
            "recommendation_mean": _safe(info.get("recommendationMean")),
        }

        # ─── Profitability ───
        profitability = {
            "profit_margin": _safe(info.get("profitMargins"), 4),
            "profit_margin_pct": round(info.get("profitMargins", 0) * 100, 2) if info.get("profitMargins") else None,
            "operating_margin": _safe(info.get("operatingMargins"), 4),
            "operating_margin_pct": round(info.get("operatingMargins", 0) * 100, 2) if info.get("operatingMargins") else None,
            "gross_margin": _safe(info.get("grossMargins"), 4),
            "gross_margin_pct": round(info.get("grossMargins", 0) * 100, 2) if info.get("grossMargins") else None,
            "ebitda_margin": _safe(info.get("ebitdaMargins"), 4),
            "return_on_assets": _safe(info.get("returnOnAssets"), 4),
            "return_on_assets_pct": round(info.get("returnOnAssets", 0) * 100, 2) if info.get("returnOnAssets") else None,
            "return_on_equity": _safe(info.get("returnOnEquity"), 4),
            "return_on_equity_pct": round(info.get("returnOnEquity", 0) * 100, 2) if info.get("returnOnEquity") else None,
        }

        # ─── Growth ───
        growth = {
            "revenue_growth": _safe(info.get("revenueGrowth"), 4),
            "revenue_growth_pct": round(info.get("revenueGrowth", 0) * 100, 2) if info.get("revenueGrowth") else None,
            "earnings_growth": _safe(info.get("earningsGrowth"), 4),
            "earnings_growth_pct": round(info.get("earningsGrowth", 0) * 100, 2) if info.get("earningsGrowth") else None,
            "revenue": info.get("totalRevenue"),
            "revenue_fmt": _fmt_large(info.get("totalRevenue")),
            "revenue_per_share": _safe(info.get("revenuePerShare")),
            "earnings": info.get("netIncomeToCommon"),
            "earnings_fmt": _fmt_large(info.get("netIncomeToCommon")),
            "ebitda": info.get("ebitda"),
            "ebitda_fmt": _fmt_large(info.get("ebitda")),
            "free_cash_flow": info.get("freeCashflow"),
            "free_cash_flow_fmt": _fmt_large(info.get("freeCashflow")),
            "operating_cash_flow": info.get("operatingCashflow"),
            "operating_cash_flow_fmt": _fmt_large(info.get("operatingCashflow")),
        }

        # ─── Balance Sheet ───
        balance = {
            "total_cash": info.get("totalCash"),
            "total_cash_fmt": _fmt_large(info.get("totalCash")),
            "total_cash_per_share": _safe(info.get("totalCashPerShare")),
            "total_debt": info.get("totalDebt"),
            "total_debt_fmt": _fmt_large(info.get("totalDebt")),
            "debt_to_equity": _safe(info.get("debtToEquity")),
            "current_ratio": _safe(info.get("currentRatio")),
            "quick_ratio": _safe(info.get("quickRatio")),
            "book_value": _safe(info.get("bookValue")),
        }

        # ─── Ownership ───
        ownership = {
            "insider_pct": round(info.get("heldPercentInsiders", 0) * 100, 2) if info.get("heldPercentInsiders") else None,
            "institution_pct": round(info.get("heldPercentInstitutions", 0) * 100, 2) if info.get("heldPercentInstitutions") else None,
            "short_pct_float": round(info.get("shortPercentOfFloat", 0) * 100, 2) if info.get("shortPercentOfFloat") else None,
            "short_ratio": _safe(info.get("shortRatio")),
            "shares_outstanding": info.get("sharesOutstanding"),
            "shares_float": info.get("floatShares"),
            "shares_short": info.get("sharesShort"),
        }

        # ─── Quant Grades (SA-style) ───
        val_pe = info.get("trailingPE")
        val_pb = info.get("priceToBook")
        grw_rev = info.get("revenueGrowth")
        grw_earn = info.get("earningsGrowth")
        prof_margin = info.get("profitMargins")
        prof_roe = info.get("returnOnEquity")

        grades = {
            "valuation": _grade(val_pe, [12, 18, 25, 40], reverse=True) if val_pe else {"grade": "N/A", "score": None},
            "growth": _grade(grw_rev, [0, 0.05, 0.10, 0.20]) if grw_rev is not None else {"grade": "N/A", "score": None},
            "profitability": _grade(prof_margin, [0, 0.05, 0.10, 0.20]) if prof_margin is not None else {"grade": "N/A", "score": None},
            "momentum": None,  # computed from price data below
            "revisions": None,  # would need estimate data
        }

        # Momentum grade from price performance
        try:
            df = fetch_price_cached(symbol, period="1y")
            if len(df) > 60:
                close = df["close"]
                ret_3m = (float(close.iloc[-1]) / float(close.iloc[-63]) - 1) if len(close) > 63 else 0
                grades["momentum"] = _grade(ret_3m, [-0.10, -0.02, 0.05, 0.15])
        except Exception:
            pass

        # ─── Financials (quarterly + annual) ───
        financials_annual = []
        financials_quarterly = []

        try:
            inc = ticker.income_stmt
            if inc is not None and not inc.empty:
                for col in inc.columns[:4]:
                    row = {}
                    row["period"] = col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)
                    for idx in inc.index:
                        row[str(idx)] = _safe(inc.loc[idx, col])
                    financials_annual.append(row)
        except Exception:
            pass

        try:
            inc_q = ticker.quarterly_income_stmt
            if inc_q is not None and not inc_q.empty:
                for col in inc_q.columns[:8]:
                    row = {}
                    row["period"] = col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)
                    for idx in inc_q.index:
                        row[str(idx)] = _safe(inc_q.loc[idx, col])
                    financials_quarterly.append(row)
        except Exception:
            pass

        # ─── Earnings History ───
        earnings_history = []
        try:
            eh = ticker.earnings_dates
            if eh is not None and not eh.empty:
                for idx in eh.index[:12]:
                    row = {
                        "date": idx.strftime("%Y-%m-%d") if hasattr(idx, "strftime") else str(idx),
                    }
                    for col in eh.columns:
                        row[str(col)] = _safe(eh.loc[idx, col])
                    earnings_history.append(row)
        except Exception:
            pass

        # ─── Dividend History ───
        dividends = []
        try:
            divs = ticker.dividends
            if divs is not None and len(divs) > 0:
                for dt, val in list(divs.items())[-20:]:
                    dividends.append({
                        "date": dt.strftime("%Y-%m-%d") if hasattr(dt, "strftime") else str(dt),
                        "amount": round(float(val), 4),
                    })
        except Exception:
            pass

        # ─── News ───
        news = []
        try:
            raw_news = ticker.news or []
            for item in raw_news[:10]:
                content = item.get("content", {})
                title = content.get("title", "")
                if not title:
                    continue
                pub_date = content.get("pubDate", "")
                provider = content.get("provider", {})
                url = content.get("canonicalUrl", {}).get("url", "")
                thumbnail = None
                resolutions = content.get("thumbnail", {}).get("resolutions", [])
                if resolutions:
                    thumbnail = resolutions[0].get("url")
                news.append({
                    "title": title,
                    "url": url,
                    "source": provider.get("displayName", ""),
                    "date": pub_date,
                    "thumbnail": thumbnail,
                })
        except Exception:
            pass

        # ─── Balance Sheet (annual + quarterly) ───
        balance_sheet_annual = []
        balance_sheet_quarterly = []
        try:
            bs = ticker.balance_sheet
            if bs is not None and not bs.empty:
                for col in bs.columns[:4]:
                    row = {"period": col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)}
                    for idx in bs.index:
                        row[str(idx)] = _safe(bs.loc[idx, col])
                    balance_sheet_annual.append(row)
        except Exception:
            pass
        try:
            bs_q = ticker.quarterly_balance_sheet
            if bs_q is not None and not bs_q.empty:
                for col in bs_q.columns[:8]:
                    row = {"period": col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)}
                    for idx in bs_q.index:
                        row[str(idx)] = _safe(bs_q.loc[idx, col])
                    balance_sheet_quarterly.append(row)
        except Exception:
            pass

        # ─── Cash Flow (annual + quarterly) ───
        cashflow_annual = []
        cashflow_quarterly = []
        try:
            cf = ticker.cashflow
            if cf is not None and not cf.empty:
                for col in cf.columns[:4]:
                    row = {"period": col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)}
                    for idx in cf.index:
                        row[str(idx)] = _safe(cf.loc[idx, col])
                    cashflow_annual.append(row)
        except Exception:
            pass
        try:
            cf_q = ticker.quarterly_cashflow
            if cf_q is not None and not cf_q.empty:
                for col in cf_q.columns[:8]:
                    row = {"period": col.strftime("%Y-%m-%d") if hasattr(col, "strftime") else str(col)}
                    for idx in cf_q.index:
                        row[str(idx)] = _safe(cf_q.loc[idx, col])
                    cashflow_quarterly.append(row)
        except Exception:
            pass

        # ─── Insider Transactions ───
        insider_transactions = []
        try:
            it = ticker.insider_transactions
            if it is not None and not it.empty:
                for _, row_data in it.head(20).iterrows():
                    insider_transactions.append({
                        "date": str(row_data.get("Start Date", "")),
                        "insider": str(row_data.get("Insider", "")),
                        "position": str(row_data.get("Position", "")),
                        "transaction": str(row_data.get("Transaction", "")),
                        "shares": _safe(row_data.get("Shares")),
                        "value": _safe(row_data.get("Value")),
                    })
        except Exception:
            pass

        # ─── Institutional Holders ───
        institutional_holders = []
        try:
            ih = ticker.institutional_holders
            if ih is not None and not ih.empty:
                for _, row_data in ih.head(15).iterrows():
                    institutional_holders.append({
                        "holder": str(row_data.get("Holder", "")),
                        "shares": _safe(row_data.get("Shares")),
                        "date_reported": str(row_data.get("Date Reported", "")),
                        "pct_out": _safe(row_data.get("% Out"), 4),
                        "value": _safe(row_data.get("Value")),
                    })
        except Exception:
            pass

        # ─── Mutual Fund Holders ───
        fund_holders = []
        try:
            mf = ticker.mutualfund_holders
            if mf is not None and not mf.empty:
                for _, row_data in mf.head(10).iterrows():
                    fund_holders.append({
                        "holder": str(row_data.get("Holder", "")),
                        "shares": _safe(row_data.get("Shares")),
                        "date_reported": str(row_data.get("Date Reported", "")),
                        "pct_out": _safe(row_data.get("% Out"), 4),
                        "value": _safe(row_data.get("Value")),
                    })
        except Exception:
            pass

        # ─── Analyst Recommendations History ───
        recommendations = []
        try:
            rec = ticker.recommendations
            if rec is not None and not rec.empty:
                for idx_val, row_data in rec.tail(20).iterrows():
                    recommendations.append({
                        "date": idx_val.strftime("%Y-%m-%d") if hasattr(idx_val, "strftime") else str(idx_val),
                        "firm": str(row_data.get("Firm", "")),
                        "to_grade": str(row_data.get("To Grade", "")),
                        "from_grade": str(row_data.get("From Grade", "")),
                        "action": str(row_data.get("Action", "")),
                    })
                recommendations.reverse()
        except Exception:
            pass

        # ─── Risk Metrics ───
        risk_metrics = {}
        try:
            df = fetch_price_cached(symbol, period="2y")
            if len(df) > 60:
                close = df["close"]
                returns = close.pct_change().dropna()

                # Sharpe ratio (annualized, risk-free = 0)
                sharpe = float(returns.mean() / returns.std() * np.sqrt(252)) if returns.std() > 0 else 0
                # Sortino ratio
                downside = returns[returns < 0]
                sortino = float(returns.mean() / downside.std() * np.sqrt(252)) if len(downside) > 0 and downside.std() > 0 else 0
                # Max drawdown
                cummax = (1 + returns).cumprod().cummax()
                drawdown = ((1 + returns).cumprod() / cummax - 1)
                max_dd = float(drawdown.min()) * 100
                # Volatility
                vol_annual = float(returns.std() * np.sqrt(252) * 100)
                # VaR 95%
                var_95 = float(np.percentile(returns, 5) * 100)

                # Performance periods
                perf = {}
                for label, days in [("1W", 5), ("1M", 21), ("3M", 63), ("6M", 126), ("1Y", 252), ("2Y", 504)]:
                    if len(close) > days:
                        perf[label] = round((float(close.iloc[-1]) / float(close.iloc[-days - 1]) - 1) * 100, 2)

                risk_metrics = {
                    "sharpe_ratio": round(sharpe, 3),
                    "sortino_ratio": round(sortino, 3),
                    "max_drawdown": round(max_dd, 2),
                    "volatility_annual": round(vol_annual, 1),
                    "var_95": round(var_95, 2),
                    "performance": perf,
                    "beta": _safe(info.get("beta")),
                }
        except Exception:
            pass

        # ─── Revenue / Earnings Chart Data ───
        revenue_chart = []
        try:
            inc = ticker.income_stmt
            if inc is not None and not inc.empty:
                for col in reversed(list(inc.columns[:8])):
                    period = col.strftime("%Y") if hasattr(col, "strftime") else str(col)[:4]
                    rev = _safe(inc.loc["Total Revenue", col]) if "Total Revenue" in inc.index else None
                    ni = _safe(inc.loc["Net Income", col]) if "Net Income" in inc.index else None
                    gp = _safe(inc.loc["Gross Profit", col]) if "Gross Profit" in inc.index else None
                    oi = _safe(inc.loc["Operating Income", col]) if "Operating Income" in inc.index else None
                    revenue_chart.append({"period": period, "revenue": rev, "net_income": ni, "gross_profit": gp, "operating_income": oi})
        except Exception:
            pass

        # ─── Dividend Growth ───
        dividend_growth = {}
        try:
            divs_all = ticker.dividends
            if divs_all is not None and len(divs_all) >= 4:
                annual_divs = divs_all.resample("YE").sum()
                if len(annual_divs) >= 2:
                    latest = float(annual_divs.iloc[-1])
                    prev = float(annual_divs.iloc[-2])
                    dividend_growth["yoy"] = round((latest / prev - 1) * 100, 2) if prev > 0 else None
                if len(annual_divs) >= 4:
                    d3 = float(annual_divs.iloc[-4])
                    dividend_growth["cagr_3y"] = round((float(annual_divs.iloc[-1]) / d3) ** (1/3) - 1, 4) * 100 if d3 > 0 else None
                if len(annual_divs) >= 6:
                    d5 = float(annual_divs.iloc[-6])
                    dividend_growth["cagr_5y"] = round((float(annual_divs.iloc[-1]) / d5) ** (1/5) - 1, 4) * 100 if d5 > 0 else None
                # Consecutive years of growth
                years_growing = 0
                for i in range(len(annual_divs) - 1, 0, -1):
                    if float(annual_divs.iloc[i]) > float(annual_divs.iloc[i-1]):
                        years_growing += 1
                    else:
                        break
                dividend_growth["consecutive_years"] = years_growing
        except Exception:
            pass

        # ─── Wall Street Ratings Summary ───
        ratings_summary = {}
        try:
            rec_sum = ticker.recommendations_summary
            if rec_sum is not None and not rec_sum.empty:
                for _, row_data in rec_sum.iterrows():
                    period_label = str(row_data.get("period", ""))
                    ratings_summary[period_label] = {
                        "strong_buy": _safe(row_data.get("strongBuy")),
                        "buy": _safe(row_data.get("buy")),
                        "hold": _safe(row_data.get("hold")),
                        "sell": _safe(row_data.get("sell")),
                        "strong_sell": _safe(row_data.get("strongSell")),
                    }
        except Exception:
            pass

        # ─── Peer Comparison ───
        peers = []
        try:
            # Get peers from same sector
            sector = info.get("sector", "")
            from .stock_lists import SECTORS
            peer_symbols = []
            for sec_name, sec_syms in SECTORS.items():
                if sec_name.lower().startswith(sector.lower()[:5]) or symbol in sec_syms:
                    peer_symbols = [s for s in sec_syms if s != symbol][:8]
                    break

            for ps in peer_symbols:
                try:
                    pf = fetch_fundamentals_cached(ps)
                    peers.append({
                        "symbol": ps,
                        "name": pf.get("name", ps),
                        "market_cap": pf.get("market_cap"),
                        "market_cap_fmt": _fmt_large(pf.get("market_cap")),
                        "pe_ratio": pf.get("pe_ratio"),
                        "dividend_yield": pf.get("dividend_yield"),
                        "profit_margin": pf.get("profit_margin"),
                        "revenue_growth": pf.get("revenue_growth"),
                        "beta": pf.get("beta"),
                    })
                except Exception:
                    continue
        except Exception:
            pass

        # ─── Price chart data (1Y) ───
        chart = []
        try:
            df = fetch_price_cached(symbol, period="2y")
            for i in range(len(df)):
                chart.append({
                    "date": df.index[i].strftime("%Y-%m-%d"),
                    "close": round(float(df["close"].iloc[i]), 2),
                    "volume": int(df["volume"].iloc[i]),
                })
        except Exception:
            pass

        return {
            "summary": summary,
            "profitability": profitability,
            "growth": growth,
            "balance": balance,
            "ownership": ownership,
            "grades": grades,
            "financials_annual": financials_annual,
            "financials_quarterly": financials_quarterly,
            "balance_sheet_annual": balance_sheet_annual,
            "balance_sheet_quarterly": balance_sheet_quarterly,
            "cashflow_annual": cashflow_annual,
            "cashflow_quarterly": cashflow_quarterly,
            "earnings_history": earnings_history,
            "dividends": dividends,
            "dividend_growth": dividend_growth,
            "revenue_chart": revenue_chart,
            "news": news,
            "peers": peers,
            "chart": chart,
            "insider_transactions": insider_transactions,
            "institutional_holders": institutional_holders,
            "fund_holders": fund_holders,
            "recommendations": recommendations,
            "ratings_summary": ratings_summary,
            "risk_metrics": risk_metrics,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

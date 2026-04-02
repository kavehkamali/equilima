import { createContext, useContext, useReducer, useEffect } from 'react';

const STORAGE_KEY = 'terminal_state';

const defaultState = {
  layout: 1,
  focusedPane: 0,
  panes: [
    { symbol: 'AAPL', timeframe: '1y', interval: '1d' },
    { symbol: 'MSFT', timeframe: '1y', interval: '1d' },
    { symbol: 'GOOGL', timeframe: '1y', interval: '1d' },
    { symbol: 'NVDA', timeframe: '1y', interval: '1d' },
    { symbol: 'TSLA', timeframe: '1y', interval: '1d' },
    { symbol: 'META', timeframe: '1y', interval: '1d' },
  ],
  activeIndicators: ['sma_20', 'sma_50', 'volume'],
  watchlist: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN', 'JPM'],
  showAiPanel: true,
  showWatchlist: true,
  showPositionCalc: false,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch {}
  return defaultState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LAYOUT':
      return { ...state, layout: action.value };
    case 'SET_FOCUSED_PANE':
      return { ...state, focusedPane: action.value };
    case 'SET_SYMBOL': {
      const panes = [...state.panes];
      panes[action.pane] = { ...panes[action.pane], symbol: action.symbol };
      return { ...state, panes };
    }
    case 'SET_TIMEFRAME': {
      const panes = [...state.panes];
      panes[action.pane] = { ...panes[action.pane], timeframe: action.timeframe, interval: action.interval };
      return { ...state, panes };
    }
    case 'TOGGLE_INDICATOR': {
      const has = state.activeIndicators.includes(action.indicator);
      return {
        ...state,
        activeIndicators: has
          ? state.activeIndicators.filter(i => i !== action.indicator)
          : [...state.activeIndicators, action.indicator],
      };
    }
    case 'SET_INDICATORS':
      return { ...state, activeIndicators: action.indicators };
    case 'TOGGLE_AI_PANEL':
      return { ...state, showAiPanel: !state.showAiPanel };
    case 'TOGGLE_WATCHLIST':
      return { ...state, showWatchlist: !state.showWatchlist };
    case 'TOGGLE_POSITION_CALC':
      return { ...state, showPositionCalc: !state.showPositionCalc };
    case 'ADD_TO_WATCHLIST':
      if (state.watchlist.includes(action.symbol)) return state;
      return { ...state, watchlist: [...state.watchlist, action.symbol] };
    case 'REMOVE_FROM_WATCHLIST':
      return { ...state, watchlist: state.watchlist.filter(s => s !== action.symbol) };
    default:
      return state;
  }
}

const TerminalContext = createContext();

export function TerminalProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <TerminalContext.Provider value={{ state, dispatch }}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  return useContext(TerminalContext);
}

// Type definitions for TradingView datafeed
type ResolutionString = '1' | '5' | '15' | '30' | '60' | '240' | '1D';

interface SymbolInfo {
  name: string;
  ticker: string;
  type: string;
  session: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
}

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoryCallback {
  (bars: Bar[], meta: { noData: boolean }): void;
}

interface ErrorCallback {
  (error: any): void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const intervalMap: Record<ResolutionString, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '240': '4h',
  '1D': '1d',
};


const customDatafeed = {
  onReady: (callback: (config: { supported_resolutions: string[] }) => void) => {
    setTimeout(() => callback({
      supported_resolutions: Object.keys(intervalMap),
    }), 0);
  },

  resolveSymbol: (symbolName: string, onSymbolResolvedCallback: (symbolInfo: SymbolInfo) => void) => {
    setTimeout(() => {
      onSymbolResolvedCallback({
        name: symbolName,
        ticker: symbolName,
        type: 'crypto',
        session: '24x7',
        timezone: 'Etc/UTC',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        supported_resolutions: Object.keys(intervalMap),
        volume_precision: 2,
        data_status: 'streaming',
      });
    }, 0);
  },

  getBars: async (
    // symbolInfo: SymbolInfo,
    // resolution: ResolutionString,
    // from: number,
    // to: number,
    onHistoryCallback: HistoryCallback,
    onErrorCallback: ErrorCallback
  ) => {
    try {
      // const interval = intervalMap[resolution] || '5m';
      const url = `${BASE_URL}/api/v1/marketplace/chart?symbol=BTCUSDT&interval=5m&limit=50`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Candel data API response:', data);
      // Format data for TradingView
      const bars: Bar[] = data.map((item: any) => ({
        time: item.timestamp, // ms
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
      }));

      onHistoryCallback(bars, { noData: bars.length === 0 });
    } catch (err) {
      if (typeof onErrorCallback === 'function') {
        onErrorCallback(err);
      }
    }
  },

  // You can implement subscribeBars and other methods if you want live updates
};

export default customDatafeed;

export interface Stock {
  id: string;
  name: string;
  instrument_key: string;
  is_active: boolean;
}

export interface Instrument {
  id: string;
  instrument_seq: number;
  stock_id: string;
  trading_symbol: string;
  instrument_key: string;
  strike_price: number;
  instrument_type: "CE" | "PE" | "FUT";
  expiry: string;
  lot_size: number;
  exchange: string;
}

export interface Candle {
  bucket: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  open_interest: number;
}

export interface Tick {
  instrument_id: number;
  time_stamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  open_interest: number;
}

export interface Expiry {
  expiry: string;
}

export interface ApiResponse<T> {
  count: number;
  query_ms?: number;
  results: T[];
}

export interface TickApiResponse {
  count: number;
  total: number;
  limit: number;
  offset?: number;
  query_ms: number;
  results: Tick[];
}

export interface CandleApiResponse {
  count: number;
  interval: string;
  query_ms: number;
  results: Candle[];
}

export type Interval = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";

export interface OptionChainRow {
  strikePrice: number;
  ce?: Instrument;
  pe?: Instrument;
  ceLtp?: number;
  peLtp?: number;
  ceOi?: number;
  peOi?: number;
  ceVolume?: number;
  peVolume?: number;
}

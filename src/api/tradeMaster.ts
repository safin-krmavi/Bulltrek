import apiClient from '@/api/apiClient';
import type { AxiosResponse } from 'axios';

// Types
export interface TradeDirection {
  id: number;
  direction: string; // "BUY" | "SELL" | "HOLD"
}

// API Endpoints
export const directionApi = {
  
  getAll: (): Promise<AxiosResponse<TradeDirection[]>> => 
    apiClient.get('/directions'),

  
  create: (direction: string): Promise<AxiosResponse<TradeDirection>> =>
    apiClient.post('/directions', { direction }),

 
  getById: (id: number): Promise<AxiosResponse<TradeDirection>> =>
    apiClient.get(`/directions/${id}`),


  update: (id: number, direction: string): Promise<AxiosResponse<TradeDirection>> =>
    apiClient.put(`/directions/${id}`, { direction }),

  
  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/directions/${id}`)
};

//Quantities
export interface TradeQuantity {
    id: number;
    quantity: number; // e.g., 100 (shares), 0.5 (crypto)
  }
  
  export const quantityApi = {
    getAll: (): Promise<AxiosResponse<TradeQuantity[]>> => 
      apiClient.get('/quantities'),
  
    create: (quantity: number): Promise<AxiosResponse<TradeQuantity>> =>
      apiClient.post('/quantities', { quantity }),
  
    getById: (id: number): Promise<AxiosResponse<TradeQuantity>> =>
      apiClient.get(`/quantities/${id}`),
  
    update: (id: number, quantity: number): Promise<AxiosResponse<TradeQuantity>> =>
      apiClient.put(`/quantities/${id}`, { quantity }),
  
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/quantities/${id}`)
  };


export interface TradeAsset {
  id: number;
  symbol: string; // e.g., "BTC/USD", "INFY"
  asset_class?: string; // e.g., "crypto", "equity"
}

export const assetApi = {
  getAll: (): Promise<AxiosResponse<TradeAsset[]>> => 
    apiClient.get('/assets'),

  create: (symbol: string): Promise<AxiosResponse<TradeAsset>> =>
    apiClient.post('/assets', { symbol }),

  getById: (id: number): Promise<AxiosResponse<TradeAsset>> =>
    apiClient.get(`/assets/${id}`),

  update: (id: number, symbol: string): Promise<AxiosResponse<TradeAsset>> =>
    apiClient.put(`/assets/${id}`, { symbol }),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/assets/${id}`)
};


// Indicators
export interface TradeIndicator {
    id: number;
    name: string; // e.g., "RSI", "MACD"
    description?: string;
    default_config?: Record<string, any>; // Optional configuration
  }
  
  export const indicatorApi = {
    getAll: (): Promise<AxiosResponse<TradeIndicator[]>> => 
      apiClient.get('/indicators'),
  
    create: (name: string): Promise<AxiosResponse<TradeIndicator>> =>
      apiClient.post('/indicators', { name }),
  
    getById: (id: number): Promise<AxiosResponse<TradeIndicator>> =>
      apiClient.get(`/indicators/${id}`),
  
    update: (id: number, name: string): Promise<AxiosResponse<TradeIndicator>> =>
      apiClient.put(`/indicators/${id}`, { name }),
  
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/indicators/${id}`)
  };


  // Indicator Actions
  export interface IndicatorAction {
    id: number;
    action: string; // e.g., "BUY", "SELL", "HOLD"
    description?: string;
  }
  
  export const indicatorActionApi = {
    getAll: (): Promise<AxiosResponse<IndicatorAction[]>> => 
      apiClient.get('/indicator-actions'),
  
    create: (action: string): Promise<AxiosResponse<IndicatorAction>> =>
      apiClient.post('/indicator-actions', { action }),
  
    getById: (id: number): Promise<AxiosResponse<IndicatorAction>> =>
      apiClient.get(`/indicator-actions/${id}`),
  
    update: (id: number, action: string): Promise<AxiosResponse<IndicatorAction>> =>
      apiClient.put(`/indicator-actions/${id}`, { action }),
  
    delete: (id: number): Promise<AxiosResponse<void>> =>
      apiClient.delete(`/indicator-actions/${id}`)
  };

  // Values

export interface IndicatorValue {
  id: number;
  value: number;  // e.g., 70 (for RSI), 0.5 (for MACD)
  description?: string;
}

export const valueApi = {
  getAll: (): Promise<AxiosResponse<IndicatorValue[]>> => 
    apiClient.get('/values'),

  create: (value: number): Promise<AxiosResponse<IndicatorValue>> =>
    apiClient.post('/values', { value }),

  getById: (id: number): Promise<AxiosResponse<IndicatorValue>> =>
    apiClient.get(`/values/${id}`),

  update: (id: number, value: number): Promise<AxiosResponse<IndicatorValue>> =>
    apiClient.put(`/values/${id}`, { value }),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/values/${id}`)
};

// Trade Mapping

export interface TradeMapping {
  id: number;
  direction_id: number;       // Reference to Directions API (BUY/SELL)
  quantity_id: number;        // Reference to Quantities API
  asset_id: number;           // Reference to Assets API
  indicator_id: number;       // Reference to Indicators API
  indicator_action_id: number; // Reference to IndicatorActions API
  value_id: number;           // Reference to Values API
  created_at?: string;
}

export const tradeMappingApi = {
  getAll: (): Promise<AxiosResponse<TradeMapping[]>> => 
    apiClient.get('/trades'),

  create: (mapping: Omit<TradeMapping, 'id'|'created_at'>): Promise<AxiosResponse<TradeMapping>> =>
    apiClient.post('/trades', mapping),

  getById: (id: number): Promise<AxiosResponse<TradeMapping>> =>
    apiClient.get(`/trades/${id}`),

  update: (id: number, mapping: Partial<TradeMapping>): Promise<AxiosResponse<TradeMapping>> =>
    apiClient.put(`/trades/${id}`, mapping),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/trades/${id}`)
};
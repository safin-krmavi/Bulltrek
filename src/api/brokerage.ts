import apiClient from '@/api/apiClient';
import type { AxiosResponse } from 'axios';

//  Types 
export interface BrokerageBalance {
  equity: number;
  available: number;
  margin: number;
}

export interface BrokerageOrder {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface BrokerageTransaction {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface BrokerageMaster {
  id: number;
  name: string;
  website: string;
  description: string;
  brokerage_type: 'crypto' | 'equity';
  api_base_url: string;
  color_code: string;
}

export interface BrokerageConnection {
  id: number;
  brokerage_name: string;
  brokerage_api_key: string;
  brokerage_api_secret: string;
  brokerage_id: number;
  created_at: string;
  updated_at: string;
  brokerage: {
    id: number;
    name: string;
    website: string | null;
    registration_link: string | null;
    description: string | null;
    icon: string | null;
    color_code: string | null;
    brokerage_type: string | null;
    api_base_url: string | null;
    created_at: string;
    updated_at: string;
  };
}

//  Brokerage Master APIs 
export const brokerageMaster = {
  getAll: (): Promise<AxiosResponse<BrokerageMaster[]>> => 
    apiClient.get('/brokerage'),

  create: (data: FormData): Promise<AxiosResponse<BrokerageMaster>> =>
    apiClient.post('/brokerage', data),

  getById: (id: number): Promise<AxiosResponse<BrokerageMaster>> =>
    apiClient.get(`/brokerage/${id}`),

  update: (id: number, data: FormData): Promise<AxiosResponse<BrokerageMaster>> =>
    apiClient.post(`/brokerage/${id}`, data),

  delete: (id: number): Promise<AxiosResponse<void>> =>
    apiClient.delete(`/brokerage/${id}`)
};

//  Zerodha APIs 
export const zerodhaApi = {
  getBalance: (): Promise<AxiosResponse<BrokerageBalance>> => 
    apiClient.get('/brokerage/zerodha/balance'),

  getTransactions: (symbol?: string): Promise<AxiosResponse<BrokerageTransaction[]>> => 
    apiClient.get('/brokerage/zerodha/transaction/history', {
      params: { symbol }
    }),

  getLiveOrders: (symbol?: string): Promise<AxiosResponse<BrokerageOrder[]>> => 
    apiClient.get('/brokerage/zerodha/orders/live', {
      params: { symbol }
    }),

  placeOrder: (orderData: {
    symbol: string;
    exchange: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
    product: string;
    validity: string;
  }): Promise<AxiosResponse<{ order_id: string }>> => 
    apiClient.post('/brokerage/zerodha/order/execute', orderData)
};

//  Binance APIs 
export const binanceApi = {
  getBalance: (): Promise<AxiosResponse<BrokerageBalance>> => 
    apiClient.get('/brokerage/binance/balance'),

  getTransactions: (symbol?: string): Promise<AxiosResponse<BrokerageTransaction[]>> => 
    apiClient.get('/brokerage/binance/transaction/history', {
      params: { symbol }
    }),

  getLiveOrders: (symbol?: string): Promise<AxiosResponse<BrokerageOrder[]>> => 
    apiClient.get('/brokerage/binance/orders/live', {
      params: { symbol }
    }),

  placeOrder: (orderData: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    quantity: number;
  }): Promise<AxiosResponse<{ order_id: string }>> => 
    apiClient.post('/brokerage/binance/order/execute', orderData)
};

//  Brokerage Management 
export const brokerageService = {
  linkBrokerage: (data: {
    brokerage_name: 'zerodha' | 'binance';
    brokerage_api_key: string;
    brokerage_api_secret: string;
  }) => apiClient.put('/users/{id}/brokerages/details/link', data),

  getBrokerageDetails: () => 
    apiClient.get('/users/{id}/brokerages/details/fetch')
};
// API Connections endpoint for dashboard API Connect card
export const apiConnections = {
  getAll: () => apiClient.get('/brokerage/api-connections'),
};
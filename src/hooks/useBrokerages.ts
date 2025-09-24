import {
  binanceApi,
  brokerageMaster,
  brokerageService,
  zerodhaApi,
  apiConnections,
  type BrokerageBalance,
  type BrokerageMaster,
  type BrokerageOrder,
  type BrokerageTransaction
} from '@/api/brokerage';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Common hook for both brokerages
const useBrokerage = (brokerage: 'zerodha' | 'binance') => {
  const api = brokerage === 'zerodha' ? zerodhaApi : binanceApi;

  const balanceQuery = useQuery<BrokerageBalance>({
    queryKey: ['brokerage', brokerage, 'balance'],
    queryFn: () => api.getBalance().then(res => res.data)
  });

  const transactionsQuery = (symbol?: string) => useQuery<BrokerageTransaction[]>({
    queryKey: ['brokerage', brokerage, 'transactions', symbol],
    queryFn: () => api.getTransactions(symbol).then(res => res.data)
  });

  const ordersQuery = (symbol?: string) => useQuery<BrokerageOrder[]>({
    queryKey: ['brokerage', brokerage, 'orders', symbol],
    queryFn: () => api.getLiveOrders(symbol).then(res => res.data)
  });

  const placeOrder = useMutation({
    mutationFn: api.placeOrder,
    onSuccess: () => {
      toast.success('Order placed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  });

  return {
    balanceQuery,
    transactionsQuery,
    ordersQuery,
    placeOrder
  };
};

// Zerodha specific hook
export const useZerodha = () => useBrokerage('zerodha');

// Binance specific hook
export const useBinance = () => useBrokerage('binance');

// Brokerage management hooks
export const useBrokerageManagement = () => {
  const linkBrokerage = useMutation({
    mutationFn: brokerageService.linkBrokerage,
    onSuccess: () => {
      toast.success('Brokerage linked successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to link brokerage');
    }
  });

  // New API call for API Connect card
  const getApiConnections = useQuery({
    queryKey: ['apiConnections'],
    queryFn: () => apiConnections.getAll().then((res: any) => res.data)
  });

  // Keep old getBrokerageDetails for legacy use
  const getBrokerageDetails = useQuery({
    queryKey: ['brokerageDetails'],
    queryFn: () => brokerageService.getBrokerageDetails().then(res => res.data)
  });

  return {
    linkBrokerage,
    getBrokerageDetails,
    getApiConnections
  };
};

export const useBrokerageMaster = () => {
  const getAllBrokerages = useQuery<BrokerageMaster[]>({
    queryKey: ['brokeragesMaster'],
    queryFn: () => brokerageMaster.getAll().then(res => res.data)
  });

  const createBrokerage = useMutation({
    mutationFn: (data: FormData) => brokerageMaster.create(data),
    onSuccess: () => {
      toast.success('Brokerage created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create brokerage');
    }
  });

  const updateBrokerage = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData }) => 
      brokerageMaster.update(id, data),
    onSuccess: () => {
      toast.success('Brokerage updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update brokerage');
    }
  });

  const deleteBrokerage = useMutation({
    mutationFn: (id: number) => brokerageMaster.delete(id),
    onSuccess: () => {
      toast.success('Brokerage deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete brokerage');
    }
  });

  return {
    getAllBrokerages,
    createBrokerage,
    updateBrokerage,
    deleteBrokerage
  };
};

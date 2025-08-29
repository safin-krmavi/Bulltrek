import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';

interface StrategyCondition {
  indicator: string;
  action: string;
  value: number;
}

interface CreateStrategyData {
  user_id: number;
  name: string;
  conditions: StrategyCondition[];
  operators: string[];
  direction: string;
  quantity: number;
  asset: string;
  start_time: string;
  end_time: string;
}

interface StrategyResponse {
  status: string;
  message: string;
  data: {
    user_id: number;
    name: string;
    expression: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
  code: number;
}

export function useStrategy() {
  const queryClient = useQueryClient();

  const createStrategy = useMutation({
    mutationFn: async (data: CreateStrategyData) => {
      const response = await apiClient.post<StrategyResponse>(
        `/strategies`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });

  const updateStrategy = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateStrategyData> }) => {
      const response = await apiClient.put(`/strategies/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });

  const deleteStrategy = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/strategies/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies'] });
    },
  });

  return {
    createStrategy,
    updateStrategy,
    deleteStrategy,
  };
} 
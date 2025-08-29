//hooks for user profile

import apiClient from "@/api/apiClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUser() {
  const queryClient = useQueryClient();

  // Profile Data
  const profile = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiClient.get("/users/profile")
  });

  // Mutations
  const updateEmail = useMutation({
    mutationFn: (email: string) =>
      apiClient.put("/users/email", { email }),
    onSuccess: () => {
      toast.success("Email updated");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update email");
    }
  });

  const connectApi = useMutation({
    mutationFn: (apiId: number) =>
      apiClient.post("/apis/connect", { apiId }),
    onSuccess: () => {
      toast.success("API connected");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to connect API");
    }
  });

  const deletePlatform = useMutation({
    mutationFn: (platformId: number) =>
      apiClient.delete(`/platforms/${platformId}`),
    onSuccess: () => {
      toast.success("Platform deleted");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete platform");
    }
  });

  return {
    profile,
    mutations: {
      updateEmail,
      connectApi,
      deletePlatform
    }
  };
}
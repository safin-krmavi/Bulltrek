import apiClient from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";

interface RecoverPasswordRequest {
  newPassword: string;
  confirmPassword: string;
  token?: string; // For password reset tokens
}

interface RecoverPasswordResponse {
  status: string;
  message: string;
  code: number;
}

export function useRecoverPassword() {
  return useMutation<RecoverPasswordResponse, Error, RecoverPasswordRequest>({
    mutationFn: (data) => 
      apiClient.post("/reset-password", {
        password: data.newPassword,
        password_confirmation: data.confirmPassword,
        token: data.token
      })
        .then(res => res.data),
  });
} 
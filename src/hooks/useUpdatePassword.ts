import apiClient from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";

interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

interface UpdatePasswordResponse {
  status: string;
  message: string;
  code: number;
}

export function useUpdatePassword() {
  return useMutation<UpdatePasswordResponse, Error, UpdatePasswordRequest>({
    mutationFn: (data) => 
      apiClient.put("/users/2/update-password", data)
        .then(res => res.data),
  });
} 
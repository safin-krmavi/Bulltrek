import apiClient from "@/api/apiClient";
import { loginUser, registerUser } from "@/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const setAuthData = (token: string, user: any) => {
    localStorage.setItem("AUTH_TOKEN", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const clearAuthData = () => {
    localStorage.removeItem("AUTH_TOKEN");
    localStorage.removeItem("user");
  };

  // Login
  const login = useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      loginUser(payload.email, payload.password),
    onSuccess: (response) => {
      const token = response.token;
      const user = response.user;

      if (!token) {
        console.error("Login success but token missing:", response);
        toast.error("Login response missing token");
        return;
      }

      setAuthData(token, user);
      toast.success("Login successful");
      navigate("/dashboard");
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: any) => {
      const serverMsg =
        error?.response?.data?.message ??
        error?.message ??
        "Login failed";

      // surface field validation if present (e.g., username/email)
      const fieldMsg =
        error?.response?.data?.message?.username?.[0] ??
        error?.response?.data?.message?.email?.[0] ??
        error?.response?.data?.message?.password?.[0];

      toast.error(fieldMsg || serverMsg);
    }
  });

  // Register
  const register = useMutation({
    mutationFn: async (payload: any) => registerUser(payload),
    onSuccess: (response) => {
      const msg =
        response?.data?.message ||
        response?.message ||
        "Registration successful";
      toast.success(msg);
      navigate("/login");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Registration failed";
      const errors = error?.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach((err: any) => toast.error(err[0]));
      } else toast.error(errorMessage);
    }
  });

  // Recover password (request reset link)
  const recoverPassword = useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await apiClient.post("/forgot-password", payload);
      return data;
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Recovery email sent");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send recovery email");
    }
  });

  // Reset password
  const resetPassword = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.post("/reset-password", payload);
      return data;
    },
    onSuccess: (response) => {
      toast.success(response.data.message || "Password reset successful");
      navigate("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Password reset failed");
    }
  });

  const logout = () => {
    clearAuthData();
    queryClient.removeQueries(); // or be more specific with query keys
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return { login, register, logout, recoverPassword, resetPassword };
}
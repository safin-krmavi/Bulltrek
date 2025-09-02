import apiClient from './apiClient';

export interface AuthSuccess {
  token: string;
  user: Record<string, any> | null;
  raw: any;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Normalize any backend shape into { token, user, raw }
function normalizeAuthPayload(raw: any): AuthSuccess {
  const token =
    raw?.data?.token ??
    raw?.token ??
    raw?.access_token ??
    raw?.data?.access_token ??
    '';

  const user =
    raw?.data?.user ??
    raw?.user ??
    raw?.profile ??
    null;

  return { token, user, raw };
}

export async function loginUser(
  emailOrUsername: string,
  password: string
): Promise<AuthSuccess> {
  try {
    const { data } = await apiClient.post('/auth', {
      // send both to satisfy either validator
      username: emailOrUsername,
      email: emailOrUsername,
      password,
    });
    return normalizeAuthPayload(data);
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Login request failed';
    throw new Error(msg);
  }
}

export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  password: string;
  password_confirmation: string;
}): Promise<any> {
  try {
    const res = await apiClient.post('/signup', data);
    return res.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Registration failed';
    throw new Error(msg);
  }
}

export function logoutUser(): void {
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('user');
}

export function getToken(): string | null {
  return localStorage.getItem('AUTH_TOKEN');
}

export async function authFetch<T = any>(
  endpoint: string,
  config?: import('axios').AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient(endpoint, config);
    return response.data;
  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      'Request failed';
    throw new Error(msg);
  }
}
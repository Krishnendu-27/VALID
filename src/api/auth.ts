import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  officerId: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    officerId: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<LoginResponse>("/user/login", payload),

  register: (payload: FormData | RegisterPayload) =>
    api.post("/user/create", payload),

  getProfile: (id: string) => api.get(`/user/${id}`),

  updateProfile: (id: string, data: FormData | Partial<{ name: string; phone: string; avatarUrl: string }>) =>
    api.patch(`/user/edit/${id}`, data),
};


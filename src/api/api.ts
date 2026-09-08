import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL;
export const api = axios.create({
  baseURL: typeof rawBaseUrl === "string" && rawBaseUrl.trim() !== ""
    ? rawBaseUrl.trim().replace(/\/+$/, "")
    : "",
  withCredentials: true,
});


// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

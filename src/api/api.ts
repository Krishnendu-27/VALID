import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL;

export const BACKEND_CONFIGURED =
  typeof rawBaseUrl === "string" && rawBaseUrl.trim() !== "";

// In Vite development mode, route API calls through Vite dev proxy ('') to bypass ISP DNS restrictions
const baseURL = import.meta.env.DEV
  ? ""
  : (BACKEND_CONFIGURED ? rawBaseUrl.trim().replace(/\/+$/, "") : "");

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000,
});

// Request interceptor — attach JWT, block if no backend configured
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401, swallow network errors silently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    // Silently ignore network/DNS errors — backend may be offline
    if (!error?.response && (error?.code === "ERR_NETWORK" || error?.code === "ENOTFOUND" || error?.message?.includes("Network Error"))) {
      return Promise.reject(error); // still reject but caller should catch silently
    }
    return Promise.reject(error);
  }
);


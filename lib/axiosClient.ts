// src/lib/axiosClient.ts
import axios, { AxiosError } from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Le cookie HttpOnly est envoyé automatiquement
  headers: { Accept: "application/json" },
});

// --- Intercepteur réponse : 401 → broadcast multi-onglets
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      try { new BroadcastChannel("auth").postMessage({ type: "unauthorized" }); } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;

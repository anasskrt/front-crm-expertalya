// src/lib/axiosClient.ts
import axios, { AxiosError } from "axios";

// En production, utiliser le proxy local /api pour éviter les problèmes de mixed content (HTTPS → HTTP)
// En développement, on peut appeler directement le backend
const isServer = typeof window === "undefined";
const isDev = process.env.NODE_ENV === "development";

// Côté serveur (SSR), on utilise l'URL directe du backend
// Côté client en prod, on utilise le proxy /api
// Côté client en dev, on peut utiliser le proxy ou l'URL directe
const API_URL = isServer
  ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")
  : isDev
    ? (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "")
    : "/api";

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

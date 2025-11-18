// src/lib/axiosClient.ts
import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const JWT_COOKIE_NAME = "jwt";

// --- Helpers cookies (client only)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

// Lit le token depuis le cookie (fallback localStorage pour compat)
function getToken(): string | null {
  const fromCookie = getCookie(JWT_COOKIE_NAME);
  if (fromCookie) return fromCookie;
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem("token"); } catch { return null; }
}

// Construit l'URL effective (baseURL + url relative)
function effectiveUrl(config: InternalAxiosRequestConfig): string {
  const base = config.baseURL ?? API_URL ?? "";
  const url = config.url ?? "";
  try { return new URL(url, base || "http://localhost").toString(); }
  catch { return url; }
}

// Autorise l'Authorization seulement vers l'origin de l'API
function isAllowed(config: InternalAxiosRequestConfig): boolean {
  if (!API_URL) return true;
  try {
    const apiOrigin = new URL(API_URL).origin;
    const reqOrigin = new URL(effectiveUrl(config)).origin;
    return apiOrigin === reqOrigin;
  } catch { return false; }
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,           // enverra aussi le cookie (utile pour une future bascule HttpOnly)
  headers: { Accept: "application/json" },
});

// --- Intercepteur requête : injecte Authorization: Bearer <token> depuis le cookie
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isAllowed(config)) {
    const t = getToken();
    if (t) {
      config.headers = AxiosHeaders.from(config.headers || {});
      (config.headers as AxiosHeaders).set("Authorization", `Bearer ${t}`);
    }
  }
  return config;
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

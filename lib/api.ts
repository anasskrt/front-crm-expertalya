// Helper pour les appels API via le proxy Next.js

const API_BASE = "/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur serveur" }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }
  
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.blob() as Promise<T>;
}

export async function apiGet<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: { "Accept": "application/json" },
  });
  
  return handleResponse<T>(response);
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return handleResponse<T>(response);
}

export async function apiPatch<T = unknown>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  return handleResponse<T>(response);
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
    headers: { "Accept": "application/json" },
  });
  
  return handleResponse<T>(response);
}

export async function apiPostFormData<T = unknown>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  
  return handleResponse<T>(response);
}

export async function apiGetBlob(path: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Erreur ${response.status}`);
  }
  
  return response.blob();
}

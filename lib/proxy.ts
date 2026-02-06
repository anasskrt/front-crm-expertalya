import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export async function proxyRequest(
  request: NextRequest,
  backendPath: string,
  options?: { method?: string }
) {
  const method = options?.method || request.method;
  const url = `${BACKEND_URL}${backendPath}`;

  console.log(`[PROXY] ${method} -> ${url}`);
  console.log(`[PROXY] BACKEND_URL configured: ${BACKEND_URL ? "YES" : "NO - MISSING!"}`);
  console.log(`[PROXY] Full target URL: ${url}`);

  // Récupérer les headers importants
  const headers = new Headers();

  // Transférer le cookie d'authentification
  const cookie = request.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  // Transférer le content-type
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  // Transférer l'authorization si présent
  const authorization = request.headers.get("authorization");
  if (authorization) {
    headers.set("authorization", authorization);
  }

  headers.set("accept", "application/json");

  // User-Agent
  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("user-agent", userAgent);
  }

  // Préparer le body pour les requêtes avec contenu
  let body: BodyInit | null = null;
  if (method !== "GET" && method !== "HEAD") {
    const reqContentType = request.headers.get("content-type") || "";

    if (reqContentType.includes("multipart/form-data")) {
      body = await request.formData();
      headers.delete("content-type");
    } else {
      try {
        body = await request.text();
      } catch {
        body = null;
      }
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    console.log(`[PROXY] Response: ${response.status}`);
    
    // Log détaillé pour les erreurs
    if (response.status >= 400) {
      console.log(`[PROXY] Error response headers:`, Object.fromEntries(response.headers.entries()));
    }

    // Créer la réponse avec les headers du backend
    const responseHeaders = new Headers();

    // Transférer les cookies de réponse
    const setCookies = response.headers.getSetCookie?.() || [];
    if (setCookies.length > 0) {
      setCookies.forEach((c) => {
        responseHeaders.append("set-cookie", c);
      });
    } else {
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        responseHeaders.set("set-cookie", setCookie);
      }
    }

    // Transférer le content-type
    const respContentType = response.headers.get("content-type");
    if (respContentType) {
      responseHeaders.set("content-type", respContentType);
    }

    // Gérer les différents types de réponse
    if (respContentType?.includes("application/json")) {
      const data = await response.json();
      
      // Log le contenu de l'erreur pour le debug
      if (response.status >= 400) {
        console.log(`[PROXY] Error body:`, JSON.stringify(data));
      }
      
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    } else if (
      respContentType?.includes("application/vnd.openxmlformats") ||
      respContentType?.includes("application/octet-stream") ||
      respContentType?.includes("application/pdf")
    ) {
      const blob = await response.blob();
      const contentDisposition = response.headers.get("content-disposition");
      if (contentDisposition) {
        responseHeaders.set("content-disposition", contentDisposition);
      }
      return new NextResponse(blob, {
        status: response.status,
        headers: responseHeaders,
      });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error("[PROXY] Error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur", details: String(error) },
      { status: 502 }
    );
  }
}

export function getSearchParams(request: NextRequest): string {
  const searchParams = request.nextUrl.searchParams.toString();
  return searchParams ? `?${searchParams}` : "";
}

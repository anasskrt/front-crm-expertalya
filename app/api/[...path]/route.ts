import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "";

async function proxyRequest(request: NextRequest, path: string) {
  const url = `${BACKEND_URL}/${path}`;
  
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

  // Préparer le body pour les requêtes avec contenu
  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      // Pour les fichiers, on passe le formData
      body = await request.formData();
      // Supprimer le content-type pour laisser fetch le générer avec le boundary
      headers.delete("content-type");
    } else if (contentType.includes("application/json")) {
      body = await request.text();
    } else {
      body = await request.text();
    }
  }

  try {
    const response = await fetch(url, {
      method: request.method,
      headers,
      body,
      // Important: ne pas suivre les redirections automatiquement
      redirect: "manual",
    });

    // Créer la réponse avec les headers du backend
    const responseHeaders = new Headers();
    
    // Transférer les cookies de réponse (pour l'auth)
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      responseHeaders.set("set-cookie", setCookie);
    }
    
    // Transférer le content-type
    const respContentType = response.headers.get("content-type");
    if (respContentType) {
      responseHeaders.set("content-type", respContentType);
    }

    // Gérer les différents types de réponse
    if (respContentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    } else if (respContentType?.includes("application/vnd.openxmlformats") || 
               respContentType?.includes("application/octet-stream") ||
               respContentType?.includes("application/pdf")) {
      // Pour les fichiers (Excel, PDF, etc.)
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
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion au serveur" },
      { status: 502 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${pathString}?${searchParams}` : pathString;
  return proxyRequest(request, fullPath);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

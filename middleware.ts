// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Décode le payload d'un JWT (sans vérifier la signature - celle-ci est vérifiée côté backend)
 * Vérifie uniquement l'expiration pour éviter les appels inutiles avec un token expiré
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    // Décode le payload (partie 2 du JWT)
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8")
    );

    const exp = payload?.exp;
    if (typeof exp !== "number") return true;

    // Vérifie si le token est expiré (avec 60s de marge)
    const now = Math.floor(Date.now() / 1000);
    return exp < now - 60;
  } catch {
    // En cas d'erreur de décodage, considérer le token comme invalide
    return true;
  }
}

/**
 * Efface le cookie JWT expiré en retournant une réponse avec Set-Cookie
 */
function clearExpiredJwtAndRedirect(req: NextRequest, reason: string): NextResponse {
  const url = new URL("/login", req.url);
  url.searchParams.set("reason", reason);
  
  const response = NextResponse.redirect(url);
  // Efface le cookie côté client
  response.cookies.set("jwt", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  
  return response;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico";
  if (isApi || isStatic) return NextResponse.next();

  const jwtCookie = req.cookies.get("jwt")?.value;
  const hasJwt = Boolean(jwtCookie);
  const isLogin = pathname === "/login";
  const isPublic = isLogin || pathname.startsWith("/public");

  // Si on a un JWT, vérifier qu'il n'est pas expiré
  if (hasJwt && jwtCookie) {
    if (isJwtExpired(jwtCookie)) {
      // Token expiré → effacer et rediriger vers login
      return clearExpiredJwtAndRedirect(req, "expired");
    }
  }

  // Utilisateur connecté qui essaie d'accéder à /login → rediriger vers /
  if (isLogin && hasJwt) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Utilisateur non connecté sur une page protégée → rediriger vers /login
  if (!hasJwt && !isPublic) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!assets).*)"],
};

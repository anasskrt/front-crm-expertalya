// src/lib/jwtCookie.ts
export const JWT_COOKIE = "jwt";

/** Lit un cookie (client only) - utilisé uniquement pour vérifier la présence du cookie */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Vérifie si le cookie JWT existe (pour la UI uniquement, pas pour la sécurité) */
export function hasJwtCookie(): boolean {
  return getCookie(JWT_COOKIE) !== null;
}

// Note: setJwtCookie et clearJwtCookie ont été supprimés
// Le cookie HttpOnly est maintenant géré entièrement par le backend
// - Login: le backend définit le cookie via Set-Cookie
// - Logout: appeler POST /auth/logout pour effacer le cookie côté serveur

// src/lib/jwtCookie.ts
export const JWT_COOKIE = "jwt";

/** Lit un cookie (client only) */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/** Efface un cookie (client only) */
export function clearCookie(name: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Place le JWT dans un cookie, avec Max-Age calé sur exp si dispo */
export function setJwtCookie(jwt: string) {
  const maxAge = maxAgeFromJwt(jwt);
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${JWT_COOKIE}=${encodeURIComponent(jwt)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/** Lit le JWT depuis le cookie */
export function getJwtFromCookie(): string | null {
  return getCookie(JWT_COOKIE);
}

/** Efface le JWT cookie */
export function clearJwtCookie() {
  clearCookie(JWT_COOKIE);
}

function maxAgeFromJwt(jwt: string): number {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    const exp = Number(payload?.exp);
    const now = Math.floor(Date.now() / 1000);
    if (Number.isFinite(exp)) return Math.max(0, exp - now - 60); // -60s marge
  } catch {}
  return 60 * 60 * 24; // fallback 1 jour
}

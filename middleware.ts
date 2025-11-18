// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isStatic = pathname.startsWith("/_next") || pathname === "/favicon.ico";
  if (isApi || isStatic) return NextResponse.next();

  const hasJwt = Boolean(req.cookies.get("jwt")?.value);
  const isLogin = pathname === "/login";
  const isPublic = isLogin || pathname.startsWith("/public");

  if (isLogin && hasJwt) {
    return NextResponse.redirect(new URL("/", req.url));
  }

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

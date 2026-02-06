import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/user/favori
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/user/favori");
}

// PATCH /api/user/favori
export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "/user/favori");
}

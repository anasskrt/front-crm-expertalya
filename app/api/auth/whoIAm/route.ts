import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/auth/whoIAm
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/auth/whoIAm");
}

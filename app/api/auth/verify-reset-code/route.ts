import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/auth/verify-reset-code
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/verify-reset-code");
}

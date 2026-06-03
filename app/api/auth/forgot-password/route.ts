import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/forgot-password");
}

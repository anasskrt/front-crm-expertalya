import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/reset-password");
}

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/login");
}

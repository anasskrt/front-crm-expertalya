import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/auth/logout
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/auth/logout");
}

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/societe/short
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/societe/short");
}

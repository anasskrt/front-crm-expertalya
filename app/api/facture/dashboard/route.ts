import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/facture/dashboard
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/facture/dashboard");
}

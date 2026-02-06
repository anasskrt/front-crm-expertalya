import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/facture/analyseAll
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/facture/analyseAll");
}

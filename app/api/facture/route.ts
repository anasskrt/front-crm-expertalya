import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/facture
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/facture");
}

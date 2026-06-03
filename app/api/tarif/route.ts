import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// POST /api/tarif
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/tarif");
}

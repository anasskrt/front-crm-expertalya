import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

// GET /api/societe
export async function GET(request: NextRequest) {
  return proxyRequest(request, `/societe/${getSearchParams(request)}`);
}

// POST /api/societe
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/societe");
}

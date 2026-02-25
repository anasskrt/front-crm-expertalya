import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/activite
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/activite");
}

// POST /api/activite
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/activite");
}

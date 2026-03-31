import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/exercice
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/exercice");
}

// POST /api/exercice
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/exercice");
}

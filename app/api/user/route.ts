import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

// GET /api/user
export async function GET(request: NextRequest) {
  return proxyRequest(request, `/user${getSearchParams(request)}`);
}

// POST /api/user
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/user");
}

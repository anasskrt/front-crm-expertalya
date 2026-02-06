import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

// GET /api/task
export async function GET(request: NextRequest) {
  return proxyRequest(request, `/task${getSearchParams(request)}`);
}

// POST /api/task
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/task");
}

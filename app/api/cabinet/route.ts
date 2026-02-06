import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/cabinet
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/cabinet");
}

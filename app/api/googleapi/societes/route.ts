import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/googleapi/societes
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/googleapi/societes");
}

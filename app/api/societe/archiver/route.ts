import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

// GET /api/societe/archiver
export async function GET(request: NextRequest) {
  return proxyRequest(request, `/societe/archiver${getSearchParams(request)}`);
}

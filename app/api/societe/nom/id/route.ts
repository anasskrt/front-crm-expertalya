import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/societe/nom/id
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/societe/nom/id");
}

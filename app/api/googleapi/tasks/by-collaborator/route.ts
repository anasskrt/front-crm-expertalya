import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/googleapi/tasks/by-collaborator
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/googleapi/tasks/by-collaborator");
}

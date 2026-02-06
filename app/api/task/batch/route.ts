import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// PATCH /api/task/batch
export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "/task/batch");
}

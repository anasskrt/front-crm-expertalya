import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/task/[id] (get tasks by collaborateur)
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/task/${id}${getSearchParams(request)}`);
}

// PATCH /api/task/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/task/${id}`);
}

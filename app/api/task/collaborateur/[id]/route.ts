import { NextRequest } from "next/server";
import { proxyRequest, getSearchParams } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/task/collaborateur/[id]?statuts=...
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const searchParams = getSearchParams(request);
  return proxyRequest(request, `/task/collaborateur/${id}${searchParams}`);
}

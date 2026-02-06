import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/societe/[id]/documents
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/societe/${id}/documents`);
}

// PATCH /api/societe/[id]/documents
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/societe/${id}/documents`);
}

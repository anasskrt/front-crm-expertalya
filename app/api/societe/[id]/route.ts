import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/societe/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/societe/${id}`);
}

// DELETE /api/societe/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/societe/${id}`);
}

// PATCH /api/societe/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/societe/${id}`);
}

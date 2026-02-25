import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/activite/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/activite/${id}`);
}

// PATCH /api/activite/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/activite/${id}`);
}

// DELETE /api/activite/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/activite/${id}`);
}

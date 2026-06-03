import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/facture/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/facture/${id}`);
}

// DELETE /api/facture/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/facture/${id}`);
}

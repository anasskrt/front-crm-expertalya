import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// DELETE /api/user/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/user/${id}`);
}

// PATCH /api/user/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/user/${id}`);
}

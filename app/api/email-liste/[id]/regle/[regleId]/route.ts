import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ id: string; regleId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, regleId } = await params;
  return proxyRequest(request, `/email-liste/${id}/regle/${regleId}`);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id, regleId } = await params;
  return proxyRequest(request, `/email-liste/${id}/regle/${regleId}`);
}

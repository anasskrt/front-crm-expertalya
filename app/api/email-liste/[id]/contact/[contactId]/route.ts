import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ id: string; contactId: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id, contactId } = await params;
  return proxyRequest(request, `/email-liste/${id}/contact/${contactId}`);
}

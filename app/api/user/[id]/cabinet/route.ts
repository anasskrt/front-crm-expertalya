import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/user/[id]/cabinet
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/user/${id}/cabinet`);
}

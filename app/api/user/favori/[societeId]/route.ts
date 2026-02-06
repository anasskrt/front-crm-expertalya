import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ societeId: string }>;
}

// DELETE /api/user/favori/[societeId]
export async function DELETE(request: NextRequest, { params }: Params) {
  const { societeId } = await params;
  return proxyRequest(request, `/user/favori/${societeId}`);
}

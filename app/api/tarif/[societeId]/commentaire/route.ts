import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ societeId: string }>;
}

// PATCH /api/tarif/[id]/commentaire
export async function PATCH(request: NextRequest, { params }: Params) {
  const { societeId: id } = await params;
  return proxyRequest(request, `/tarif/${id}/commentaire`);
}

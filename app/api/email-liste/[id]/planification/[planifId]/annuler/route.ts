import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ id: string; planifId: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, planifId } = await params;
  return proxyRequest(request, `/email-liste/${id}/planification/${planifId}/annuler`);
}

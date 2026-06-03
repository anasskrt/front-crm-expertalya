import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ societeId: string }>;
}

// GET /api/facture/societe/[societeId]/bilan
export async function GET(request: NextRequest, { params }: Params) {
  const { societeId } = await params;
  return proxyRequest(request, `/facture/societe/${societeId}/bilan`);
}

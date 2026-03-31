import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ collaborateurId: string }>;
}

// GET /api/mission/manager/[collaborateurId] - Récupérer les missions d'un collaborateur (pour managers/admins)
export async function GET(request: NextRequest, { params }: Params) {
  const { collaborateurId } = await params;
  return proxyRequest(request, `/mission/manager/${collaborateurId}`);
}

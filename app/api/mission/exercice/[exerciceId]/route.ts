import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ exerciceId: string }>;
}

// GET /api/mission/exercice/[exerciceId] - Récupérer les missions d'un exercice
export async function GET(request: NextRequest, { params }: Params) {
  const { exerciceId } = await params;
  return proxyRequest(request, `/mission/exercice/${exerciceId}`);
}

// POST /api/mission/exercice/[exerciceId] - Créer une mission dans un exercice
export async function POST(request: NextRequest, { params }: Params) {
  const { exerciceId } = await params;
  return proxyRequest(request, `/mission/exercice/${exerciceId}`);
}

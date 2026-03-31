import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/mission/[id] - Récupérer une mission par ID
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/mission/${id}`);
}

// PATCH /api/mission/[id] - Mettre à jour une mission
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/mission/${id}`);
}

// DELETE /api/mission/[id] - Supprimer une mission
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/mission/${id}`);
}

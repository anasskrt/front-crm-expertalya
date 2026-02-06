import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/facture/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/facture/${id}`);
}

// POST /api/facture/[id] (create facture for societe)
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/facture/${id}`);
}

// PATCH /api/facture/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/facture/${id}`);
}

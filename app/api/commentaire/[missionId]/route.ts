import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ missionId: string }>;
}

// POST /api/commentaire/[missionId]
export async function POST(request: NextRequest, { params }: Params) {
  const { missionId } = await params;
  return proxyRequest(request, `/commentaire/${missionId}`);
}

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ societeId: string }>;
}

// POST /api/tarif/[societeId]
export async function POST(request: NextRequest, { params }: Params) {
  const { societeId } = await params;
  return proxyRequest(request, `/tarif/${societeId}`);
}

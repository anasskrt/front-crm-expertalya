import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// POST /api/document/[id]/upload
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/document/${id}/upload`);
}

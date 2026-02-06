import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/document/[id]
export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/document/${id}`);
}

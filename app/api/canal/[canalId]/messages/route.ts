import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ canalId: string }>;
}

// GET /api/canal/[canalId]/messages
export async function GET(request: NextRequest, { params }: Params) {
  const { canalId } = await params;
  return proxyRequest(request, `/canal/${canalId}/messages`);
}

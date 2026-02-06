import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params {
  params: Promise<{ canalId: string }>;
}

// POST /api/message/canal/[canalId]
export async function POST(request: NextRequest, { params }: Params) {
  const { canalId } = await params;
  return proxyRequest(request, `/message/canal/${canalId}`);
}

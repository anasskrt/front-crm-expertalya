import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  return proxyRequest(request, `/email-liste/${id}/planification`);
}

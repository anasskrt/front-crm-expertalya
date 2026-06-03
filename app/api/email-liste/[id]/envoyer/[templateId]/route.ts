import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ id: string; templateId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const { id, templateId } = await params;
  return proxyRequest(request, `/email-liste/${id}/envoyer/${templateId}`);
}

import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

interface Params { params: Promise<{ societeId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { societeId } = await params;
  return proxyRequest(request, `/email-liste/societe/${societeId}`);
}

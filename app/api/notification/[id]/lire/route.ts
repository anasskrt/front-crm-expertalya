import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return proxyRequest(request, `/notification/${params.id}/lire`);
}

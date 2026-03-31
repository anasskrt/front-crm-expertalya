import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, "/notification/lire-tout");
}

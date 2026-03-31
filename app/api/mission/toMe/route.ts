import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/mission/toMe - Récupérer les missions attribuées à l'utilisateur connecté
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/mission/toMe");
}

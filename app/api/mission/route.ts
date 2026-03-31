import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/mission - Récupérer toutes les missions du cabinet
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/mission");
}


// POST /api/mission - Créer une nouvelle mission
export async function POST(request: NextRequest) {
  return proxyRequest(request, "/mission");
}

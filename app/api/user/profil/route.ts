import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

// GET /api/user/profil
export async function GET(request: NextRequest) {
  return proxyRequest(request, "/user/profil");
}

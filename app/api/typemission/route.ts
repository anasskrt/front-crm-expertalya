import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  return proxyRequest(request, "/typemission");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "/typemission");
}

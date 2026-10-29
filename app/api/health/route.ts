import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    app: "GH Camiseteria - Landing Page & Catálogo Online",
    mode: "standalone",
    timestamp: new Date().toISOString(),
  });
}

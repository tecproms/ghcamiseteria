import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(
      "SELECT NOW() as current_time, current_database() as database_name, version() as pg_version"
    );
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      environment: process.env.NODE_ENV,
      serverTime: res.rows[0]?.current_time,
      databaseName: res.rows[0]?.database_name,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro de conexão ao banco de dados";
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        message,
      },
      { status: 503 }
    );
  }
}

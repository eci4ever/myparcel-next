import { NextResponse } from "next/server";
import sql from "@/app/lib/db";

export async function GET() {
  try {
    const result = await sql`SELECT NOW()`;
    return NextResponse.json({ message: "DB Connected ✅", time: result[0].now });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

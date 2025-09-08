import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(): Promise<Response> {
  try {
    const result = await sql`SELECT NOW()`;

    return NextResponse.json({
      message: "DB Connected ✅",
      time: result[0].now, // bergantung pada driver, biasanya Date object
    });
  } catch (err: unknown) {
    let message = "Unknown error occurred";

    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

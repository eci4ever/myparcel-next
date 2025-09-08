import { NextResponse } from "next/server";
import { fetchAllInvoices } from "@/lib/data";

export async function GET(): Promise<Response> {
  try {
    const customers = await fetchAllInvoices();

    return NextResponse.json({
      customers,
    });
  } catch (error: unknown) {
    console.error(error);

    let message = "Unknown error occurred";
    if (error instanceof Error) {
      message = error.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import sql from "@/app/lib/db";
import { fetchLatestInvoices } from "@/app/lib/data";
// Fetch Customers
async function getCustomers() {
  const customers = await sql`
    SELECT * FROM customers;
  `;
  return customers;
}

export async function GET() {
  try {
    // Fetch customers after seeding
    const customers = await fetchLatestInvoices();

    return Response.json({
      message: "Get customers successfully ✅",
      customers,
    });
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

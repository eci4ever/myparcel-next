import { fetchAllInvoices } from "@/lib/data";

export async function GET() {
  try {
    // Fetch customers after seeding
    const customers = await fetchAllInvoices();

    return Response.json({
      customers,
    });
  } catch (error: any) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

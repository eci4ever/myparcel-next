// app/dashboard/page.tsx
import { fetchAllInvoices } from "@/lib/data";
import { DataTableDemo } from "./ui/data-table";

export default async function Page() {
  const rows = await fetchAllInvoices();
  return <DataTableDemo data={rows} />;
}

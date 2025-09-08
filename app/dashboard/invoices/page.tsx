import { DataTable } from "@/app/dashboard/invoices/ui/data-table";
import { fetchAllInvoices } from "@/lib/data";

export default async function InvoicesPage() {
  const data = await fetchAllInvoices();
  // console.log("Latest Invoices:", data[0]);
  return (
    <div>
      <DataTable data={data} />
    </div>
  );
}

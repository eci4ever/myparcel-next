import { fetchAllInvoices } from "@/app/lib/data";
import { DataTable } from "@/components/invoices/data-table";

export default async function InvoicesPage() {
  const data = await fetchAllInvoices();
  // console.log("Latest Invoices:", data[0]);
  return (
    <div>
      <DataTable data={data} />
    </div>
  );
}

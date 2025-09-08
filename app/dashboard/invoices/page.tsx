import { DataTable } from "@/components/invoices/data-table";
import { fetchAllInvoices } from "@/app/lib/data";

export default async function InvoicesPage() {
  const data = await fetchAllInvoices();
  // console.log("Latest Invoices:", data[0]);
  return (
    <div>
      <DataTable data={data} />
    </div>
  );
}

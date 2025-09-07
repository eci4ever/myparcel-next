import { DataTable } from "@/components/invoices/data-table";
import { fetchAllInvoices } from "@/app/lib/data";

export default async function InvoicesPage() {
  const data = await fetchAllInvoices();
  console.log("Latest Invoices:", data[0]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

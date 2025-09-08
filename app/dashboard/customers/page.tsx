import { fetchAllCustomers } from "@/lib/data";
import { DataTable } from "./ui/data-table";

export default async function CustomersPage() {
  const customers = await fetchAllCustomers();
  return (
    <div>
      <DataTable data={customers} />
    </div>
  );
}

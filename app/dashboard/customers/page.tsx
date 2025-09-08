import { fetchAllCustomers } from "@/app/lib/data";
import { Customer } from "@/app/lib/definitions";

export default async function CustomersPage() {
  const customers = await fetchAllCustomers();
  return (
    <div className="px-4 lg:px-6">
      <h1>Selamat Datang</h1>
    </div>
  );
}

import { fetchAllCustomers } from "@/lib/data";

export default async function CustomersPage() {
  const data = await fetchAllCustomers();
  return (
    <div className="px-4 lg:px-6">
      <h1>Selamat Datang</h1>
    </div>
  );
}

import type { Metadata } from "next";
import { fetchCustomers, fetchInvoiceById } from "@/app/lib/data";
import Breadcrumbs from "@/components/invoices/breadcrumbs";
import Form from "@/components/invoices/edit-form";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  console.log("Editing Invoice:", invoice);
  console.log("Available Customers:", customers);
  return (
    <div className="px-4 lg:px-6">
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Invoices", href: "/dashboard/invoices" },
            {
              label: "Edit Invoice",
              href: `/dashboard/invoices/${id}/edit`,
              active: true,
            },
          ]}
        />
        <Form invoice={invoice} customers={customers} />
      </main>
    </div>
  );
}

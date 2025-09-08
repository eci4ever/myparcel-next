import type { Metadata } from "next";
import Breadcrumbs from "@/app/dashboard/invoices/ui/breadcrumbs";
import Form from "@/app/dashboard/invoices/ui/edit-form";
import { fetchCustomers, fetchInvoiceById } from "@/lib/data";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
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

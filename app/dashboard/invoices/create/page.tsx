import type { Metadata } from "next";
import Breadcrumbs from "@/app/dashboard/invoices/ui/breadcrumbs";
import Form from "@/app/dashboard/invoices/ui/create-form";
import { fetchCustomers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Add Invoice",
};

export default async function Page() {
  const customers = await fetchCustomers();
  return (
    <div className="px-4 lg:px-6">
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Invoices", href: "/dashboard/invoices" },
            {
              label: "Add Invoice",
              href: `/dashboard/invoices/create`,
              active: true,
            },
          ]}
        />
        <Form customers={customers} />
      </main>
    </div>
  );
}

import { fetchCustomers } from "@/app/lib/data";
import Breadcrumbs from "@/components/invoices/breadcrumbs";
import Form from "@/components/invoices/create-form";
import { Metadata } from "next";

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

import type { Metadata } from "next";
import Breadcrumbs from "@/app/dashboard/customers/ui/breadcrumbs";
import Form from "@/app/dashboard/customers/ui/edit-form";
import { fetchCustomerById } from "@/lib/data";

export const metadata: Metadata = {
  title: "Edit Customer",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const customer = await fetchCustomerById(id);
  return (
    <div className="px-4 lg:px-6">
      <main>
        <Breadcrumbs
          breadcrumbs={[
            { label: "Customers", href: "/dashboard/customers" },
            {
              label: "Edit Customer",
              href: `/dashboard/customers/${id}/edit`,
              active: true,
            },
          ]}
        />
        <Form customer={customer} />
      </main>
    </div>
  );
}

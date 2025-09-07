import Breadcrumbs from "@/components/invoices/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Invoice",
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

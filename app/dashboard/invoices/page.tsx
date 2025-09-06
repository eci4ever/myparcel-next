import { DataTable } from "@/components/data-table"
import { DataTableDemo } from "@/components/invoices/data-table"

export default function InvoicesPage() {
  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards /> */}
              <div className="px-4 lg:px-6">
                {/* <ChartAreaInteractive /> */} <DataTableDemo />
              </div>
             
            </div>
          </div>
        </div>
  )
}

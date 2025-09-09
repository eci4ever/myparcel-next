"use client";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconCircleCheckFilled,
  IconLoader,
  IconPlus,
  IconTrash,
  IconEdit, // Add Edit icon
  IconPencil, // Alternative edit icon
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import Image from "next/image";
import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { deleteCustomerAction, deleteCustomersAction } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image_url: z.string(),
  status: z.string(),
});

// Mock delete functions - replace with your actual API calls
const deleteCustomer = async (id: string) => {
  // Simulate API call
  await deleteCustomerAction(id);
  return { success: true, message: "Customer deleted successfully" };
};

const deleteCustomers = async (ids: string[]) => {
  // Simulate API call
  await deleteCustomersAction(ids);
  return {
    success: true,
    message: `${ids.length} customers deleted successfully`,
  };
};

const columns = (
  handleDelete: (id: string) => void,
): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "image_url",
    header: "Avatar",
    cell: ({ row }) => (
      <Image
        src={row.getValue("image_url")}
        alt={row.getValue("name")}
        width={40}
        height={40}
        className="h-10 w-10 mx-6 rounded-full object-cover"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-muted-foreground">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "active" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;
      const router = useRouter();

      return (
        <div className="flex justify-end gap-1">
          {" "}
          {/* Changed to gap for icon buttons */}
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200"
            onClick={() => router.push(`/dashboard/customers/${id}/edit`)}
            title="Edit customer"
          >
            <IconPencil size={16} />
          </Button>
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-700 hover:text-red-700 hover:bg-neutral-200"
            onClick={() => handleDelete(id)}
            title="Delete customer"
          >
            <IconTrash size={16} />
          </Button>
        </div>
      );
    },
  },
];

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteStatus, setDeleteStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Function to handle single customer deletion
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    setIsDeleting(true);
    setDeleteStatus(null);

    try {
      const result = await deleteCustomer(id);

      if (result.success) {
        setData((prevData) =>
          prevData.filter((customer) => customer.id !== id),
        );
        setDeleteStatus({ success: true, message: result.message });
      } else {
        setDeleteStatus({
          success: false,
          message: result.message || "Failed to delete customer",
        });
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setDeleteStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the customer",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  };

  // Function to handle multiple customer deletion
  const handleDeleteMultiple = async () => {
    const selectedRowIds = Object.keys(rowSelection);

    if (selectedRowIds.length === 0) {
      setDeleteStatus({
        success: false,
        message: "Please select at least one customer to delete",
      });
      setTimeout(() => setDeleteStatus(null), 3000);
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRowIds.length} customer(s)?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setDeleteStatus(null);

    try {
      const result = await deleteCustomers(selectedRowIds);

      if (result.success) {
        setData((prevData) =>
          prevData.filter((customer) => !selectedRowIds.includes(customer.id)),
        );
        setRowSelection({});
        setDeleteStatus({ success: true, message: result.message });
      } else {
        setDeleteStatus({
          success: false,
          message: result.message || "Failed to delete customers",
        });
      }
    } catch (error) {
      console.error("Failed to delete customers:", error);
      setDeleteStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the customers",
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  };

  const table = useReactTable({
    data,
    columns: columns(handleDelete),
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Tabs
      defaultValue="outline"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="w-full lg:w-96 bg-neutral-50 text-neutral-900 border-neutral-200 placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-neutral-200"
        />

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMultiple}
              disabled={isDeleting}
            >
              <IconTrash className="mr-1" size={16} />
              Delete Selected ({selectedCount})
            </Button>
          )}
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {deleteStatus && (
        <div
          className={`px-4 lg:px-6 ${deleteStatus.success ? "text-green-600" : "text-red-600"}`}
        >
          {deleteStatus.message}
        </div>
      )}

      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        {isDeleting && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-background p-4 rounded-lg border">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span>Deleting customer{selectedCount > 1 ? "s" : ""}...</span>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.getIsSelected() ? "bg-muted/50" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground flex flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

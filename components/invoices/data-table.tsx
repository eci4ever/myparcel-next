"use client";

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconLoader,
  IconPlus,
  IconTrash,
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
import { useRouter } from "next/navigation";
import * as React from "react";
import { z } from "zod";
import { deleteInvoiceAction, deleteInvoicesAction } from "@/app/lib/actions";
import { formatCurrency, formatDateToLocal } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
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

export const schema = z.object({
  id: z.uuid(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  amount: z.string(),
  date: z.string(),
  reviewer: z.string(),
});

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
    accessorKey: "name",
    header: "Customer",
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <div>{formatCurrency(row.getValue("amount"))}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <div>{formatDateToLocal(row.getValue("date"))}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "paid" ? (
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
      const id = row.original.id.toString();
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/invoices/${id}/edit`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDelete(id)}
              className="cursor-pointer"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => {
    // Sort initial data by date in descending order (newest first)
    return [...initialData].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    // Set initial sorting to date descending
    { id: "date", desc: true },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteStatus, setDeleteStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const router = useRouter();

  // Function to handle invoice deletion using server action
  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    setDeleteStatus(null);

    try {
      // Call the server action imported from the separate file
      const result = await deleteInvoiceAction(id);

      if (result.success) {
        // Update the local state to remove the deleted invoice
        setData((prevData) =>
          prevData.filter((invoice) => invoice.id.toString() !== id),
        );
        setDeleteStatus({ success: true, message: result.message });
      } else {
        setDeleteStatus({
          success: false,
          message: result.message || "Failed to delete invoice",
        });
      }
    } catch (error) {
      console.error("Failed to delete invoice:", error);
      setDeleteStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the invoice",
      });
    } finally {
      setIsDeleting(false);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setDeleteStatus(null);
      }, 3000);
    }
  };

  // Function to handle multiple invoice deletion
  const handleDeleteMultiple = async () => {
    const selectedRowIds = Object.keys(rowSelection);

    if (selectedRowIds.length === 0) {
      setDeleteStatus({
        success: false,
        message: "Please select at least one invoice to delete",
      });
      setTimeout(() => setDeleteStatus(null), 3000);
      return;
    }

    setIsDeleting(true);
    setDeleteStatus(null);

    try {
      // Call the server action for multiple deletion
      const result = await deleteInvoicesAction(selectedRowIds);

      if (result.success) {
        // Update the local state to remove the deleted invoices
        setData((prevData) =>
          prevData.filter(
            (invoice) => !selectedRowIds.includes(invoice.id.toString()),
          ),
        );
        // Clear selection
        setRowSelection({});
        setDeleteStatus({ success: true, message: result.message });
      } else {
        setDeleteStatus({
          success: false,
          message: result.message || "Failed to delete invoices",
        });
      }
    } catch (error) {
      console.error("Failed to delete invoices:", error);
      setDeleteStatus({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while deleting the invoices",
      });
    } finally {
      setIsDeleting(false);

      // Clear status message after 3 seconds
      setTimeout(() => {
        setDeleteStatus(null);
      }, 3000);
    }
  };

  // Function to add new invoice to the table
  const addNewInvoice = React.useCallback(
    (newInvoice: z.infer<typeof schema>) => {
      // Add new invoice at the beginning of the array
      setData((prevData) => [newInvoice, ...prevData]);

      // Reset to first page to show the new record
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  // Listen for new invoice events
  React.useEffect(() => {
    const handleNewInvoice = (event: CustomEvent) => {
      addNewInvoice(event.detail);
    };

    // Add event listener for custom event
    window.addEventListener("newInvoice", handleNewInvoice as EventListener);

    return () => {
      window.removeEventListener(
        "newInvoice",
        handleNewInvoice as EventListener,
      );
    };
  }, [addNewInvoice]);

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
    getRowId: (row) => row.id.toString(),
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
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter by email..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="w-full lg:w-96"
          />
        </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/invoices/create`)}
          >
            <IconPlus />
            <span className="hidden lg:inline">Add Invoice</span>
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
              <IconLoader className="animate-spin" />
              <span>Deleting invoice{selectedCount > 1 ? "s" : ""}...</span>
            </div>
          </div>
        )}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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
    </Tabs>
  );
}

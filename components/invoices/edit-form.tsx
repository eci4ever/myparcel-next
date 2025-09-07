"use client"

import type { CustomerField, InvoiceForm } from "@/app/lib/definitions"
import { CheckIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { updateInvoice, type State } from "@/app/lib/actions"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm
  customers: CustomerField[]
}) {
  const initialState: State = { message: null, errors: {} }
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id)
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState)

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="p-6">
          {/* Customer Name */}
          <div className="mb-6">
            <Label htmlFor="customer" className="text-sm font-medium">
              Choose customer
            </Label>
            <div className="relative mt-2">
              <Select name="customerId" defaultValue={invoice.customer_id}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <UserCircleIcon className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select a customer" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error display */}
            <div id="customer-error" aria-live="polite" aria-atomic="true">
              {state.errors?.customerId &&
                state.errors.customerId.map((error: string) => (
                  <p className="mt-2 text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Invoice Amount */}
          <div className="mb-6">
            <Label htmlFor="amount" className="text-sm font-medium">
              Choose an amount
            </Label>
            <div className="relative mt-2">
              <div className="relative">
                <CurrencyDollarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  defaultValue={invoice.amount}
                  step="0.01"
                  placeholder="Enter USD amount"
                  className="pl-10"
                  aria-describedby="amount-error"
                />
              </div>
            </div>

            {/* Error display */}
            <div id="amount-error" aria-live="polite" aria-atomic="true">
              {state.errors?.amount &&
                state.errors.amount.map((error: string) => (
                  <p className="mt-2 text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* Invoice Status */}
          <div className="mb-6">
            <Label className="text-sm font-medium">Set the invoice status</Label>
            <RadioGroup name="status" defaultValue={invoice.status} className="mt-2">
              <Card className="p-4">
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label
                      htmlFor="pending"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      Pending <ClockIcon className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paid" id="paid" />
                    <Label
                      htmlFor="paid"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                    >
                      Paid <CheckIcon className="h-4 w-4" />
                    </Label>
                  </div>
                </div>
              </Card>
            </RadioGroup>

            {/* Error display */}
            <div id="status-error" aria-live="polite" aria-atomic="true">
              {state.errors?.status &&
                state.errors.status.map((error: string) => (
                  <p className="mt-2 text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* General error message */}
          <div aria-live="polite" aria-atomic="true">
            {state.message ? <p className="my-2 text-sm text-destructive">{state.message}</p> : null}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoices">Cancel</Link>
        </Button>
        <Button type="submit">Edit Invoice</Button>
      </div>
    </form>
  )
}

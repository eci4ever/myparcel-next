"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, ClockIcon, UserCircleIcon, EnvelopeIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { type customerState, updateCustomer } from "@/lib/actions";
import type { Customer } from "@/lib/definitions";

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const initialState: customerState = { message: null, errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction] = useActionState(updateCustomerWithId, initialState);

  const [preview, setPreview] = useState<string>(customer.image_url || "");

  const handlePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="p-6">
          {/* Customer Name */}
          <div className="mb-6">
            <Label htmlFor="name">Customer Name</Label>
            <div className="relative mt-2">
              <UserCircleIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={customer.name}
                placeholder="Enter customer name"
                className="pl-10"
              />
            </div>
          </div>

          {/* Customer Email */}
          <div className="mb-6">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-2">
              <EnvelopeIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={customer.email}
                placeholder="Enter email address"
                className="pl-10"
              />
            </div>
          </div>

          {/* Customer Image */}
          <input type="hidden" name="existing_image_url" value={customer.image_url || ""} />
          <div className="mb-6">
            <Label htmlFor="image_file">Profile Image</Label>
            <Input
              id="image_file"
              name="image_file"
              type="file"
              accept="image/*"
              onChange={handlePreview}
              className="mt-2"
            />

            {preview && (
              <div className="mt-4">
                <Image
                  src={preview}
                  alt="Preview"
                  width={120}
                  height={120}
                  className="h-30 w-30 rounded-full object-cover border"
                />
              </div>
            )}
          </div>

          {/* Customer Status */}
          <div className="mb-6">
            <Label>Customer Status</Label>
            <RadioGroup
              name="status"
              defaultValue={customer.status || "active"}
              className="mt-2"
            >
              <Card className="p-4">
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="active" />
                    <Label htmlFor="active" className="flex items-center gap-1.5">
                      Active <CheckIcon className="h-4 w-4" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inactive" id="inactive" />
                    <Label htmlFor="inactive" className="flex items-center gap-1.5">
                      Inactive <ClockIcon className="h-4 w-4" />
                    </Label>
                  </div>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* General error message */}
          {state.message && (
            <p className="my-2 text-sm text-destructive">{state.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">Cancel</Link>
        </Button>
        <Button type="submit">Update Customer</Button>
      </div>
    </form>
  );
}

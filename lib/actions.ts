"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path, { join } from "path";
import fs from "fs/promises";
import sql from "./db";
// ...

export async function uploadCustomerImage(prevState: any, formData: FormData) {
  const file = formData.get("image") as File;
  const customerId = formData.get("customerId") as string;

  if (!file || !customerId) {
    return { error: "Missing file or customer ID" };
  }

  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { error: "Please upload an image file" };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "File size must be less than 5MB" };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `customer-${customerId}-${timestamp}.${extension}`;
    
    // Define upload path
    const uploadDir = join(process.cwd(), "public", "customers");
    const filePath = join(uploadDir, filename);

    // Ensure directory exists (you might want to create it if it doesn't exist)
    // For now, make sure public/customers directory exists manually

    // Write file
    await writeFile(filePath, buffer);

    // Return the public URL path
    const imageUrl = `/customers/${filename}`;

    // Update customer record in database (you'll need to implement this)
    // await updateCustomerImage(customerId, imageUrl);

    return { success: true, imageUrl };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload image" };
  }
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, { message: "Please select a customer." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"], {
    message: "Please select an invoice status.",
  }),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(_prevState: State, formData: FormData) {
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get("id"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().replace("T", " ").split(".")[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (_error) {
    // If a database error occurs, return a more specific error.
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  // Revalidate the cache for the invoices page and redirect the user.
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  _prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Update Invoice.",
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (_error) {
    return { message: "Database Error: Failed to Update Invoice." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoiceAction(id: string) {
  "use server";

  // Validate the ID
  if (!id || typeof id !== "string") {
    throw new Error("Invalid invoice ID");
  }

  try {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    revalidatePath("/dashboard/invoices");

    return { success: true, message: "Invoice deleted successfully" };
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw new Error("Failed to delete invoice");
  }
}

export async function deleteInvoicesAction(ids: string[]) {
  if (!ids || ids.length === 0) {
    throw new Error("No invoice IDs provided");
  }

  try {
    // Delete semua sekali gus
    await sql`DELETE FROM invoices WHERE id = ANY(${ids})`;

    // Refresh path
    revalidatePath("/dashboard/invoices");

    return {
      success: true,
      message: `${ids.length} invoice(s) deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting invoices:", error);
    throw new Error("Failed to delete invoices");
  }
}

export async function deleteCustomerAction(id: string) {
  "use server";

  // Validate the ID
  if (!id || typeof id !== "string") {
    throw new Error("Invalid customer ID");
  }

  try {
    await sql`DELETE FROM customers WHERE id = ${id}`;
    revalidatePath("/dashboard/customers");

    return { success: true, message: "customer deleted successfully" };
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
}

export async function deleteCustomersAction(ids: string[]) {
  if (!ids || ids.length === 0) {
    throw new Error("No customer IDs provided");
  }

  try {
    // Delete semua sekali gus
    await sql`DELETE FROM customers WHERE id = ANY(${ids})`;

    // Refresh path
    revalidatePath("/dashboard/customers");

    return {
      success: true,
      message: `${ids.length} customer(s) deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw new Error("Failed to delete customer");
  }
}

export type customerState = {
  errors?: {
    name?: string[];
    email?: string[];
    status?: string[];
    image_url?: string[];
  };
  message?: string | null;
};
// const UpdateCustomer = z.object({
//   name: z.string().min(1, { message: "Name is required" }),
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   image_url: z.preprocess(
//     (val) => val === "" ? null : val, // Transform empty string to null
//     z.union([
//       z.string().url({ message: "Please enter a valid URL" }),
//       z.null(),
//       z.undefined()
//     ]).optional()
//   ),
//   status: z.enum(['active', 'inactive']).default('active'),
// });

export async function updateCustomer(
  id: string,
  prevState: customerState,
  formData: FormData
): Promise<customerState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const status = formData.get("status") as string;

    // Ambil image lama dari form (hidden input)
    let image_url = formData.get("existing_image_url") as string;

    const file = formData.get("image_file") as File | null;
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "customers");
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${file.name}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);

      // Remove old image if exists
      if (image_url) {
        const oldImagePath = path.join(process.cwd(), "public", image_url);
        fs.unlink(oldImagePath).catch(() => {
          // Ignore error if file doesn't exist
        });
      }

      // Update ke gambar baru
      image_url = `/customers/${filename}`;
    }

    await sql`
      UPDATE customers
      SET name = ${name}, email = ${email}, status = ${status}, image_url = ${image_url}
      WHERE id = ${id}
    `;

    revalidatePath("/dashboard/customers");
    return { message: "Customer updated successfully." };
  } catch (err) {
    console.error("Update error:", err);
    return { message: "Failed to update customer.", errors: {} };
  }
  
}

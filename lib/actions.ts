"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import bcrypt from "bcrypt";
import { signIn, signOut } from "@/lib/auth";
import {
  insertInvoice,
  updateInvoiceById,
  deleteInvoiceById,
  deleteInvoicesByIds,
  createUser,
} from "./data";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Invalid credentials."
        : "Something went wrong.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

const SignUpSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUpUser(formData: FormData) {
  const parsed = SignUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  // Simulate user registration logic here

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  const newUser = await createUser(name, email, hashedPassword);
  console.log(newUser.error);
  if (newUser.error) {
    return { success: false, error: newUser.error };
  }

  await signIn("credentials", {
    email,
    password,
    redirect: true,
  });

  return { success: true, message: "User created" };
}

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string().min(1, { message: "Please select a customer." }),
  amount: z.coerce
    .number()
    .gt(0, { message: "Please enter an amount greater than $0." }),
  status: z.enum(["pending", "paid"]),
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
  const validated = CreateInvoice.safeParse({
    customerId: formData.get("customerId"), // fixed bug: guna "customerId"
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Missing Fields.",
    };
  }

  const { customerId, amount, status } = validated.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().replace("T", " ").split(".")[0];

  try {
    await insertInvoice(customerId, amountInCents, status, date);
  } catch {
    return { message: "Database Error." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function updateInvoice(
  id: string,
  _prevState: State,
  formData: FormData
) {
  const validated = UpdateInvoice.safeParse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Missing Fields.",
    };
  }

  const { customerId, amount, status } = validated.data;
  const amountInCents = amount * 100;

  try {
    await updateInvoiceById(id, customerId, amountInCents, status);
  } catch {
    return { message: "Database Error." };
  }

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoiceAction(id: string) {
  if (!id) throw new Error("Invalid ID");
  try {
    await deleteInvoiceById(id);
    revalidatePath("/dashboard/invoices");
    return { success: true, message: "Invoice deleted successfully" };
  } catch {
    throw new Error("Failed to delete invoice");
  }
}

export async function deleteInvoicesAction(ids: string[]) {
  if (!ids?.length) throw new Error("No IDs provided");
  try {
    await deleteInvoicesByIds(ids);
    revalidatePath("/dashboard/invoices");
    return {
      success: true,
      message: `${ids.length} invoice(s) deleted successfully`,
    };
  } catch {
    throw new Error("Failed to delete invoices");
  }
}

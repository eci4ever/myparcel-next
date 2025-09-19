import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import sql from "@/lib/db";
import { z } from "zod";
import type { User } from "@/lib/definitions";
import { authConfig } from "../auth.config";

/**
 * SafeUser = User tanpa password field
 */
type SafeUser = Omit<User, "password">;

/**
 * Fetch user by email from Postgres
 * @param email - user email
 * @returns User record or undefined
 */
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error("❌ Failed to fetch user:", error);
    throw new Error("Database query failed.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      async authorize(credentials): Promise<SafeUser | null> {
        // ✅ Validate input dengan Zod
        const parsed = z
          .object({
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password too short" }),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          console.warn("⚠️ Invalid input format:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;

        // ✅ Cari user dalam DB
        const user = await getUser(email);
        if (!user) {
          console.warn(`⚠️ User not found: ${email}`);
          return null;
        }

        // ✅ Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.warn(`⚠️ Wrong password for user: ${email}`);
          return null;
        }

        // ✅ Return SafeUser sahaja
        const { password: _pw, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],
});

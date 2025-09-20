import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import type { User } from "@/lib/definitions";
import { authConfig } from "../auth.config";
import { getUser } from "./data";

type SafeUser = Omit<User, "password">;

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      async authorize(credentials): Promise<SafeUser | null> {
        const parsed = z
          .object({
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password too short" }),
          })
          .safeParse(credentials);

        if (!parsed.success) {
          console.warn("Invalid input format:", parsed.error);
          return null;
        }

        const { email, password } = parsed.data;

        const user = await getUser(email);
        if (!user) {
          console.warn(`User not found: ${email}`);
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.warn(`Wrong password for user: ${email}`);
          return null;
        }

        // Return SafeUser sahaja
        const { password: _pw, ...safeUser } = user;
        return safeUser;
      },
    }),
  ],
});

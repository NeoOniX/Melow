/* eslint-disable @typescript-eslint/no-empty-object-type */
import { User as PrismaUser } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: PrismaUser & DefaultSession["user"];
  }

  interface User extends PrismaUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: PrismaUser["role"];
  }
}

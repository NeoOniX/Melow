import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";
import { compare } from "bcrypt";

class UserNotFoundError extends CredentialsSignin {
  code = "User not found";
}

class InvalidCredentialsError extends CredentialsSignin {
  code = "Invalid credentials";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
      },
      async authorize({ username, password }) {
        // Validate user credentials
        const user = await prisma.user.findUnique({
          where: { name: username as string },
        });

        if (!user) {
          throw new UserNotFoundError();
        }

        const passCorrect = await compare(password as string, user.password);

        if (passCorrect) {
          return user;
        } else {
          throw new InvalidCredentialsError();
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, trigger, session, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.role = user.role;
        token.updatedAt = user.updatedAt.getTime();
      }

      if (trigger === "update" && session?.user) {
        console.log("Updating user token with new session data");

        const updatedUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });

        if (updatedUser) {
          token.name = updatedUser.name;
          token.role = updatedUser.role;
          token.updatedAt = updatedUser.updatedAt.getTime();
        }
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.name = token.name as string;
      session.user.role = token.role as string;
      session.user.updatedAt = new Date(token.updatedAt as number);

      return session;
    },
  },
});

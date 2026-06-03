import type { NextAuthConfig } from "next-auth";

// Edge-safe config shared by middleware and the full server auth.
// No providers that pull in Node APIs (bcrypt) or Prisma live here.
export const authConfig: NextAuthConfig = {
  // Trust the host header (safe for local/self-hosted single-origin deploys).
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

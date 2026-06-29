import 'dotenv/config';
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from "bcrypt";

// Initialize your accelerated Prisma client instance
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

const authOptions: any = {
  adapter: PrismaAdapter(prisma as any),

  // 1. Change session strategy to JWT. 
  // Credentials providers do not support database session storage out-of-the-box.
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both an email and password.");
        }

        // 2. Look up the user inside your Neon database via Prisma
        // Ensure you add a `password` field (String type) to your User model in schema.prisma!
        const user: any = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase().trim(),
          },
        });

        if (!user.emailVerified) {
          throw new Error("Please activate your account via the email link sent to you before logging in.");
        }
        // If user doesn't exist or doesn't have a password set (e.g. social signup fallback)
        if (!user || !user.password) {
          throw new Error("No user found with those credentials.");
        }

        // 3. Compare the typed password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid password. Please try again.");
        }

        // Return user object to encode inside the JWT token session block
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'CUSTOMER',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // 4. Pass custom fields (like role) from authorize() down into the token payload
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // 5. Expose those token custom properties directly onto the client session object
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'CUSTOMER';
      }
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Allows relative callback URLs or falls back to home domain safety rules
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };
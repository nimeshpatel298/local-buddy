import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { withAccelerate } from '@prisma/extension-accelerate';

console.log("--- PRISMA DIAGNOSTICS ---");
console.log("DATABASE_URL from env:", process.env.DATABASE_URL ? "✅ Loaded" : "❌ UNDEFINED/EMPTY");
console.log("DIRECT_URL from env:", process.env.DIRECT_URL ? "✅ Loaded" : "❌ UNDEFINED/EMPTY");
if (process.env.DATABASE_URL) {
  console.log("DATABASE_URL starts with:", process.env.DATABASE_URL.substring(0, 15) + "...");
}
console.log("--------------------------");

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

//const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY || '');

const authOptions: any = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        try {
          console.log('[auth] sending verification email to:', identifier);
          console.log('[auth] verification url:', url);

          if (!process.env.RESEND_FROM) {
            throw new Error('RESEND_FROM is missing. Set it to a verified Resend sender.');
          }

          await resend.emails.send({
            from: process.env.RESEND_FROM,
            to: identifier,
            subject: 'Your sign-in link for LocalBuddy',
            html: `<p>Sign in to LocalBuddy by clicking the link below:</p><p><a href="${url}">Sign in</a></p>`,
          });
        } catch (e) {
          console.error('Resend error', e);
          throw e;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) session.user.role = user.role || 'CUSTOMER';
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // After sign-in via email link, send users to a UX completion page
      return '/auth/complete';
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions as any);

export { handler as GET, handler as POST };

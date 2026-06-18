import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();

const resend = new Resend(process.env.RESEND_API_KEY || '');

const authOptions: any = {
  adapter: PrismaAdapter(prisma as any),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier, url }) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM || 'no-reply@localbuddy.test',
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

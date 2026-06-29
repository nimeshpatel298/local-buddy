import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend'; // 
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL, 
}).$extends(withAccelerate())
// Initialize the Resend instance using your secret environment key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    const formattedEmail = email.toLowerCase().trim();

    if (!name || !formattedEmail || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 400 });
    }

    // 2. Hash password and generate activation token strings
    const hashedPassword = await bcrypt.hash(password, 10);
    const activationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours Expiry

    // Create a placeholder variable to reference our log record across blocks
    let emailLogId: string;

    // 3. Save User, Token, and Pending Log inside a single secure SQL transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          name,
          email: formattedEmail,
          password: hashedPassword,
          role: role || 'CUSTOMER',
          emailVerified: null, // Account is locked out from signing in initially
        },
      });

      await tx.verificationToken.create({
        data: {
          email: formattedEmail,
          token: activationToken,
          type: 'ACTIVATION',
          expires: tokenExpiry,
        },
      });

      const log = await tx.emailLog.create({
        data: {
          email: formattedEmail,
          type: 'ACTIVATION',
          status: 'PENDING',
        },
      });
      emailLogId = log.id;
    });

    // 4. Construct the Activation Target Callback Link
    const baseUrl = process.env.NEXTAUTH_URL;
    const activationLink = `${baseUrl}/api/activate?token=${activationToken}`;

    try {
      // 🚀 Send the email via Resend
      // Note: If you haven't domain-verified your custom domain yet, 
      // Resend requires you to send 'from' "onboarding@resend.dev" to your own registration email.
      await resend.emails.send({
        from: 'LocalBuddy <onboarding@resend.dev>',
        to: formattedEmail,
        subject: 'Activate your LocalBuddy Account',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #0f172a;">Welcome to LocalBuddy, ${name}!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Thanks for joining us. Before you can sign in and explore your dashboard, please confirm your email address by clicking the secure activation link below:
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${activationLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Activate Account
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">
              This link will expire in 24 hours. If you did not sign up for this account, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      // Update log to SUCCESS upon a flawless delivery payload response
      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { status: 'SUCCESS' },
      });

    } catch (emailError: any) {
      console.error('Resend delivery failure:', emailError);
      
      // Update log to FAILED and capture the exact response description strings
      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { 
          status: 'FAILED',
          error: emailError.message || 'Failed executing Resend API dispatcher client block.'
        },
      });
    }

    return NextResponse.json({ 
      message: 'Registration successful! Please check your mailbox to activate your profile layout.' 
    }, { status: 201 });

  } catch (error) {
    console.error('API Register Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
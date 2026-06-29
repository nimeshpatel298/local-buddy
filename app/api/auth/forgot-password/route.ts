import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import crypto from 'crypto';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const formattedEmail = email.toLowerCase().trim();

    if (!formattedEmail) {
      return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }

    // 1. Look up the user
    const user = await prisma.user.findUnique({
      where: { email: formattedEmail },
    });

    // 💡 Security Best Practice: If user doesn't exist, return a success message anyway.
    // This prevents attackers from enumerating valid email addresses on your platform.
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // Short expiry: 1 hour

    let emailLogId: string;

    // 2. Transactionally save token and create pending log record
    await prisma.$transaction(async (tx) => {
      // Clear out any old pending reset tokens for this user first
      await tx.verificationToken.deleteMany({
        where: { email: formattedEmail, type: 'PASSWORD_RESET' }
      });

      await tx.verificationToken.create({
        data: {
          email: formattedEmail,
          token: resetToken,
          type: 'PASSWORD_RESET',
          expires: tokenExpiry,
        },
      });

      const log = await tx.emailLog.create({
        data: {
          email: formattedEmail,
          type: 'PASSWORD_RESET',
          status: 'PENDING',
        },
      });
      emailLogId = log.id;
    });

    // 3. Construct URL pointing to your frontend input layout
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/forgot-password/reset?token=${resetToken}`;

    // 4. Send the Reset Email
    try {
      await resend.emails.send({
        from: 'LocalBuddy <onboarding@resend.dev>',
        to: formattedEmail,
        subject: 'Reset your LocalBuddy Password',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              We received a request to reset your password for your LocalBuddy account. Click the button below to choose a new password:
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${resetLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">
              This link is highly secure and will expire in 1 hour. If you did not make this request, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { status: 'SUCCESS' },
      });

    } catch (emailError: any) {
      console.error('Reset link delivery error:', emailError);
      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { 
          status: 'FAILED',
          error: emailError.message || 'Resend system failure during reset token dispatch.' 
        },
      });
    }

    return NextResponse.json({ message: 'If that email exists, a reset link has been sent.' }, { status: 200 });

  } catch (error) {
    console.error('Forgot password submission error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
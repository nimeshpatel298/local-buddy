import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=InvalidToken`);
  }

  try {
    // 1. Find and validate the activation token
    const dbToken = await prisma.verificationToken.findUnique({
      where: { token, type: 'ACTIVATION' }
    });

    if (!dbToken || dbToken.expires < new Date()) {
      return NextResponse.redirect(`${baseUrl}/login?error=TokenExpired`);
    }

    let emailLogId: string;
    let userName: string | null = '';

    // 2. Execute DB updates inside a transaction (Activate User, Remove Token, Log Pending Email)
    await prisma.$transaction(async (tx) => {
      // Update user to active state
      const updatedUser = await tx.user.update({
        where: { email: dbToken.email },
        data: { emailVerified: new Date() }
      });
      userName = updatedUser.name;

      // Delete the used token
      await tx.verificationToken.delete({
        where: { token }
      });

      // Log the initialization of the WELCOME email
      const log = await tx.emailLog.create({
        data: {
          email: dbToken.email,
          type: 'WELCOME',
          status: 'PENDING'
        }
      });
      emailLogId = log.id;
    });

    // 3. 🚀 Dispatch the Welcome Email via Resend asynchronously 
    try {
      await resend.emails.send({
        from: 'LocalBuddy <onboarding@resend.dev>',
        to: dbToken.email,
        subject: 'Welcome to LocalBuddy! 👋',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a;">Your account is fully activated!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Hi ${userName || 'there'}, your email has been successfully verified. Welcome to LocalBuddy! Your account is now fully operational, and you can access your customized dashboard layout right away.
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${baseUrl}/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
                Sign In to Your Dashboard
              </a>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              If you have any questions or need onboarding guidance, simply reply to this email to reach out to our team.
            </p>
          </div>
        `,
      });

      // Mark the welcome email log as SUCCESS
      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { status: 'SUCCESS' }
      });

    } catch (emailError: any) {
      console.error('Welcome email dispatch failed:', emailError);
      
      // Update log to FAILED with error breakdown context
      await prisma.emailLog.update({
        where: { id: emailLogId! },
        data: { 
          status: 'FAILED',
          error: emailError.message || 'Resend client execution failure during welcome transmission.'
        }
      });
    }

    // 4. Redirect the verified user to your login page with a success query string
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);

  } catch (error) {
    console.error('Activation workflow error:', error);
    return NextResponse.redirect(`${baseUrl}/login?error=ServerError`);
  }
}
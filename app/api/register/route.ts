import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
}).$extends(withAccelerate());

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 400 });
    }

    // Securely hash the plain-text password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user row directly to Neon database
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'CUSTOMER',
      },
    });

    return NextResponse.json({ message: 'User registered successfully', userId: newUser.id }, { status: 201 });

  } catch (error) {
    console.error('API Register Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
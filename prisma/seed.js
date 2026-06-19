import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from 'bcrypt'

// Initialize the accelerated client
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL, 
}).$extends(withAccelerate())

async function main() {
  // Generate a secure hash to reuse across the demo entities
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    { 
      email: 'admin@localbuddy.com', 
      name: 'Admin User', 
      role: 'ADMIN', 
      password: hashedPassword, 
      emailVerified: new Date() 
    },
    { 
      email: 'customer@localbuddy.com', 
      name: 'Demo Customer', 
      role: 'CUSTOMER', 
      password: hashedPassword, 
      emailVerified: new Date() 
    },
    { 
      email: 'buddy@localbuddy.com', 
      name: 'Demo Buddy', 
      role: 'BUDDY', 
      password: hashedPassword, 
      emailVerified: new Date() 
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { 
        name: u.name, 
        role: u.role, 
        password: u.password, // Updates older rows with the new hash
        emailVerified: u.emailVerified 
      },
      create: u,
    });
  }

  console.log('Seeded users: admin, customer, buddy (Default Password: password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// 💡 Prisma 7 requires the connection URL to be explicitly passed as accelerateUrl 
export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL, 
}).$extends(withAccelerate())

async function main() {
  const users = [
    { email: 'admin@localbuddy.com', name: 'Admin User', role: 'ADMIN', emailVerified: new Date() },
    { email: 'customer@localbuddy.com', name: 'Demo Customer', role: 'CUSTOMER', emailVerified: new Date() },
    { email: 'buddy@localbuddy.com', name: 'Demo Buddy', role: 'BUDDY', emailVerified: new Date() },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, emailVerified: u.emailVerified },
      create: u,
    });
  }

  console.log('Seeded users: admin, customer, buddy');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

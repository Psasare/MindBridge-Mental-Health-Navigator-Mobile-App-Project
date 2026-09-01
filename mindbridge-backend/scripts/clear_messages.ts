import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`DELETE FROM "ChatMessage"`;
  console.log('Cleared all chat messages via raw query');
}

main().catch(console.error).finally(() => prisma.$disconnect());

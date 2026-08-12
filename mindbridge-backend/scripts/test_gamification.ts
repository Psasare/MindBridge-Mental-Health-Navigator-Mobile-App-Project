import { GoalService } from './src/services/goal.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany();
  if (users.length === 0) { console.log('no users'); return; }
  
  for (const user of users) {
    const status = await GoalService.getGamificationStatus(user.id);
    console.log(`User ${user.id} Gamification Status:`);
    console.log(status);
  }
}

run().finally(() => prisma.$disconnect());

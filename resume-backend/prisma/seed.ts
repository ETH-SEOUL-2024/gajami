import { PrismaClient } from '@prisma/client';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  const user1 = await prisma.user.upsert({
    where: { nearAccountId: 'demoId.testnet' },
    update: {},
    create: {
      email: 'demoId@gmail.com',
      nearAccountId: 'demoId.testnet',
    },
  });
  const user1skill = await prisma.skill.create({
    data: {
      data: {
        'java': 'A',
        'solidity': 'B',
      },
      user: {
        connect: { id: user1.id },
      },
    },
  });
  const user2 = await prisma.user.upsert({
    where: { nearAccountId: 'fillYourId.testnet' },
    update: {},
    create: {
      email: 'fillYourId@gmail.com',
      nearAccountId: 'fillYourId.testnet',
    },
  });

  const user2skill = await prisma.skill.create({
    data: {
      data: {
        'java': 'A',
        'solidity': 'B',
      },
      reward: {
        ethBalance: "0.0002",
        nearBalance: "0.0001",
      },
      user: {
        connect: { id: user2.id },
      },
    },
  });

  const user2skill2 = await prisma.skill.create({
    data: {
      data: {
        'java': 'A',
        'solidity': 'A',
      },
      reward: {
        ethBalance: "0.0003",
        nearBalance: "0.0001",
      },
      user: {
        connect: { id: user2.id },
      },
    },
  });

  const user2skill3 = await prisma.skill.create({
    data: {
      data: {
        'java': 'A',
        'solidity': 'C',
      },
      reward: {
        ethBalance: "0.0001",
        nearBalance: "0.0001",
      },
      user: {
        connect: { id: user2.id },
      },
    },
  });

  console.log({ user1, user2 });
  console.log({ user1skill, user2skill, user2skill2, user2skill3 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });

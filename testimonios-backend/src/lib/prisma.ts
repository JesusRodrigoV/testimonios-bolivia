import { PrismaClient } from "@generated/prisma";

const logLevels = process.env.NODE_ENV === 'production'
  ? [
      { emit: 'stdout' as const, level: 'warn' as const },
      { emit: 'stdout' as const, level: 'error' as const },
    ]
  : [
      { emit: 'stdout' as const, level: 'query' as const },
      { emit: 'stdout' as const, level: 'info' as const },
      { emit: 'stdout' as const, level: 'warn' as const },
      { emit: 'stdout' as const, level: 'error' as const },
    ];

const prisma = new PrismaClient({ log: logLevels });

export default prisma;

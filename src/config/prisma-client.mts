import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import { PrismaClient, type Prisma } from '../generated/prisma/client.ts';

export const getDatabaseUrl = (): string => {
    const databaseUrl = process.env['DATABASE_URL'];
    if (databaseUrl === undefined || databaseUrl.trim() === '') {
        throw new Error(
            'DATABASE_URL ist nicht gesetzt. Nutze z.B. bun --env-file=.env ...',
        );
    }

    return databaseUrl;
};

const createLogConfig = (): (Prisma.LogLevel | Prisma.LogDefinition)[] => [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

export const createPrismaClient = (): PrismaClient<'query'> => {
    const adapter = new PrismaPg({
        connectionString: getDatabaseUrl(),
    });

    return new PrismaClient({
        adapter,
        errorFormat: 'pretty',
        log: createLogConfig(),
        comments: [prismaQueryInsights()],
    });
};

export const registerPrismaQueryLogger = (
    prisma: PrismaClient<'query'>,
): void => {
    prisma.$on('query', (event) => {
        const query = styleText('green', `Query: ${event.query}`);
        const duration = styleText('cyan', `Duration: ${event.duration} ms`);
        console.log(query);
        console.log(duration);
    });
};

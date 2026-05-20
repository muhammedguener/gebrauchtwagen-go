import { Hono } from 'hono';
import { createPrismaGebrauchtwagenService } from '../service/prisma-gebrauchtwagen-service.mts';
import type { GebrauchtwagenService } from '../service/gebrauchtwagen-service.mts';
import { createGebrauchtwagenReadRouter } from './gebrauchtwagen-read-router.mts';
import { createGebrauchtwagenWriteRouter } from './gebrauchtwagen-write-router.mts';

export const createGebrauchtwagenRouter = (
    service: GebrauchtwagenService = createPrismaGebrauchtwagenService(),
): Hono => {
    const router = new Hono();

    router.route('/', createGebrauchtwagenReadRouter(service));
    router.route('/', createGebrauchtwagenWriteRouter(service));

    return router;
};

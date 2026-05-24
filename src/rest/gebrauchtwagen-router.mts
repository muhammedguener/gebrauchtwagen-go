import { Hono } from 'hono';
import type {
    GebrauchtwagenReadService,
    GebrauchtwagenWriteService,
} from '../service/gebrauchtwagen-service.mts';
import { createGebrauchtwagenReadRouter } from './gebrauchtwagen-read-router.mts';
import { createGebrauchtwagenWriteRouter } from './gebrauchtwagen-write-router.mts';

export type GebrauchtwagenRouterServices = {
    readService: GebrauchtwagenReadService;
    writeService: GebrauchtwagenWriteService;
};

export const createGebrauchtwagenRouter = ({
    readService,
    writeService,
}: GebrauchtwagenRouterServices): Hono => {
    const router = new Hono();

    router.route('/', createGebrauchtwagenReadRouter(readService));
    router.route(
        '/',
        createGebrauchtwagenWriteRouter(readService, writeService),
    );

    return router;
};

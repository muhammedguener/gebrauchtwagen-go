import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { router as healthRouter } from './admin/health-router.mts';
import { corsOptions } from './config/cors.mts';
import { paths } from './config/paths.mts';
import { getLogger } from './logger/logger.mts';
import { requestLogger } from './logger/request-logger.mts';
import { responseTime } from './logger/response-time.mts';
import { createGebrauchtwagenRouter } from './rest/gebrauchtwagen-router.mts';
import type { GebrauchtwagenService } from './service/gebrauchtwagen-service.mts';

const notFoundStatus = 404;
const internalServerErrorStatus = 500;
const okStatus = 200;

const logger = getLogger('app', 'file');

const additionalSecurityHeaders = createMiddleware(async (context, next) => {
    context.header('X-Content-Type-Options', 'nosniff');
    context.header('X-Frame-Options', 'SAMEORIGIN');
    await next();
});

type AppOptions = {
    gebrauchtwagenService?: GebrauchtwagenService;
};

export const createApp = (options: AppOptions = {}): Hono => {
    const app = new Hono();

    app.use(
        secureHeaders(),
        cors(corsOptions),
        additionalSecurityHeaders,
        compress(),
        responseTime,
        requestLogger,
    );

    app.get(paths.root, (context) =>
        context.json({ app: 'gebrauchtwagen', status: 'up' }, okStatus),
    );
    app.route(paths.health, healthRouter);
    app.route(
        paths.rest,
        createGebrauchtwagenRouter(options.gebrauchtwagenService),
    );

    app.notFound((context) =>
        context.json(
            {
                error: 'NOT_FOUND',
                message: 'Route nicht gefunden',
            },
            notFoundStatus,
        ),
    );

    app.onError((err, context) => {
        logger.error(err, 'Interner Fehler');

        return context.json(
            {
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Interner Fehler',
            },
            internalServerErrorStatus,
        );
    });

    return app;
};

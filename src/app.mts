import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { gebrauchtwagenRouter } from './rest/gebrauchtwagen-router.mts';

const notFoundStatus = 404;
const internalServerErrorStatus = 500;
const okStatus = 200;

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:5173',
        'https://localhost:4200',
        'https://localhost:5173',
    ],
    allowMethods: ['DELETE', 'GET', 'HEAD', 'POST', 'PUT'],
    allowHeaders: [
        'Accept',
        'Authorization',
        'Content-Type',
        'If-Match',
        'If-None-Match',
        'Origin',
    ],
    exposeHeaders: [
        'Content-Type',
        'ETag',
        'Location',
        'Strict-Transport-Security',
        'X-Content-Type-Options',
    ],
    maxAge: 86_400,
};

const responseTime = createMiddleware(async (context, next) => {
    const start = Date.now();
    await next();
    context.header('X-Response-Time', `${Date.now() - start}ms`);
});

export const createApp = (): Hono => {
    const app = new Hono();

    app.use(secureHeaders(), cors(corsOptions), compress(), responseTime);

    app.get('/', (context) =>
        context.json({ app: 'gebrauchtwagen', status: 'up' }, okStatus),
    );
    app.get('/health', (context) => context.json({ status: 'ok' }, okStatus));
    app.route('/api/gebrauchtwagen', gebrauchtwagenRouter);

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
        console.error(err);

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

import { Hono } from 'hono';
import { gebrauchtwagenRouter } from './rest/gebrauchtwagen-router.mts';

export const createApp = (): Hono => {
    const app = new Hono();

    app.get('/health', (context) => context.json({ status: 'ok' }, 200));
    app.route('/api/gebrauchtwagen', gebrauchtwagenRouter);

    return app;
};

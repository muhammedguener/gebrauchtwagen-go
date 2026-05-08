import { serve } from '@hono/node-server';
import { afterAll, beforeAll } from 'vitest';
import { createApp } from '../../src/app.mts';

type MinimalServer = {
    close: () => void;
};

const port = Number(process.env['TEST_PORT'] ?? 4016);
const baseUrl = `http://127.0.0.1:${port}`;

let server: MinimalServer | undefined;

beforeAll(() => {
    process.env['TEST_BASE_URL'] = baseUrl;
    const app = createApp();
    server = serve({ fetch: app.fetch, port }) as MinimalServer;
});

afterAll(() => {
    server?.close();
});

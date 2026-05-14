import { serve } from '@hono/node-server';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { createApp } from '../../src/app.mts';
import {
    createFixtureGebrauchtwagenService,
    resetGebrauchtwagenFixtures,
} from '../../src/data/gebrauchtwagen-fixtures.mts';

type MinimalServer = {
    close: () => void;
};

const port = Number(process.env['TEST_PORT'] ?? 4016);
const baseUrl = `http://127.0.0.1:${port}`;

let server: MinimalServer | undefined;

beforeAll(() => {
    process.env['TEST_BASE_URL'] = baseUrl;
    const app = createApp({
        gebrauchtwagenService: createFixtureGebrauchtwagenService(),
    });
    server = serve({ fetch: app.fetch, port }) as MinimalServer;
});

beforeEach(() => {
    resetGebrauchtwagenFixtures();
});

afterAll(() => {
    server?.close();
});

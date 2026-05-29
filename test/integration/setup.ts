import { serve } from '@hono/node-server';
import { afterAll, beforeAll, beforeEach } from 'vitest';
import { createApp } from '../../src/app.mts';
import {
    createFixtureDevReloadService,
    createFixtureGebrauchtwagenService,
    resetGebrauchtwagenFixtures,
} from '../fixtures/gebrauchtwagen-fixtures.mts';

type MinimalServer = {
    close: () => void;
};

const workerId = Number(
    process.env['VITEST_POOL_ID'] ?? process.env['VITEST_WORKER_ID'] ?? 0,
);
const port = Number(process.env['TEST_PORT'] ?? 4016) + workerId;
const baseUrl = `http://127.0.0.1:${port}`;

let server: MinimalServer | undefined;

beforeAll(() => {
    process.env['TEST_BASE_URL'] = baseUrl;
    const app = createApp({
        gebrauchtwagenDevService: createFixtureDevReloadService(),
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

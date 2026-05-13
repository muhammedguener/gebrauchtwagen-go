import { serve } from '@hono/node-server';
import { createApp } from './app.mts';

const defaultPort = 3000;
const port = Number(process.env['PORT'] ?? defaultPort);
const app = createApp();

console.log(`Server läuft auf http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});

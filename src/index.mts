import { serve } from '@hono/node-server';
import { createApp } from './app.mts';

const port = Number(process.env['PORT'] ?? 3000);
const app = createApp();

console.log(`Server läuft auf http://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});

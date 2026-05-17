import { serve } from '@hono/node-server';
import { createApp } from './app.mts';
import { serverConfig } from './config/server.mts';
import { banner } from './logger/banner.mts';

const { port } = serverConfig;
const app = createApp();

banner();

serve({
    fetch: app.fetch,
    port,
});

import { Hono } from 'hono';
import { register } from 'prom-client';
import { statuscode } from '../rest/statuscode.mts';

export const router = new Hono();

router.get('/', async (context) => {
    const metrics = await register.metrics();
    context.header('Content-Type', register.contentType);

    return context.text(metrics, statuscode.ok);
});

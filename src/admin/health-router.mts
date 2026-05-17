import { Hono } from 'hono';

const okStatus = 200;

export const router = new Hono();

router.get('/', (context) => context.json({ status: 'ok' }, okStatus));
router.get('/liveness', (context) => context.json({ status: 'up' }, okStatus));
router.get('/readiness', (context) => context.json({ status: 'up' }, okStatus));

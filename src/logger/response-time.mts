import { createMiddleware } from 'hono/factory';
import { getLogger } from './logger.mts';

const logger = getLogger('responseTime', 'func');

export const responseTime = createMiddleware(async (context, next) => {
    const start = Date.now();
    await next();

    const duration = Date.now() - start;
    context.header('X-Response-Time', `${duration}ms`);
    logger.info(
        {
            duration,
            status: context.res.status,
        },
        'Response',
    );
});

import { createMiddleware } from 'hono/factory';
import { getLogger } from './logger.mts';

const logger = getLogger('requestLogger', 'func');

export const requestLogger = createMiddleware(async (context, next) => {
    const { method, url } = context.req;
    logger.info({ method, url }, 'Request');
    await next();
});

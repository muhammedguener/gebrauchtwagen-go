import pino from 'pino';
import { env } from './env.mts';

export const parentLogger = pino({
    level: env.logLevel,
});

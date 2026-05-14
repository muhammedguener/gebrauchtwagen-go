import process from 'node:process';

export const env = {
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
    logLevel: process.env['LOG_LEVEL'] ?? 'info',
    port: process.env['PORT'],
};

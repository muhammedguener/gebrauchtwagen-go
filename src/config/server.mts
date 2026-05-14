import { hostname } from 'node:os';
import { env } from './env.mts';

const defaultPort = 3000;

export const serverConfig = {
    host: hostname(),
    nodeEnv: env.nodeEnv,
    port: Number(env.port ?? defaultPort),
};

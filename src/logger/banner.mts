import Bun from 'bun'; // eslint-disable-line @typescript-eslint/naming-convention
import { release, type, userInfo } from 'node:os';
import process from 'node:process';
import { serverConfig } from '../config/server.mts';
import { getLogger } from './logger.mts';

const logger = getLogger('banner', 'func');

export const banner = (): void => {
    const { host, nodeEnv, port } = serverConfig;

    logger.info('Gebrauchtwagen-Appserver gestartet');
    logger.info('Bun: %s', Bun.version);
    logger.info('Bun / Node: %s', process.version);
    logger.info('NODE_ENV: %s', nodeEnv);
    logger.info('Rechnername: %s', host);
    logger.info('Port: %d', port);
    logger.info('Betriebssystem: %s (%s)', type(), release());
    logger.info('Username: %s', userInfo().username);
};

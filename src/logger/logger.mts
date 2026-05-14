import type pino from 'pino';
import { parentLogger } from '../config/logger.mts';

export const getLogger = (
    context: string,
    kind = 'class',
): pino.Logger<string> => parentLogger.child({ [kind]: context });

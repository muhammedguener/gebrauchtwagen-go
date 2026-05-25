import { ZodError } from 'zod';
import { parseGebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import type { GebrauchtwagenReadService } from '../service/gebrauchtwagen-service.mts';
import { isPositiveId } from '../rest/gebrauchtwagen-validation.mts';
import {
    toBadUserInput,
    toInternalError,
    toValidationError,
} from './errors.mts';
import {
    type GebrauchtwagenSearchInput,
    type ID,
    toGebrauchtwagenType,
    toNumber,
} from './types.mts';

export const findGebrauchtwagenHandler = async (
    service: GebrauchtwagenReadService,
    id: ID,
) => {
    const numericId = toNumber(id);
    if (!isPositiveId(numericId)) {
        throw toBadUserInput('id muss eine positive ganze Zahl sein');
    }

    const fahrzeug = await service.findById(numericId);
    if (fahrzeug === undefined) {
        throw toBadUserInput(
            `Kein Gebrauchtwagen mit id=${numericId} gefunden`,
        );
    }

    return toGebrauchtwagenType(fahrzeug);
};

export const listGebrauchtwagenHandler = async (
    service: GebrauchtwagenReadService,
    input?: GebrauchtwagenSearchInput,
) => {
    try {
        const search = parseGebrauchtwagenSearchParams(input ?? {});
        const result = await service.list(search);

        return {
            ...result,
            data: result.data.map((fahrzeug) => toGebrauchtwagenType(fahrzeug)),
        };
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            throw toValidationError(err);
        }

        const { message } = err as Error;
        throw toInternalError(message);
    }
};

import { ZodError } from 'zod';
import type {
    GebrauchtwagenReadService,
    GebrauchtwagenWriteService,
} from '../service/gebrauchtwagen-service.mts';
import {
    gebrauchtwagenBodySchema,
    isPositiveId,
} from '../rest/gebrauchtwagen-validation.mts';
import {
    toBadUserInput,
    toForbidden,
    toInternalError,
    toUnauthorized,
    toValidationError,
} from './errors.mts';
import {
    type DeletePayload,
    type GebrauchtwagenInput,
    type ID,
    type UpdatePayload,
    toGebrauchtwagenType,
    toNumber,
} from './types.mts';

type UpdateGebrauchtwagenParams = {
    readService: GebrauchtwagenReadService;
    writeService: GebrauchtwagenWriteService;
    request: Request;
    id: ID;
    version: number;
    input: GebrauchtwagenInput;
};

const adminTokens = new Set(['admin-token']);

const requireAdminAuthorization = (request: Request): void => {
    const authorization = request.headers.get('authorization');
    if (authorization === null || !authorization.startsWith('Bearer ')) {
        throw toUnauthorized('Bearer-Token fehlt');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!adminTokens.has(token)) {
        throw toForbidden('Admin-Rolle erforderlich');
    }
};

export const createGebrauchtwagenHandler = async (
    service: GebrauchtwagenWriteService,
    request: Request,
    input: GebrauchtwagenInput,
) => {
    requireAdminAuthorization(request);

    try {
        const payload = gebrauchtwagenBodySchema.parse(input);
        const created = await service.create(payload);

        return toGebrauchtwagenType(created);
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            throw toValidationError(err);
        }

        const { message } = err as Error;
        throw toInternalError(message);
    }
};

export const updateGebrauchtwagenHandler = async ({
    readService,
    writeService,
    request,
    id,
    version,
    input,
}: UpdateGebrauchtwagenParams): Promise<UpdatePayload> => {
    requireAdminAuthorization(request);

    const numericId = toNumber(id);
    if (!isPositiveId(numericId)) {
        throw toBadUserInput('id muss eine positive ganze Zahl sein');
    }

    const current = await readService.findById(numericId);
    if (current === undefined) {
        throw toBadUserInput(
            `Kein Gebrauchtwagen mit id=${numericId} gefunden`,
        );
    }
    if (current.version !== version) {
        throw toBadUserInput(`Version ${version} ist nicht mehr aktuell`);
    }

    try {
        const payload = gebrauchtwagenBodySchema.parse(input);
        const updated = await writeService.update(numericId, payload);

        return { version: updated?.version ?? version + 1 };
    } catch (err: unknown) {
        if (err instanceof ZodError) {
            throw toValidationError(err);
        }

        const { message } = err as Error;
        throw toInternalError(message);
    }
};

export const deleteGebrauchtwagenHandler = async (
    service: GebrauchtwagenWriteService,
    request: Request,
    id: ID,
): Promise<DeletePayload> => {
    requireAdminAuthorization(request);

    const numericId = toNumber(id);
    if (!isPositiveId(numericId)) {
        throw toBadUserInput('id muss eine positive ganze Zahl sein');
    }

    const success = await service.delete(numericId);
    if (!success) {
        throw toBadUserInput(
            `Kein Gebrauchtwagen mit id=${numericId} gefunden`,
        );
    }

    return { success };
};

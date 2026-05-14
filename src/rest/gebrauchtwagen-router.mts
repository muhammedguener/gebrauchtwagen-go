import { Hono } from 'hono';
import { z, ZodError } from 'zod';
import { parseGebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import { createPrismaGebrauchtwagenService } from '../service/prisma-gebrauchtwagen-service.mts';
import type { GebrauchtwagenService } from '../service/gebrauchtwagen-service.mts';

const fahrzeugklasseValues = [
    'KLEINWAGEN',
    'KOMPAKTKLASSE',
    'MITTELKLASSE',
    'OBERKLASSE',
    'SUV',
    'KOMBI',
    'CABRIO',
    'TRANSPORTER',
] as const;

const kraftstoffartValues = [
    'BENZIN',
    'DIESEL',
    'ELEKTRO',
    'HYBRID',
    'ERDGAS',
    'WASSERSTOFF',
] as const;

const okStatus = 200;
const createdStatus = 201;
const noContentStatus = 204;
const badRequestStatus = 400;
const unauthorizedStatus = 401;
const forbiddenStatus = 403;
const notFoundStatus = 404;

const gebrauchtwagenBodySchema = z.object({
    marke: z.string().trim().min(1),
    modell: z.string().trim().min(1),
    fahrzeugklasse: z.enum(fahrzeugklasseValues),
    kraftstoffart: z.enum(kraftstoffartValues),
    schadenfrei: z.boolean(),
    kilometerstand: z.number().int().min(0),
});

type GebrauchtwagenBody = z.infer<typeof gebrauchtwagenBodySchema>;

const parseAuthorization = (
    authorizationHeader: string | undefined,
): string | undefined => {
    if (authorizationHeader === undefined) {
        return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (
        scheme?.toLowerCase() !== 'bearer' ||
        token === undefined ||
        token === ''
    ) {
        return undefined;
    }

    return token;
};

const requireAdminAuthorization = (
    authorizationHeader: string | undefined,
): Response | undefined => {
    const token = parseAuthorization(authorizationHeader);

    if (token === undefined) {
        return Response.json(
            {
                error: 'UNAUTHORIZED',
                message: 'Bearer-Token fehlt oder ist ungueltig',
            },
            { status: unauthorizedStatus },
        );
    }

    if (token !== 'admin-token') {
        return Response.json(
            {
                error: 'FORBIDDEN',
                message: 'Admin-Rolle erforderlich',
            },
            { status: forbiddenStatus },
        );
    }

    return undefined;
};

const parseBody = async (request: Request): Promise<GebrauchtwagenBody> =>
    gebrauchtwagenBodySchema.parse(await request.json());

const createValidationErrorResponse = (error: ZodError): Response =>
    Response.json(
        {
            error: 'VALIDATION_ERROR',
            details: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        },
        { status: badRequestStatus },
    );

// eslint-disable-next-line max-lines-per-function
export const createGebrauchtwagenRouter = (
    service: GebrauchtwagenService = createPrismaGebrauchtwagenService(),
): Hono => {
    const router = new Hono();

    router.get('/', async (context) => {
        try {
            const search = parseGebrauchtwagenSearchParams(context.req.query());
            const result = await service.list(search);

            return context.json(
                {
                    data: result.data,
                    page: result.page,
                    size: result.size,
                    total: result.total,
                },
                okStatus,
            );
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return context.newResponse(
                    createValidationErrorResponse(err).body,
                    badRequestStatus,
                );
            }

            throw err;
        }
    });

    router.get('/:id', async (context) => {
        const id = Number(context.req.param('id'));

        if (!Number.isInteger(id) || id <= 0) {
            return context.json(
                {
                    error: 'VALIDATION_ERROR',
                    message: 'id muss eine positive ganze Zahl sein',
                },
                badRequestStatus,
            );
        }

        const item = await service.findById(id);

        if (item === undefined) {
            return context.json(
                {
                    error: 'NOT_FOUND',
                    message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
                },
                notFoundStatus,
            );
        }

        return context.json(item, okStatus);
    });

    router.post('/', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return context.newResponse(
                authError.body,
                authError.status as
                    | typeof unauthorizedStatus
                    | typeof forbiddenStatus,
            );
        }

        try {
            const payload = await parseBody(context.req.raw);
            const created = await service.create(payload);

            return context.json(created, createdStatus);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return context.newResponse(
                    createValidationErrorResponse(err).body,
                    badRequestStatus,
                );
            }

            throw err;
        }
    });

    router.put('/:id', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return context.newResponse(
                authError.body,
                authError.status as
                    | typeof unauthorizedStatus
                    | typeof forbiddenStatus,
            );
        }

        const id = Number(context.req.param('id'));
        if (!Number.isInteger(id) || id <= 0) {
            return context.json(
                {
                    error: 'VALIDATION_ERROR',
                    message: 'id muss eine positive ganze Zahl sein',
                },
                badRequestStatus,
            );
        }

        try {
            const payload = await parseBody(context.req.raw);
            const updated = await service.update(id, payload);

            if (updated === undefined) {
                return context.json(
                    {
                        error: 'NOT_FOUND',
                        message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
                    },
                    notFoundStatus,
                );
            }

            return context.json(updated, okStatus);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return context.newResponse(
                    createValidationErrorResponse(err).body,
                    badRequestStatus,
                );
            }

            throw err;
        }
    });

    router.delete('/:id', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return context.newResponse(
                authError.body,
                authError.status as
                    | typeof unauthorizedStatus
                    | typeof forbiddenStatus,
            );
        }

        const id = Number(context.req.param('id'));
        if (!Number.isInteger(id) || id <= 0) {
            return context.json(
                {
                    error: 'VALIDATION_ERROR',
                    message: 'id muss eine positive ganze Zahl sein',
                },
                badRequestStatus,
            );
        }

        const deleted = await service.delete(id);
        if (!deleted) {
            return context.json(
                {
                    error: 'NOT_FOUND',
                    message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
                },
                notFoundStatus,
            );
        }

        return context.body(null, noContentStatus); // eslint-disable-line unicorn/no-null
    });

    return router;
};

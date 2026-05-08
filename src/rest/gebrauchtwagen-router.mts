import { Hono } from 'hono';
import { z, ZodError } from 'zod';
import {
    buildPagination,
    parseGebrauchtwagenSearchParams,
} from '../gebrauchtwagen-query.mts';
import {
    createGebrauchtwagenFixture,
    deleteGebrauchtwagenFixture,
    findGebrauchtwagenFixtureById,
    type GebrauchtwagenDto,
    listGebrauchtwagenFixtures,
    updateGebrauchtwagenFixture,
} from '../data/gebrauchtwagen-fixtures.mts';

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

const gebrauchtwagenBodySchema = z.object({
    marke: z.string().trim().min(1),
    modell: z.string().trim().min(1),
    fahrzeugklasse: z.enum(fahrzeugklasseValues),
    kraftstoffart: z.enum(kraftstoffartValues),
    schadenfrei: z.boolean(),
    kilometerstand: z.number().int().min(0),
});

type GebrauchtwagenBody = z.infer<typeof gebrauchtwagenBodySchema>;

const parseAuthorization = (authorizationHeader: string | undefined): string | undefined => {
    if (authorizationHeader === undefined) {
        return undefined;
    }

    const [scheme, token] = authorizationHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || token === undefined || token === '') {
        return undefined;
    }

    return token;
};

const requireAdminAuthorization = (authorizationHeader: string | undefined): Response | undefined => {
    const token = parseAuthorization(authorizationHeader);

    if (token === undefined) {
        return Response.json(
            {
                error: 'UNAUTHORIZED',
                message: 'Bearer-Token fehlt oder ist ungueltig',
            },
            { status: 401 },
        );
    }

    if (token !== 'admin-token') {
        return Response.json(
            {
                error: 'FORBIDDEN',
                message: 'Admin-Rolle erforderlich',
            },
            { status: 403 },
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
        { status: 400 },
    );

const includesInsensitive = (value: string, query: string): boolean =>
    value.toLowerCase().includes(query.toLowerCase());

const filterGebrauchtwagen = (
    items: GebrauchtwagenDto[],
    search: ReturnType<typeof parseGebrauchtwagenSearchParams>,
): GebrauchtwagenDto[] =>
    items.filter((item) => {
        if (search.marke !== undefined && !includesInsensitive(item.marke, search.marke)) {
            return false;
        }

        if (search.modell !== undefined && !includesInsensitive(item.modell, search.modell)) {
            return false;
        }

        if (search.fahrzeugklasse !== undefined && item.fahrzeugklasse !== search.fahrzeugklasse) {
            return false;
        }

        if (search.kraftstoffart !== undefined && item.kraftstoffart !== search.kraftstoffart) {
            return false;
        }

        if (search.schadenfrei !== undefined && item.schadenfrei !== search.schadenfrei) {
            return false;
        }

        return true;
    });

export const gebrauchtwagenRouter = new Hono();

gebrauchtwagenRouter.get('/', (context) => {
    try {
        const search = parseGebrauchtwagenSearchParams(context.req.query());
        const filtered = filterGebrauchtwagen(listGebrauchtwagenFixtures(), search);
        const { skip, take } = buildPagination(search);
        const data = filtered.slice(skip, skip + take);

        return context.json(
            {
                data,
                page: search.page,
                size: search.size,
                total: filtered.length,
            },
            200,
        );
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return context.newResponse(createValidationErrorResponse(error).body, 400);
        }

        throw error;
    }
});

gebrauchtwagenRouter.get('/:id', (context) => {
    const id = Number(context.req.param('id'));

    if (!Number.isInteger(id) || id <= 0) {
        return context.json(
            {
                error: 'VALIDATION_ERROR',
                message: 'id muss eine positive ganze Zahl sein',
            },
            400,
        );
    }

    const item = findGebrauchtwagenFixtureById(id);

    if (item === undefined) {
        return context.json(
            {
                error: 'NOT_FOUND',
                message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
            },
            404,
        );
    }

    return context.json(item, 200);
});

gebrauchtwagenRouter.post('/', async (context) => {
    const authError = requireAdminAuthorization(context.req.header('authorization'));
    if (authError !== undefined) {
        return context.newResponse(authError.body, authError.status as 401 | 403);
    }

    try {
        const payload = await parseBody(context.req.raw);
        const created = createGebrauchtwagenFixture(payload);

        return context.json(created, 201);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return context.newResponse(createValidationErrorResponse(error).body, 400);
        }

        throw error;
    }
});

gebrauchtwagenRouter.put('/:id', async (context) => {
    const authError = requireAdminAuthorization(context.req.header('authorization'));
    if (authError !== undefined) {
        return context.newResponse(authError.body, authError.status as 401 | 403);
    }

    const id = Number(context.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return context.json(
            {
                error: 'VALIDATION_ERROR',
                message: 'id muss eine positive ganze Zahl sein',
            },
            400,
        );
    }

    try {
        const payload = await parseBody(context.req.raw);
        const updated = updateGebrauchtwagenFixture(id, payload);

        if (updated === undefined) {
            return context.json(
                {
                    error: 'NOT_FOUND',
                    message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
                },
                404,
            );
        }

        return context.json(updated, 200);
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return context.newResponse(createValidationErrorResponse(error).body, 400);
        }

        throw error;
    }
});

gebrauchtwagenRouter.delete('/:id', (context) => {
    const authError = requireAdminAuthorization(context.req.header('authorization'));
    if (authError !== undefined) {
        return context.newResponse(authError.body, authError.status as 401 | 403);
    }

    const id = Number(context.req.param('id'));
    if (!Number.isInteger(id) || id <= 0) {
        return context.json(
            {
                error: 'VALIDATION_ERROR',
                message: 'id muss eine positive ganze Zahl sein',
            },
            400,
        );
    }

    const deleted = deleteGebrauchtwagenFixture(id);
    if (!deleted) {
        return context.json(
            {
                error: 'NOT_FOUND',
                message: `Kein Gebrauchtwagen mit id=${id} gefunden`,
            },
            404,
        );
    }

    return context.body(null, 204);
});

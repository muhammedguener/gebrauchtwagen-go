import { Hono } from 'hono';
import { z, ZodError } from 'zod';
import { parseGebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import {
    createProblemDetails,
    forbidden,
    notFound,
    preconditionFailed,
    preconditionRequired,
    unauthorized,
    unprocessableContent,
} from '../problem-details.mts';
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
const notAcceptableStatus = 406;
const notModifiedStatus = 304;

const gebrauchtwagenBodySchema = z.object({
    marke: z.string().trim().min(1),
    modell: z.string().trim().min(1),
    fahrzeugklasse: z.enum(fahrzeugklasseValues),
    kraftstoffart: z.enum(kraftstoffartValues),
    schadenfrei: z.boolean(),
    kilometerstand: z.number().int().min(0),
});

type GebrauchtwagenBody = z.infer<typeof gebrauchtwagenBodySchema>;

const acceptsJsonOrHtml = (acceptHeader: string | undefined): boolean => {
    const accept = acceptHeader?.toLowerCase() ?? '*/*';
    return accept === '*/*' || /json|html/u.test(accept);
};

const createNotAcceptableResponse = (): Response =>
    new Response(undefined, { status: notAcceptableStatus });

const createEtag = (version: number): string => `W/"${version}"`;

const parseEtagVersion = (etag: string | undefined): number | undefined => {
    const match = /^W?\/?"(?<version>\d+)"$/u.exec(etag ?? '');
    const version = match?.groups?.['version'];

    return version === undefined ? undefined : Number.parseInt(version, 10);
};

const createLocation = (requestUrl: string, id: number): string => {
    const location = new URL(requestUrl);
    location.pathname = `${location.pathname}/${id}`;

    return location.href;
};

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
        return createProblemDetails(
            unauthorized,
            'Bearer-Token fehlt oder ist ungueltig',
        );
    }

    if (token !== 'admin-token') {
        return createProblemDetails(forbidden, 'Admin-Rolle erforderlich');
    }

    return undefined;
};

const parseBody = async (request: Request): Promise<GebrauchtwagenBody> =>
    gebrauchtwagenBodySchema.parse(await request.json());

const createValidationErrorResponse = (error: ZodError): Response =>
    createProblemDetails(
        unprocessableContent,
        error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    );

// eslint-disable-next-line max-lines-per-function
export const createGebrauchtwagenRouter = (
    service: GebrauchtwagenService = createPrismaGebrauchtwagenService(),
): Hono => {
    const router = new Hono();

    router.get('/', async (context) => {
        if (!acceptsJsonOrHtml(context.req.header('Accept'))) {
            return createNotAcceptableResponse();
        }

        try {
            const query = context.req.query();
            const countOnly = query['count-only'];
            delete query['count-only'];

            const search = parseGebrauchtwagenSearchParams(query);
            const result = await service.list(search);

            if (countOnly !== undefined) {
                return context.json({ count: result.total }, okStatus);
            }

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
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    });

    router.get('/:id', async (context) => {
        if (!acceptsJsonOrHtml(context.req.header('Accept'))) {
            return createNotAcceptableResponse();
        }

        const id = Number(context.req.param('id'));

        if (!Number.isInteger(id) || id <= 0) {
            return createProblemDetails(
                unprocessableContent,
                'id muss eine positive ganze Zahl sein',
            );
        }

        const item = await service.findById(id);

        if (item === undefined) {
            return createProblemDetails(
                notFound,
                `Kein Gebrauchtwagen mit id=${id} gefunden`,
            );
        }

        const etag = createEtag(item.version);
        if (context.req.header('If-None-Match') === etag) {
            return context.body(null, notModifiedStatus); // eslint-disable-line unicorn/no-null
        }

        context.header('ETag', etag);
        return context.json(item, okStatus);
    });

    router.post('/', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        try {
            const payload = await parseBody(context.req.raw);
            const created = await service.create(payload);

            context.header(
                'Location',
                createLocation(context.req.url, created.id),
            );
            return context.body(null, createdStatus); // eslint-disable-line unicorn/no-null
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    });

    router.put('/:id', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        const id = Number(context.req.param('id'));
        if (!Number.isInteger(id) || id <= 0) {
            return createProblemDetails(
                unprocessableContent,
                'id muss eine positive ganze Zahl sein',
            );
        }

        const item = await service.findById(id);
        if (item === undefined) {
            return createProblemDetails(
                notFound,
                `Kein Gebrauchtwagen mit id=${id} gefunden`,
            );
        }

        const version = parseEtagVersion(context.req.header('If-Match'));
        if (version === undefined) {
            return createProblemDetails(
                preconditionRequired,
                'Header "If-Match" fehlt oder ist ungueltig',
            );
        }

        if (version !== item.version) {
            return createProblemDetails(
                preconditionFailed,
                `Version ${version} ist nicht mehr aktuell`,
            );
        }

        try {
            const payload = await parseBody(context.req.raw);
            const updated = await service.update(id, payload);
            context.header('ETag', createEtag(updated?.version ?? version + 1));
            return context.body(null, noContentStatus); // eslint-disable-line unicorn/no-null
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    });

    router.delete('/:id', async (context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        const id = Number(context.req.param('id'));
        if (!Number.isInteger(id) || id <= 0) {
            return createProblemDetails(
                unprocessableContent,
                'id muss eine positive ganze Zahl sein',
            );
        }

        const deleted = await service.delete(id);
        if (!deleted) {
            return createProblemDetails(
                notFound,
                `Kein Gebrauchtwagen mit id=${id} gefunden`,
            );
        }

        return context.body(null, noContentStatus); // eslint-disable-line unicorn/no-null
    });

    return router;
};

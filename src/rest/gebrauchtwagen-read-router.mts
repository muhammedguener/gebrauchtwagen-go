import { Hono, type Context } from 'hono';
import { ZodError } from 'zod';
import { parseGebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import { createProblemDetails, notFound } from '../problem-details.mts';
import type { GebrauchtwagenReadService } from '../service/gebrauchtwagen-service.mts';
import {
    acceptsJsonOrHtml,
    createEtag,
    createNotAcceptableResponse,
} from './rest-headers.mts';
import { statuscode } from './statuscode.mts';
import {
    createInvalidIdResponse,
    createValidationErrorResponse,
    isPositiveId,
} from './gebrauchtwagen-validation.mts';

const createListHandler =
    (service: GebrauchtwagenReadService) => async (context: Context) => {
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
                return context.json({ count: result.total }, statuscode.ok);
            }

            return context.json(result, statuscode.ok);
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                return createValidationErrorResponse(err);
            }

            throw err;
        }
    };

const createDetailHandler =
    (service: GebrauchtwagenReadService) => async (context: Context) => {
        if (!acceptsJsonOrHtml(context.req.header('Accept'))) {
            return createNotAcceptableResponse();
        }

        const id = Number(context.req.param('id'));
        if (!isPositiveId(id)) {
            return createInvalidIdResponse();
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
            return context.body(null, statuscode.notModified); // eslint-disable-line unicorn/no-null
        }

        context.header('ETag', etag);
        return context.json(item, statuscode.ok);
    };

export const createGebrauchtwagenReadRouter = (
    service: GebrauchtwagenReadService,
): Hono => {
    const router = new Hono();

    router.get('/', createListHandler(service));
    router.get('/:id', createDetailHandler(service));

    return router;
};

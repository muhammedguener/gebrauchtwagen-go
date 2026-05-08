import { Hono } from 'hono';
import { ZodError } from 'zod';
import {
    buildPagination,
    parseGebrauchtwagenSearchParams,
} from '../gebrauchtwagen-query.mts';
import {
    type GebrauchtwagenDto,
    gebrauchtwagenFixtures,
} from '../data/gebrauchtwagen-fixtures.mts';

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
        const filtered = filterGebrauchtwagen(gebrauchtwagenFixtures, search);
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
            return context.json(
                {
                    error: 'VALIDATION_ERROR',
                    details: error.issues.map((issue) => ({
                        path: issue.path.join('.'),
                        message: issue.message,
                    })),
                },
                400,
            );
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

    const item = gebrauchtwagenFixtures.find((fahrzeug) => fahrzeug.id === id);

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

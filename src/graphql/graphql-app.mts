import { createSchema, createYoga } from 'graphql-yoga';
import { Hono } from 'hono';
import type {
    GebrauchtwagenReadService,
    GebrauchtwagenWriteService,
} from '../service/gebrauchtwagen-service.mts';
import { getLogger } from '../logger/logger.mts';
import {
    createGebrauchtwagenHandler,
    deleteGebrauchtwagenHandler,
    updateGebrauchtwagenHandler,
} from './mutation-handler.mts';
import {
    findGebrauchtwagenHandler,
    listGebrauchtwagenHandler,
} from './query-handler.mts';
import {
    typeDefs,
    type GebrauchtwagenInput,
    type GebrauchtwagenSearchInput,
    type ID,
} from './types.mts';

type GraphqlContext = {
    request: Request;
};

type GraphqlServices = {
    readService: GebrauchtwagenReadService;
    writeService: GebrauchtwagenWriteService;
};

const logger = getLogger('graphql-app', 'file');

const createResolvers = ({ readService, writeService }: GraphqlServices) => ({
    // GraphQL Resolvernamen muessen exakt zum Schema passen.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Query: {
        gebrauchtwagen: (_: unknown, { id }: { id: ID }) =>
            findGebrauchtwagenHandler(readService, id),
        gebrauchtwagenListe: (
            _: unknown,
            { input }: { input?: GebrauchtwagenSearchInput },
        ) => listGebrauchtwagenHandler(readService, input),
    },
    // GraphQL Resolvernamen muessen exakt zum Schema passen.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Mutation: {
        createGebrauchtwagen: (
            _: unknown,
            { input }: { input: GebrauchtwagenInput },
            { request }: GraphqlContext,
        ) => createGebrauchtwagenHandler(writeService, request, input),
        updateGebrauchtwagen: (
            _: unknown,
            {
                id,
                version,
                input,
            }: { id: ID; version: number; input: GebrauchtwagenInput },
            { request }: GraphqlContext,
        ) =>
            updateGebrauchtwagenHandler({
                readService,
                writeService,
                request,
                id,
                version,
                input,
            }),
        deleteGebrauchtwagen: (
            _: unknown,
            { id }: { id: ID },
            { request }: GraphqlContext,
        ) => deleteGebrauchtwagenHandler(writeService, request, id),
    },
});

export const createGraphqlApp = (services: GraphqlServices): Hono => {
    const resolvers = createResolvers(services);
    const yoga = createYoga({
        schema: createSchema({ typeDefs, resolvers }),
        context: ({ request }) => ({ request }),
        maskedErrors: false,
    });
    const app = new Hono();

    app.all('/', async (context) => {
        logger.debug('/graphql');
        const response = await yoga.fetch(context.req.raw);

        return context.newResponse(response.body, response);
    });

    return app;
};

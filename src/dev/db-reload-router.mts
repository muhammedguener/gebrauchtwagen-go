import { Hono, type Context } from 'hono';
import type { GebrauchtwagenDevService } from '../service/gebrauchtwagen-service.mts';
import { requireAdminAuthorization } from '../rest/rest-headers.mts';
import { statuscode } from '../rest/statuscode.mts';

const createReloadHandler =
    (service: GebrauchtwagenDevService) => async (context: Context) => {
        const authError = requireAdminAuthorization(
            context.req.header('authorization'),
        );
        if (authError !== undefined) {
            return authError;
        }

        const result = await service.reloadDemoData();

        return context.json(
            {
                status: 'reloaded',
                count: result.count,
            },
            statuscode.ok,
        );
    };

export const createDbReloadRouter = (
    service: GebrauchtwagenDevService,
): Hono => {
    const router = new Hono();

    router.post('/db_populate', createReloadHandler(service));

    return router;
};

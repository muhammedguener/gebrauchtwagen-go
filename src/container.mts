import { createPrismaGebrauchtwagenService } from './service/prisma-gebrauchtwagen-service.mts';
import type { GebrauchtwagenService } from './service/gebrauchtwagen-service.mts';

let gebrauchtwagenService: GebrauchtwagenService | undefined;

const getGebrauchtwagenService = (): GebrauchtwagenService => {
    gebrauchtwagenService ??= createPrismaGebrauchtwagenService();

    return gebrauchtwagenService;
};

export const container = {
    get gebrauchtwagenService() {
        return getGebrauchtwagenService();
    },
    get gebrauchtwagenReadService() {
        return getGebrauchtwagenService();
    },
    get gebrauchtwagenWriteService() {
        return getGebrauchtwagenService();
    },
};

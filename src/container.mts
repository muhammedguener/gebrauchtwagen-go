import { createPrismaGebrauchtwagenService } from './service/prisma-gebrauchtwagen-service.mts';
import type {
    GebrauchtwagenDevService,
    GebrauchtwagenService,
} from './service/gebrauchtwagen-service.mts';

let gebrauchtwagenService: GebrauchtwagenService | undefined;
let gebrauchtwagenDevService: GebrauchtwagenDevService | undefined;

const getGebrauchtwagenService = (): GebrauchtwagenService => {
    gebrauchtwagenService ??= createPrismaGebrauchtwagenService();

    return gebrauchtwagenService;
};

const getGebrauchtwagenDevService = (): GebrauchtwagenDevService => {
    gebrauchtwagenDevService ??= createPrismaGebrauchtwagenService();

    return gebrauchtwagenDevService;
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
    get gebrauchtwagenDevService() {
        return getGebrauchtwagenDevService();
    },
};

import { createPrismaClient } from '../config/prisma-client.mts';
import type { Gebrauchtwagen } from '../generated/prisma/client.ts';
import {
    buildFindManyArgs,
    buildGebrauchtwagenWhere,
} from '../gebrauchtwagen-query.mts';
import type {
    GebrauchtwagenDto,
    GebrauchtwagenList,
    GebrauchtwagenService,
    GebrauchtwagenWrite,
} from './gebrauchtwagen-service.mts';

const initialVersion = 1;
const finLength = 17;

const mapGebrauchtwagen = (fahrzeug: Gebrauchtwagen): GebrauchtwagenDto => ({
    id: fahrzeug.id,
    marke: fahrzeug.marke,
    modell: fahrzeug.modell,
    fahrzeugklasse: fahrzeug.fahrzeugklasse,
    kraftstoffart: fahrzeug.kraftstoffart,
    schadenfrei: fahrzeug.schadenfrei,
    kilometerstand: fahrzeug.kilometerstand,
    version: fahrzeug.version,
});

const createFin = (): string => `GW${Date.now()}`.slice(0, finLength);

// eslint-disable-next-line max-lines-per-function
export const createPrismaGebrauchtwagenService = (): GebrauchtwagenService => {
    const prisma = createPrismaClient();

    return {
        async list(search): Promise<GebrauchtwagenList> {
            const args = buildFindManyArgs(search);
            const [data, total] = await Promise.all([
                prisma.gebrauchtwagen.findMany(args),
                prisma.gebrauchtwagen.count({
                    where: buildGebrauchtwagenWhere(search),
                }),
            ]);

            return {
                data: data.map((fahrzeug) => mapGebrauchtwagen(fahrzeug)),
                page: search.page,
                size: search.size,
                total,
            };
        },

        async findById(id): Promise<GebrauchtwagenDto | undefined> {
            const fahrzeug = await prisma.gebrauchtwagen.findUnique({
                where: { id },
            });

            return fahrzeug === null ? undefined : mapGebrauchtwagen(fahrzeug);
        },

        async create(
            fahrzeug: GebrauchtwagenWrite,
        ): Promise<GebrauchtwagenDto> {
            const now = new Date();
            const created = await prisma.gebrauchtwagen.create({
                data: {
                    ...fahrzeug,
                    fin: createFin(),
                    baujahr: now.getFullYear(),
                    erstzulassung: now,
                    ausstattung: {},
                    version: initialVersion,
                },
            });

            return mapGebrauchtwagen(created);
        },

        async update(id, fahrzeug): Promise<GebrauchtwagenDto | undefined> {
            const existing = await prisma.gebrauchtwagen.findUnique({
                where: { id },
                select: { id: true },
            });

            if (existing === null) {
                return undefined;
            }

            const updated = await prisma.gebrauchtwagen.update({
                data: {
                    ...fahrzeug,
                    version: { increment: 1 },
                },
                where: { id },
            });

            return mapGebrauchtwagen(updated);
        },

        async delete(id): Promise<boolean> {
            const existing = await prisma.gebrauchtwagen.findUnique({
                where: { id },
                select: { id: true },
            });

            if (existing === null) {
                return false;
            }

            await prisma.gebrauchtwagen.delete({ where: { id } });

            return true;
        },
    };
};

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PrismaClient } from '../../src/generated/prisma/client.ts';

type PrismaMockFn = (...args: unknown[]) => Promise<unknown>;

const { createPrismaClientMock, prismaMock } = vi.hoisted(() => {
    const gebrauchtwagen = {
        findMany: vi.fn<PrismaMockFn>(),
        count: vi.fn<PrismaMockFn>(),
        findUnique: vi.fn<PrismaMockFn>(),
        create: vi.fn<PrismaMockFn>(),
        update: vi.fn<PrismaMockFn>(),
        delete: vi.fn<PrismaMockFn>(),
    };

    return {
        createPrismaClientMock: vi.fn<() => PrismaClient<'query'>>(),
        prismaMock: {
            gebrauchtwagen,
        },
    };
});

vi.mock(import('../../src/config/prisma-client.mts'), () => ({
    createPrismaClient: createPrismaClientMock,
}));

const { createPrismaGebrauchtwagenService } =
    await import('../../src/service/prisma-gebrauchtwagen-service.mts');

const prismaFahrzeug = {
    id: 1,
    fin: 'GW000000000000001',
    marke: 'VW',
    modell: 'Golf',
    baujahr: 2020,
    kilometerstand: 20_000,
    kraftstoffart: 'BENZIN',
    fahrzeugklasse: 'KOMPAKTKLASSE',
    erstzulassung: new Date('2020-01-01'),
    schadenfrei: false,
    ausstattung: {},
    beschreibungUrl: null,
    anbieterUsername: null,
    kontaktEmail: null,
    erzeugt: new Date('2026-01-01'),
    aktualisiert: new Date('2026-01-01'),
    version: 1,
};

describe('PrismaGebrauchtwagenService', () => {
    beforeEach(() => {
        createPrismaClientMock.mockReturnValue(
            prismaMock as unknown as PrismaClient<'query'>,
        );
        prismaMock.gebrauchtwagen.findMany.mockReset();
        prismaMock.gebrauchtwagen.count.mockReset();
        prismaMock.gebrauchtwagen.findUnique.mockReset();
        prismaMock.gebrauchtwagen.create.mockReset();
        prismaMock.gebrauchtwagen.update.mockReset();
        prismaMock.gebrauchtwagen.delete.mockReset();
    });

    test('list mapped Prisma-Daten auf Page-DTOs', async () => {
        prismaMock.gebrauchtwagen.findMany.mockResolvedValueOnce([
            prismaFahrzeug,
        ]);
        prismaMock.gebrauchtwagen.count.mockResolvedValueOnce(1);
        const service = createPrismaGebrauchtwagenService();

        const result = await service.list({ page: 1, size: 5 });

        expect(result).toStrictEqual({
            data: [
                {
                    id: 1,
                    marke: 'VW',
                    modell: 'Golf',
                    fahrzeugklasse: 'KOMPAKTKLASSE',
                    kraftstoffart: 'BENZIN',
                    schadenfrei: false,
                    kilometerstand: 20_000,
                    version: 1,
                },
            ],
            page: 1,
            size: 5,
            total: 1,
        });
        expect(prismaMock.gebrauchtwagen.findMany).toHaveBeenCalledTimes(1);
        expect(prismaMock.gebrauchtwagen.count).toHaveBeenCalledTimes(1);
    });

    test('findById liefert undefined, wenn Prisma null liefert', async () => {
        prismaMock.gebrauchtwagen.findUnique.mockResolvedValueOnce(null);
        const service = createPrismaGebrauchtwagenService();

        await expect(service.findById(999)).resolves.toBeUndefined();
    });

    test('create legt ein Fahrzeug mit technischen Defaultdaten an', async () => {
        prismaMock.gebrauchtwagen.create.mockResolvedValueOnce({
            ...prismaFahrzeug,
            id: 7,
            marke: 'BMW',
            modell: '320i',
            kilometerstand: 27_000,
        });
        const service = createPrismaGebrauchtwagenService();

        const created = await service.create({
            marke: 'BMW',
            modell: '320i',
            fahrzeugklasse: 'MITTELKLASSE',
            kraftstoffart: 'BENZIN',
            schadenfrei: true,
            kilometerstand: 27_000,
        });

        expect(created.id).toBe(7);
        expect(created.marke).toBe('BMW');
        expect(prismaMock.gebrauchtwagen.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                marke: 'BMW',
                modell: '320i',
                ausstattung: {},
                version: 1,
            }),
        });
    });

    test('delete liefert false, wenn das Fahrzeug fehlt', async () => {
        prismaMock.gebrauchtwagen.findUnique.mockResolvedValueOnce(null);
        const service = createPrismaGebrauchtwagenService();

        await expect(service.delete(999)).resolves.toBe(false);
        expect(prismaMock.gebrauchtwagen.delete).not.toHaveBeenCalled();
    });
});

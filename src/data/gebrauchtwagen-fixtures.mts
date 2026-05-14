import { buildPagination } from '../gebrauchtwagen-query.mts';
import type {
    GebrauchtwagenDto,
    GebrauchtwagenService,
    GebrauchtwagenWrite,
} from '../service/gebrauchtwagen-service.mts';

const initialGebrauchtwagenFixtures: GebrauchtwagenDto[] = [
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
    {
        id: 2,
        marke: 'VW',
        modell: 'Passat',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'DIESEL',
        schadenfrei: true,
        kilometerstand: 42_000,
        version: 1,
    },
    {
        id: 3,
        marke: 'Audi',
        modell: 'A3',
        fahrzeugklasse: 'KOMPAKTKLASSE',
        kraftstoffart: 'BENZIN',
        schadenfrei: true,
        kilometerstand: 36_500,
        version: 1,
    },
    {
        id: 4,
        marke: 'Tesla',
        modell: 'Model 3',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'ELEKTRO',
        schadenfrei: true,
        kilometerstand: 18_000,
        version: 1,
    },
    {
        id: 5,
        marke: 'Opel',
        modell: 'Corsa',
        fahrzeugklasse: 'KLEINWAGEN',
        kraftstoffart: 'BENZIN',
        schadenfrei: false,
        kilometerstand: 51_200,
        version: 1,
    },
    {
        id: 6,
        marke: 'Toyota',
        modell: 'Prius',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'HYBRID',
        schadenfrei: true,
        kilometerstand: 91_200,
        version: 1,
    },
];

let gebrauchtwagenFixturesState = initialGebrauchtwagenFixtures.map(
    (fahrzeug) => ({
        ...fahrzeug,
    }),
);

const listGebrauchtwagenFixtures = (): GebrauchtwagenDto[] =>
    gebrauchtwagenFixturesState.map((fahrzeug) => ({ ...fahrzeug }));

const findGebrauchtwagenFixtureById = (
    id: number,
): GebrauchtwagenDto | undefined => {
    const fahrzeug = gebrauchtwagenFixturesState.find((item) => item.id === id);
    return fahrzeug === undefined ? undefined : { ...fahrzeug };
};

const createGebrauchtwagenFixture = (
    fahrzeug: GebrauchtwagenWrite,
): GebrauchtwagenDto => {
    const nextId =
        Math.max(...gebrauchtwagenFixturesState.map((item) => item.id), 0) + 1;
    const created: GebrauchtwagenDto = { id: nextId, version: 1, ...fahrzeug };
    gebrauchtwagenFixturesState.push(created);

    return { ...created };
};

const updateGebrauchtwagenFixture = (
    id: number,
    fahrzeug: GebrauchtwagenWrite,
): GebrauchtwagenDto | undefined => {
    const index = gebrauchtwagenFixturesState.findIndex(
        (item) => item.id === id,
    );
    if (index === -1) {
        return undefined;
    }

    const current = gebrauchtwagenFixturesState[index];
    const updated: GebrauchtwagenDto = {
        id,
        version: (current?.version ?? 0) + 1,
        ...fahrzeug,
    };
    gebrauchtwagenFixturesState[index] = updated;

    return { ...updated };
};

const deleteGebrauchtwagenFixture = (id: number): boolean => {
    const initialLength = gebrauchtwagenFixturesState.length;
    gebrauchtwagenFixturesState = gebrauchtwagenFixturesState.filter(
        (item) => item.id !== id,
    );

    return gebrauchtwagenFixturesState.length !== initialLength;
};

export const resetGebrauchtwagenFixtures = (): void => {
    gebrauchtwagenFixturesState = initialGebrauchtwagenFixtures.map(
        (fahrzeug) => ({
            ...fahrzeug,
        }),
    );
};

const includesInsensitive = (value: string, query: string): boolean =>
    value.toLowerCase().includes(query.toLowerCase());

const matchesSearch = (
    item: GebrauchtwagenDto,
    search: Parameters<GebrauchtwagenService['list']>[0],
): boolean => {
    if (
        search.marke !== undefined &&
        !includesInsensitive(item.marke, search.marke)
    ) {
        return false;
    }

    if (
        search.modell !== undefined &&
        !includesInsensitive(item.modell, search.modell)
    ) {
        return false;
    }

    if (
        search.fahrzeugklasse !== undefined &&
        item.fahrzeugklasse !== search.fahrzeugklasse
    ) {
        return false;
    }

    if (
        search.kraftstoffart !== undefined &&
        item.kraftstoffart !== search.kraftstoffart
    ) {
        return false;
    }

    if (
        search.schadenfrei !== undefined &&
        item.schadenfrei !== search.schadenfrei
    ) {
        return false;
    }

    return true;
};

export const createFixtureGebrauchtwagenService =
    (): GebrauchtwagenService => ({
        list(search) {
            const filtered = listGebrauchtwagenFixtures().filter((item) =>
                matchesSearch(item, search),
            );
            const { skip, take } = buildPagination(search);

            return Promise.resolve({
                data: filtered.slice(skip, skip + take),
                page: search.page,
                size: search.size,
                total: filtered.length,
            });
        },

        findById(id) {
            return Promise.resolve(findGebrauchtwagenFixtureById(id));
        },

        create(fahrzeug) {
            return Promise.resolve(createGebrauchtwagenFixture(fahrzeug));
        },

        update(id, fahrzeug) {
            return Promise.resolve(updateGebrauchtwagenFixture(id, fahrzeug));
        },

        delete(id) {
            return Promise.resolve(deleteGebrauchtwagenFixture(id));
        },
    });

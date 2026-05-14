import type {
    Fahrzeugklasse,
    Kraftstoffart,
} from '../generated/prisma/client.ts';

export type GebrauchtwagenDto = {
    id: number;
    marke: string;
    modell: string;
    fahrzeugklasse: Fahrzeugklasse;
    kraftstoffart: Kraftstoffart;
    schadenfrei: boolean;
    kilometerstand: number;
};

const initialGebrauchtwagenFixtures: GebrauchtwagenDto[] = [
    {
        id: 1,
        marke: 'VW',
        modell: 'Golf',
        fahrzeugklasse: 'KOMPAKTKLASSE',
        kraftstoffart: 'BENZIN',
        schadenfrei: false,
        kilometerstand: 20_000,
    },
    {
        id: 2,
        marke: 'VW',
        modell: 'Passat',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'DIESEL',
        schadenfrei: true,
        kilometerstand: 42_000,
    },
    {
        id: 3,
        marke: 'Audi',
        modell: 'A3',
        fahrzeugklasse: 'KOMPAKTKLASSE',
        kraftstoffart: 'BENZIN',
        schadenfrei: true,
        kilometerstand: 36_500,
    },
    {
        id: 4,
        marke: 'Tesla',
        modell: 'Model 3',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'ELEKTRO',
        schadenfrei: true,
        kilometerstand: 18_000,
    },
    {
        id: 5,
        marke: 'Opel',
        modell: 'Corsa',
        fahrzeugklasse: 'KLEINWAGEN',
        kraftstoffart: 'BENZIN',
        schadenfrei: false,
        kilometerstand: 51_200,
    },
    {
        id: 6,
        marke: 'Toyota',
        modell: 'Prius',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'HYBRID',
        schadenfrei: true,
        kilometerstand: 91_200,
    },
];

let gebrauchtwagenFixturesState = initialGebrauchtwagenFixtures.map(
    (fahrzeug) => ({
        ...fahrzeug,
    }),
);

export const listGebrauchtwagenFixtures = (): GebrauchtwagenDto[] =>
    gebrauchtwagenFixturesState.map((fahrzeug) => ({ ...fahrzeug }));

export const findGebrauchtwagenFixtureById = (
    id: number,
): GebrauchtwagenDto | undefined => {
    const fahrzeug = gebrauchtwagenFixturesState.find((item) => item.id === id);
    return fahrzeug === undefined ? undefined : { ...fahrzeug };
};

export const createGebrauchtwagenFixture = (
    fahrzeug: Omit<GebrauchtwagenDto, 'id'>,
): GebrauchtwagenDto => {
    const nextId =
        Math.max(...gebrauchtwagenFixturesState.map((item) => item.id), 0) + 1;
    const created: GebrauchtwagenDto = { id: nextId, ...fahrzeug };
    gebrauchtwagenFixturesState.push(created);

    return { ...created };
};

export const updateGebrauchtwagenFixture = (
    id: number,
    fahrzeug: Omit<GebrauchtwagenDto, 'id'>,
): GebrauchtwagenDto | undefined => {
    const index = gebrauchtwagenFixturesState.findIndex(
        (item) => item.id === id,
    );
    if (index === -1) {
        return undefined;
    }

    const updated: GebrauchtwagenDto = { id, ...fahrzeug };
    gebrauchtwagenFixturesState[index] = updated;

    return { ...updated };
};

export const deleteGebrauchtwagenFixture = (id: number): boolean => {
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

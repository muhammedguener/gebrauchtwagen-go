import type { Fahrzeugklasse, Kraftstoffart } from '../generated/prisma/client.ts';

export type GebrauchtwagenDto = {
    id: number;
    marke: string;
    modell: string;
    fahrzeugklasse: Fahrzeugklasse;
    kraftstoffart: Kraftstoffart;
    schadenfrei: boolean;
    kilometerstand: number;
};

export const gebrauchtwagenFixtures: GebrauchtwagenDto[] = [
    {
        id: 1,
        marke: 'VW',
        modell: 'Golf',
        fahrzeugklasse: 'KOMPAKTKLASSE',
        kraftstoffart: 'BENZIN',
        schadenfrei: false,
        kilometerstand: 20000,
    },
    {
        id: 2,
        marke: 'VW',
        modell: 'Passat',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'DIESEL',
        schadenfrei: true,
        kilometerstand: 42000,
    },
    {
        id: 3,
        marke: 'Audi',
        modell: 'A3',
        fahrzeugklasse: 'KOMPAKTKLASSE',
        kraftstoffart: 'BENZIN',
        schadenfrei: true,
        kilometerstand: 36500,
    },
    {
        id: 4,
        marke: 'Tesla',
        modell: 'Model 3',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'ELEKTRO',
        schadenfrei: true,
        kilometerstand: 18000,
    },
    {
        id: 5,
        marke: 'Opel',
        modell: 'Corsa',
        fahrzeugklasse: 'KLEINWAGEN',
        kraftstoffart: 'BENZIN',
        schadenfrei: false,
        kilometerstand: 51200,
    },
    {
        id: 6,
        marke: 'Toyota',
        modell: 'Prius',
        fahrzeugklasse: 'MITTELKLASSE',
        kraftstoffart: 'HYBRID',
        schadenfrei: true,
        kilometerstand: 91200,
    },
];

import type {
    Fahrzeugklasse,
    Kraftstoffart,
} from '../generated/prisma/client.ts';
import type { GebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';

export type GebrauchtwagenDto = {
    id: number;
    marke: string;
    modell: string;
    fahrzeugklasse: Fahrzeugklasse;
    kraftstoffart: Kraftstoffart;
    schadenfrei: boolean;
    kilometerstand: number;
};

export type GebrauchtwagenWrite = Omit<GebrauchtwagenDto, 'id'>;

export type GebrauchtwagenList = {
    data: GebrauchtwagenDto[];
    page: number;
    size: number;
    total: number;
};

export type GebrauchtwagenService = {
    list: (search: GebrauchtwagenSearchParams) => Promise<GebrauchtwagenList>;
    findById: (id: number) => Promise<GebrauchtwagenDto | undefined>;
    create: (fahrzeug: GebrauchtwagenWrite) => Promise<GebrauchtwagenDto>;
    update: (
        id: number,
        fahrzeug: GebrauchtwagenWrite,
    ) => Promise<GebrauchtwagenDto | undefined>;
    delete: (id: number) => Promise<boolean>;
};

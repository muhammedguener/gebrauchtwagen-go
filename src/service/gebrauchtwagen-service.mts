import type {
    Fahrzeugklasse,
    Kraftstoffart,
} from '../generated/prisma/client.ts';
import type { GebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import type { Page } from './pageable.mts';

export type GebrauchtwagenDto = {
    id: number;
    marke: string;
    modell: string;
    fahrzeugklasse: Fahrzeugklasse;
    kraftstoffart: Kraftstoffart;
    schadenfrei: boolean;
    kilometerstand: number;
    version: number;
};

export type GebrauchtwagenWrite = Omit<GebrauchtwagenDto, 'id' | 'version'>;

export type GebrauchtwagenList = Page<GebrauchtwagenDto>;

export type GebrauchtwagenReadService = {
    list: (search: GebrauchtwagenSearchParams) => Promise<GebrauchtwagenList>;
    findById: (id: number) => Promise<GebrauchtwagenDto | undefined>;
};

export type GebrauchtwagenWriteService = {
    create: (fahrzeug: GebrauchtwagenWrite) => Promise<GebrauchtwagenDto>;
    update: (
        id: number,
        fahrzeug: GebrauchtwagenWrite,
    ) => Promise<GebrauchtwagenDto | undefined>;
    delete: (id: number) => Promise<boolean>;
};

export type GebrauchtwagenDevService = {
    reloadDemoData: () => Promise<{ count: number }>;
};

export type GebrauchtwagenService = GebrauchtwagenReadService &
    GebrauchtwagenWriteService;

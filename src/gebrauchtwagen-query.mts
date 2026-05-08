import { z } from 'zod';
import { type Prisma } from './generated/prisma/client.ts';

const fahrzeugklasseValues = [
    'KLEINWAGEN',
    'KOMPAKTKLASSE',
    'MITTELKLASSE',
    'OBERKLASSE',
    'SUV',
    'KOMBI',
    'CABRIO',
    'TRANSPORTER',
] as const;

const kraftstoffartValues = [
    'BENZIN',
    'DIESEL',
    'ELEKTRO',
    'HYBRID',
    'ERDGAS',
    'WASSERSTOFF',
] as const;

const booleanFromString = z.preprocess((value) => {
    if (typeof value !== 'string') {
        return value;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
        return true;
    }
    if (normalized === 'false') {
        return false;
    }

    return value;
}, z.boolean());

const searchSchema = z
    .object({
        marke: z.string().trim().min(1).optional(),
        modell: z.string().trim().min(1).optional(),
        fahrzeugklasse: z.enum(fahrzeugklasseValues).optional(),
        kraftstoffart: z.enum(kraftstoffartValues).optional(),
        schadenfrei: booleanFromString.optional(),
        page: z.coerce.number().int().min(1).default(1),
        size: z.coerce.number().int().min(1).max(50).default(5),
    })
    .strict();

export type GebrauchtwagenSearchParams = z.infer<typeof searchSchema>;

export const parseGebrauchtwagenSearchParams = (
    input: unknown,
): GebrauchtwagenSearchParams => searchSchema.parse(input);

export const buildGebrauchtwagenWhere = (
    filter: GebrauchtwagenSearchParams,
): Prisma.GebrauchtwagenWhereInput => {
    const and: Prisma.GebrauchtwagenWhereInput[] = [];

    if (filter.marke !== undefined) {
        and.push({ marke: { contains: filter.marke, mode: 'insensitive' } });
    }

    if (filter.modell !== undefined) {
        and.push({ modell: { contains: filter.modell, mode: 'insensitive' } });
    }

    if (filter.fahrzeugklasse !== undefined) {
        and.push({ fahrzeugklasse: filter.fahrzeugklasse });
    }

    if (filter.kraftstoffart !== undefined) {
        and.push({ kraftstoffart: filter.kraftstoffart });
    }

    if (filter.schadenfrei !== undefined) {
        and.push({ schadenfrei: filter.schadenfrei });
    }

    return and.length === 0 ? {} : { AND: and };
};

export const buildPagination = (
    filter: Pick<GebrauchtwagenSearchParams, 'page' | 'size'>,
): Pick<Prisma.GebrauchtwagenFindManyArgs, 'skip' | 'take'> => ({
    skip: (filter.page - 1) * filter.size,
    take: filter.size,
});

export const buildFindManyArgs = (
    filter: GebrauchtwagenSearchParams,
): Prisma.GebrauchtwagenFindManyArgs => ({
    where: buildGebrauchtwagenWhere(filter),
    ...buildPagination(filter),
    orderBy: [{ id: 'asc' }],
});

import { z, type ZodError } from 'zod';
import {
    createProblemDetails,
    unprocessableContent,
} from '../problem-details.mts';

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

export const gebrauchtwagenBodySchema = z.object({
    marke: z.string().trim().min(1),
    modell: z.string().trim().min(1),
    fahrzeugklasse: z.enum(fahrzeugklasseValues),
    kraftstoffart: z.enum(kraftstoffartValues),
    schadenfrei: z.boolean(),
    kilometerstand: z.number().int().min(0),
});

export type GebrauchtwagenBody = z.infer<typeof gebrauchtwagenBodySchema>;

export const parseGebrauchtwagenBody = async (
    request: Request,
): Promise<GebrauchtwagenBody> =>
    gebrauchtwagenBodySchema.parse(await request.json());

export const isPositiveId = (id: number): boolean =>
    Number.isInteger(id) && id > 0;

export const createInvalidIdResponse = (): Response =>
    createProblemDetails(
        unprocessableContent,
        'id muss eine positive ganze Zahl sein',
    );

export const createValidationErrorResponse = (error: ZodError): Response =>
    createProblemDetails(
        unprocessableContent,
        error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    );

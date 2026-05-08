// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Aufruf:  bun i
//          bun --env-file=.env prisma generate
//
//          bun --env-file=.env src\beispiele.mts

import process from 'node:process';
import { styleText } from 'node:util';
import { ZodError } from 'zod';
import {
    type Gebrauchtwagen,
    type Prisma,
} from './generated/prisma/client.ts';
import {
    createPrismaClient,
    registerPrismaQueryLogger,
} from './config/prisma-client.mts';
import {
    buildFindManyArgs,
    parseGebrauchtwagenSearchParams,
} from './gebrauchtwagen-query.mts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

const prisma = createPrismaClient();
registerPrismaQueryLogger(prisma);

const printResult = (label: string, value: unknown): void => {
    const printLabel = styleText(['black', 'bgWhite'], label);
    console.log(`${printLabel} = %j`, value);
    console.log();
};

const printValidationError = (error: ZodError): void => {
    const printLabel = styleText(['black', 'bgWhite'], 'Validierungsfehler');
    const details = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
    }));

    console.log(`${printLabel} = %j`, details);
    console.log();
};

try {
    await prisma.$connect();

    const gebrauchtwagenById: Gebrauchtwagen | null =
        await prisma.gebrauchtwagen.findUnique({
            where: { id: 1 },
        });
    printResult('gebrauchtwagenById', gebrauchtwagenById);

    const byMarkeUndModell =
        await prisma.gebrauchtwagen.findMany({
            ...buildFindManyArgs(
                parseGebrauchtwagenSearchParams({
                    marke: 'VW',
                    modell: 'golf',
                    page: 1,
                    size: 10,
                }),
            ),
        });
    printResult('byMarkeUndModell', byMarkeUndModell);

    const byFahrzeugklasseUndKraftstoff =
        await prisma.gebrauchtwagen.findMany({
            ...buildFindManyArgs(
                parseGebrauchtwagenSearchParams({
                    fahrzeugklasse: 'KOMPAKTKLASSE',
                    kraftstoffart: 'BENZIN',
                    page: 1,
                    size: 10,
                }),
            ),
        });
    printResult('byFahrzeugklasseUndKraftstoff', byFahrzeugklasseUndKraftstoff);

    const bySchadenfrei = await prisma.gebrauchtwagen.findMany({
        ...buildFindManyArgs(
            parseGebrauchtwagenSearchParams({
                schadenfrei: true,
                page: 1,
                size: 10,
            }),
        ),
    });
    printResult('bySchadenfrei', bySchadenfrei);

    const kombiniert =
        await prisma.gebrauchtwagen.findMany({
            ...buildFindManyArgs(
                parseGebrauchtwagenSearchParams({
                    marke: 'V',
                    fahrzeugklasse: 'KOMPAKTKLASSE',
                    schadenfrei: false,
                    page: 1,
                    size: 10,
                }),
            ),
        });
    printResult('kombiniert', kombiniert);

    const page1: Gebrauchtwagen[] =
        await prisma.gebrauchtwagen.findMany({
            ...buildFindManyArgs(
                parseGebrauchtwagenSearchParams({
                    page: 1,
                    size: 3,
                }),
            ),
        });
    const page2: Gebrauchtwagen[] =
        await prisma.gebrauchtwagen.findMany({
            ...buildFindManyArgs(
                parseGebrauchtwagenSearchParams({
                    page: 2,
                    size: 3,
                }),
            ),
        });
    printResult('page1', page1.map((fahrzeug) => fahrzeug.id));
    printResult('page2', page2.map((fahrzeug) => fahrzeug.id));

    try {
        parseGebrauchtwagenSearchParams({
            kraftstoffart: 'STROM',
        });
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            printValidationError(error);
        } else {
            throw error;
        }
    }
} finally {
    await prisma.$disconnect();
}

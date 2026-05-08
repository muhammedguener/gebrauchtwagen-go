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
import {
    type Gebrauchtwagen,
    type Prisma,
} from './generated/prisma/client.ts';
import {
    createPrismaClient,
    registerPrismaQueryLogger,
} from './config/prisma-client.mts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

const prisma = createPrismaClient();
registerPrismaQueryLogger(prisma);

export type GebrauchtwagenMitDetails = Prisma.GebrauchtwagenGetPayload<{
    include: {
        hauptuntersuchung: true;
        schaeden: true;
        standort: true;
    };
}>;

try {
    await prisma.$connect();

    const gebrauchtwagen: Gebrauchtwagen | null =
        await prisma.gebrauchtwagen.findUnique({
            where: { id: 1 },
        });
    message = styleText(['black', 'bgWhite'], 'gebrauchtwagen');
    console.log(`${message} = %j`, gebrauchtwagen);
    console.log();

    const fahrzeugeInKarlsruhe: GebrauchtwagenMitDetails[] =
        await prisma.gebrauchtwagen.findMany({
            where: {
                standort: {
                    ort: {
                        contains: 'Karlsruhe',
                    },
                },
            },
            include: {
                hauptuntersuchung: true,
                schaeden: true,
                standort: true,
            },
        });
    message = styleText(['black', 'bgWhite'], 'fahrzeugeInKarlsruhe');
    console.log(`${message} = %j`, fahrzeugeInKarlsruhe);
    console.log();

    const marken = fahrzeugeInKarlsruhe.map((fahrzeug) => fahrzeug.marke);
    message = styleText(['black', 'bgWhite'], 'marken');
    console.log(`${message} = %j`, marken);
    console.log();

    const standorte = fahrzeugeInKarlsruhe.map(
        (fahrzeug) => fahrzeug.standort?.ort,
    );
    message = styleText(['black', 'bgWhite'], 'standorte');
    console.log(`${message} = %j`, standorte);
    console.log();

    const kompakteFahrzeuge: Gebrauchtwagen[] =
        await prisma.gebrauchtwagen.findMany({
            where: {
                fahrzeugklasse: 'KOMPAKTKLASSE',
                kilometerstand: {
                    lte: 50_000,
                },
            },
            orderBy: {
                kilometerstand: 'asc',
            },
        });
    message = styleText(['black', 'bgWhite'], 'kompakteFahrzeuge');
    console.log(`${message} = %j`, kompakteFahrzeuge);
    console.log();

    const fahrzeugePage2: Gebrauchtwagen[] =
        await prisma.gebrauchtwagen.findMany({
            skip: 5,
            take: 5,
        });
    message = styleText(['black', 'bgWhite'], 'fahrzeugePage2');
    console.log(`${message} = %j`, fahrzeugePage2);
    console.log();
} finally {
    await prisma.$disconnect();
}

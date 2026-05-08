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

// Aufruf:   bun i
//           bun --env-file=.env prisma generate
//
//           bun --env-file=.env src\beispiele-write.mts

import process from 'node:process';
import { styleText } from 'node:util';
import { type Prisma } from './generated/prisma/client.ts';
import {
    createPrismaClient,
    registerPrismaQueryLogger,
} from './config/prisma-client.mts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const prisma = createPrismaClient();
registerPrismaQueryLogger(prisma);

const neuerGebrauchtwagen: Prisma.GebrauchtwagenCreateInput = {
    fin: 'WVWZZZCDZRW900099',
    marke: 'VW',
    modell: 'ID.3 Pro',
    baujahr: 2024,
    kilometerstand: 7500,
    kraftstoffart: 'ELEKTRO',
    fahrzeugklasse: 'KOMPAKTKLASSE',
    erstzulassung: '2024-04-15T00:00:00Z',
    schadenfrei: true,
    ausstattung: {
        akkuKwh: 58,
        navi: true,
        waermepumpe: true,
    },
    beschreibungUrl: 'https://example.invalid/gebrauchtwagen/id3-pro',
    anbieterUsername: 'beispiel-haendler',
    kontaktEmail: 'beispiel@example.invalid',
    version: 1,
    hauptuntersuchung: {
        create: {
            pruefdatum: '2026-04-15T00:00:00Z',
            gueltigBis: '2028-04-30T00:00:00Z',
            prueforganisation: 'TUEV Sued',
            status: 'BESTANDEN',
        },
    },
    schaeden: {
        create: [
            {
                bezeichnung: 'Beispielhinweis',
                beschreibung: 'Nur fuer das Prisma-Schreibbeispiel.',
                feststellungsdatum: '2026-04-20T00:00:00Z',
            },
        ],
    },
    standort: {
        create: {
            plz: '76131',
            ort: 'Karlsruhe',
        },
    },
};
type GebrauchtwagenCreated = Prisma.GebrauchtwagenGetPayload<{
    include: {
        hauptuntersuchung: true;
        schaeden: true;
        standort: true;
    };
}>;

const geaenderterGebrauchtwagen: Prisma.GebrauchtwagenUpdateInput = {
    version: { increment: 1 },
    kilometerstand: { increment: 250 },
    schadenfrei: false,
    ausstattung: {
        navi: true,
        sitzheizung: true,
        beispielUpdate: true,
    },
    beschreibungUrl: 'https://example.invalid/gebrauchtwagen/aktualisiert',
};
type GebrauchtwagenUpdated = Prisma.GebrauchtwagenGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        const gebrauchtwagenDb: GebrauchtwagenCreated =
            await tx.gebrauchtwagen.create({
                data: neuerGebrauchtwagen,
                include: {
                    hauptuntersuchung: true,
                    schaeden: true,
                    standort: true,
                },
            });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${gebrauchtwagenDb.id}`);
        console.log();

        const gebrauchtwagenUpdated: GebrauchtwagenUpdated =
            await tx.gebrauchtwagen.update({
                data: geaenderterGebrauchtwagen,
                where: { id: 1 },
            });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${gebrauchtwagenUpdated.version}`);
        console.log();

        const geloescht = await tx.gebrauchtwagen.delete({
            where: { id: gebrauchtwagenDb.id },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}

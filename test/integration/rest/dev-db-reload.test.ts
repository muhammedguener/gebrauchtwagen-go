import { describe, expect, test } from 'vitest';
import '../setup.ts';

type ListResponse = {
    data: unknown[];
    total: number;
};

type ProblemDetails = {
    title: string;
    statusCode: number;
};

const adminHeaders = {
    Authorization: 'Bearer admin-token',
};

const userHeaders = {
    Authorization: 'Bearer user-token',
};

const validPayload = {
    marke: 'BMW',
    modell: '320i',
    fahrzeugklasse: 'MITTELKLASSE',
    kraftstoffart: 'BENZIN',
    schadenfrei: true,
    kilometerstand: 27000,
};

const getBaseUrl = (): string => {
    const baseUrl = process.env['TEST_BASE_URL'];
    if (baseUrl === undefined) {
        throw new Error('TEST_BASE_URL ist nicht gesetzt');
    }

    return baseUrl;
};

const readTotal = async (): Promise<number> => {
    const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`);
    const body = (await response.json()) as ListResponse;

    return body.total;
};

describe('POST /dev/db_populate', () => {
    test('setzt Demo-Daten mit Admin-Token zurueck', async () => {
        await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: {
                ...adminHeaders,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validPayload),
        });

        expect(await readTotal()).toBe(7);

        const response = await fetch(`${getBaseUrl()}/dev/db_populate`, {
            method: 'POST',
            headers: adminHeaders,
        });
        const body = (await response.json()) as {
            status: string;
            count: number;
        };

        expect(response.status).toBe(200);
        expect(body).toEqual({ status: 'reloaded', count: 6 });
        expect(await readTotal()).toBe(6);
    });

    test('liefert 401 ohne Bearer-Token', async () => {
        const response = await fetch(`${getBaseUrl()}/dev/db_populate`, {
            method: 'POST',
        });
        const body = (await response.json()) as ProblemDetails;

        expect(response.status).toBe(401);
        expect(body.title).toBe('Unauthorized');
    });

    test('liefert 403 ohne Admin-Rolle', async () => {
        const response = await fetch(`${getBaseUrl()}/dev/db_populate`, {
            method: 'POST',
            headers: userHeaders,
        });
        const body = (await response.json()) as ProblemDetails;

        expect(response.status).toBe(403);
        expect(body.title).toBe('Forbidden');
    });
});

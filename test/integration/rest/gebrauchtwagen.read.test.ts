import { describe, expect, it } from 'vitest';

type ListResponse = {
    data: Array<{ id: number; marke: string; modell: string; schadenfrei: boolean }>;
    page: number;
    size: number;
    total: number;
};

const getBaseUrl = (): string => {
    const baseUrl = process.env['TEST_BASE_URL'];
    if (baseUrl === undefined) {
        throw new Error('TEST_BASE_URL ist nicht gesetzt');
    }

    return baseUrl;
};

describe('REST GET /api/gebrauchtwagen', () => {
    it('liefert eine lesbare Liste (Erfolgsfall)', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen?page=1&size=2`);
        const body = (await response.json()) as ListResponse;

        expect(response.status).toBe(200);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.page).toBe(1);
        expect(body.size).toBe(2);
        expect(body.total).toBeGreaterThanOrEqual(2);
    });

    it('wendet einzelne Filter an (marke + modell)', async () => {
        const response = await fetch(
            `${getBaseUrl()}/api/gebrauchtwagen?marke=vw&modell=golf&page=1&size=10`,
        );
        const body = (await response.json()) as ListResponse;

        expect(response.status).toBe(200);
        expect(body.data.length).toBeGreaterThan(0);
        expect(body.data.every((item) => item.marke === 'VW')).toBe(true);
        expect(body.data.every((item) => item.modell.toLowerCase().includes('golf'))).toBe(true);
    });

    it('unterstützt kombinierte Filter', async () => {
        const response = await fetch(
            `${getBaseUrl()}/api/gebrauchtwagen?fahrzeugklasse=MITTELKLASSE&kraftstoffart=ELEKTRO&schadenfrei=true`,
        );
        const body = (await response.json()) as ListResponse;

        expect(response.status).toBe(200);
        expect(body.data.length).toBe(1);
        expect(body.data[0]?.id).toBe(4);
    });

    it('liefert reproduzierbare Paginierung', async () => {
        const page1Response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen?page=1&size=2`);
        const page2Response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen?page=2&size=2`);
        const page1Body = (await page1Response.json()) as ListResponse;
        const page2Body = (await page2Response.json()) as ListResponse;

        expect(page1Response.status).toBe(200);
        expect(page2Response.status).toBe(200);
        expect(page1Body.data.map((item) => item.id)).toEqual([1, 2]);
        expect(page2Body.data.map((item) => item.id)).toEqual([3, 4]);
    });

    it('liefert validierbaren Fehler bei ungültigen Filtern', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen?kraftstoffart=STROM`);
        const body = (await response.json()) as { error: string; details: unknown[] };

        expect(response.status).toBe(400);
        expect(body.error).toBe('VALIDATION_ERROR');
        expect(Array.isArray(body.details)).toBe(true);
        expect(body.details.length).toBeGreaterThan(0);
    });
});

describe('REST GET /api/gebrauchtwagen/:id', () => {
    it('liefert ein Objekt bei vorhandener id', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen/1`);
        const body = (await response.json()) as { id: number };

        expect(response.status).toBe(200);
        expect(body.id).toBe(1);
    });

    it('liefert 404 bei nicht vorhandener id (Fehlerfall)', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen/9999`);
        const body = (await response.json()) as { error: string };

        expect(response.status).toBe(404);
        expect(body.error).toBe('NOT_FOUND');
    });
});

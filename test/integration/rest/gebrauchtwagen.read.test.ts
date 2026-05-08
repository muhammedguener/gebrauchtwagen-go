import { describe, expect, it } from 'vitest';

type ListResponse = {
    data: Array<{ id: number; marke: string; modell: string; schadenfrei: boolean }>;
    page: number;
    size: number;
    total: number;
};

type GebrauchtwagenResponse = {
    id: number;
    marke: string;
    modell: string;
    fahrzeugklasse: string;
    kraftstoffart: string;
    schadenfrei: boolean;
    kilometerstand: number;
};

const adminHeaders = {
    Authorization: 'Bearer admin-token',
    'Content-Type': 'application/json',
};

const userHeaders = {
    Authorization: 'Bearer user-token',
    'Content-Type': 'application/json',
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

describe('REST CRUD /api/gebrauchtwagen', () => {
    it('legt einen Gebrauchtwagen an (POST Erfolgsfall)', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify(validPayload),
        });
        const body = (await response.json()) as GebrauchtwagenResponse;

        expect(response.status).toBe(201);
        expect(body.id).toBeGreaterThan(0);
        expect(body.marke).toBe('BMW');
    });

    it('aktualisiert einen Gebrauchtwagen (PUT Erfolgsfall)', async () => {
        const createResponse = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify(validPayload),
        });
        const created = (await createResponse.json()) as GebrauchtwagenResponse;

        const updateResponse = await fetch(`${getBaseUrl()}/api/gebrauchtwagen/${created.id}`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({
                ...validPayload,
                modell: '330i',
                kilometerstand: 28000,
                schadenfrei: false,
            }),
        });
        const updated = (await updateResponse.json()) as GebrauchtwagenResponse;

        expect(updateResponse.status).toBe(200);
        expect(updated.modell).toBe('330i');
        expect(updated.kilometerstand).toBe(28000);
        expect(updated.schadenfrei).toBe(false);
    });

    it('loescht einen Gebrauchtwagen (DELETE Erfolgsfall)', async () => {
        const createResponse = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify(validPayload),
        });
        const created = (await createResponse.json()) as GebrauchtwagenResponse;

        const deleteResponse = await fetch(`${getBaseUrl()}/api/gebrauchtwagen/${created.id}`, {
            method: 'DELETE',
            headers: adminHeaders,
        });
        const getResponse = await fetch(`${getBaseUrl()}/api/gebrauchtwagen/${created.id}`);

        expect(deleteResponse.status).toBe(204);
        expect(getResponse.status).toBe(404);
    });

    it('liefert Validierungsfehler bei ungueltigem POST-Body', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                ...validPayload,
                kilometerstand: -5,
            }),
        });
        const body = (await response.json()) as { error: string };

        expect(response.status).toBe(400);
        expect(body.error).toBe('VALIDATION_ERROR');
    });
});

describe('REST Auth-Basistests /api/gebrauchtwagen', () => {
    it('liefert 401 ohne Bearer-Token', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(validPayload),
        });
        const body = (await response.json()) as { error: string };

        expect(response.status).toBe(401);
        expect(body.error).toBe('UNAUTHORIZED');
    });

    it('liefert 403 mit falscher Rolle', async () => {
        const response = await fetch(`${getBaseUrl()}/api/gebrauchtwagen`, {
            method: 'POST',
            headers: userHeaders,
            body: JSON.stringify(validPayload),
        });
        const body = (await response.json()) as { error: string };

        expect(response.status).toBe(403);
        expect(body.error).toBe('FORBIDDEN');
    });
});

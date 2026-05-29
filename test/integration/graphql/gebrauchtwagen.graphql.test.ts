import { describe, expect, test } from 'vitest';
import '../setup.ts';

type GraphqlResponse<T> = {
    data?: T | null;
    errors?: { message: string; extensions?: { code?: string } }[];
};

const adminHeaders = {
    Authorization: 'Bearer admin-token',
    'Content-Type': 'application/json',
};

const validInput = {
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

const graphql = async <T>(
    query: string,
    variables: Record<string, unknown> = {},
    headers: Record<string, string> = { 'Content-Type': 'application/json' },
): Promise<GraphqlResponse<T>> => {
    const response = await fetch(`${getBaseUrl()}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    expect(response.status).toBe(200);

    return (await response.json()) as GraphqlResponse<T>;
};

describe('GraphQL /graphql', () => {
    test('liefert eine Fahrzeugliste', async () => {
        const body = await graphql<{
            gebrauchtwagenListe: {
                total: number;
                page: number;
                size: number;
                data: { id: string; marke: string }[];
            };
        }>(`
            query Fahrzeuge {
                gebrauchtwagenListe(input: { page: 1, size: 2 }) {
                    total
                    page
                    size
                    data {
                        id
                        marke
                    }
                }
            }
        `);

        expect(body.errors).toBeUndefined();
        expect(body.data?.gebrauchtwagenListe.page).toBe(1);
        expect(body.data?.gebrauchtwagenListe.size).toBe(2);
        expect(body.data?.gebrauchtwagenListe.total).toBeGreaterThanOrEqual(6);
        expect(body.data?.gebrauchtwagenListe.data).toHaveLength(2);
    });

    test('liefert ein Fahrzeug nach ID', async () => {
        const body = await graphql<{
            gebrauchtwagen: { id: string; marke: string; modell: string };
        }>(`
            query Fahrzeug {
                gebrauchtwagen(id: "1") {
                    id
                    marke
                    modell
                }
            }
        `);

        expect(body.errors).toBeUndefined();
        expect(body.data?.gebrauchtwagen).toStrictEqual({
            id: '1',
            marke: 'VW',
            modell: 'Golf',
        });
    });

    test('wendet Suchfilter an', async () => {
        const body = await graphql<{
            gebrauchtwagenListe: { data: { id: string; marke: string }[] };
        }>(`
            query Suche {
                gebrauchtwagenListe(
                    input: {
                        fahrzeugklasse: MITTELKLASSE
                        kraftstoffart: ELEKTRO
                        schadenfrei: true
                    }
                ) {
                    data {
                        id
                        marke
                    }
                }
            }
        `);

        expect(body.errors).toBeUndefined();
        expect(body.data?.gebrauchtwagenListe.data).toStrictEqual([
            { id: '4', marke: 'Tesla' },
        ]);
    });

    test('legt ein Fahrzeug an, aktualisiert und loescht es', async () => {
        const createBody = await graphql<{
            createGebrauchtwagen: {
                id: string;
                version: number;
                marke: string;
            };
        }>(
            `
                mutation Create($input: GebrauchtwagenInput!) {
                    createGebrauchtwagen(input: $input) {
                        id
                        version
                        marke
                    }
                }
            `,
            { input: validInput },
            adminHeaders,
        );
        const created = createBody.data?.createGebrauchtwagen;

        expect(createBody.errors).toBeUndefined();
        expect(created?.marke).toBe('BMW');
        expect(created?.version).toBe(1);

        const updateBody = await graphql<{
            updateGebrauchtwagen: { version: number };
        }>(
            `
                mutation Update(
                    $id: ID!
                    $version: Int!
                    $input: GebrauchtwagenInput!
                ) {
                    updateGebrauchtwagen(
                        id: $id
                        version: $version
                        input: $input
                    ) {
                        version
                    }
                }
            `,
            {
                id: created?.id,
                version: created?.version,
                input: { ...validInput, modell: '330i' },
            },
            adminHeaders,
        );

        expect(updateBody.errors).toBeUndefined();
        expect(updateBody.data?.updateGebrauchtwagen.version).toBe(2);

        const deleteBody = await graphql<{
            deleteGebrauchtwagen: { success: boolean };
        }>(
            `
                mutation Delete($id: ID!) {
                    deleteGebrauchtwagen(id: $id) {
                        success
                    }
                }
            `,
            { id: created?.id },
            adminHeaders,
        );

        expect(deleteBody.errors).toBeUndefined();
        expect(deleteBody.data?.deleteGebrauchtwagen.success).toBe(true);
    });

    test('liefert Auth-Fehler fuer Mutation ohne Bearer-Token', async () => {
        const body = await graphql<{
            createGebrauchtwagen: { id: string };
        }>(
            `
                mutation Create($input: GebrauchtwagenInput!) {
                    createGebrauchtwagen(input: $input) {
                        id
                    }
                }
            `,
            { input: validInput },
        );

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED');
    });

    test('liefert Validierungsfehler bei ungueltigem Input', async () => {
        const body = await graphql<{
            createGebrauchtwagen: { id: string };
        }>(
            `
                mutation Create($input: GebrauchtwagenInput!) {
                    createGebrauchtwagen(input: $input) {
                        id
                    }
                }
            `,
            {
                input: {
                    ...validInput,
                    kilometerstand: -1,
                },
            },
            adminHeaders,
        );

        expect(body.data).toBeNull();
        expect(body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    });
});

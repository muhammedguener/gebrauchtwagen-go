import type { GebrauchtwagenSearchParams } from '../gebrauchtwagen-query.mts';
import type {
    GebrauchtwagenDto,
    GebrauchtwagenWrite,
} from '../service/gebrauchtwagen-service.mts';

export type ID = string & { readonly brand: 'ID' };

export type GebrauchtwagenInput = GebrauchtwagenWrite;

export type GebrauchtwagenSearchInput = Partial<GebrauchtwagenSearchParams>;

export type UpdatePayload = {
    version: number;
};

export type DeletePayload = {
    success: boolean;
};

export const typeDefs = /* GraphQL */ `
    type Query {
        gebrauchtwagen(id: ID!): Gebrauchtwagen!
        gebrauchtwagenListe(
            input: GebrauchtwagenSearchInput
        ): GebrauchtwagenPage!
    }

    type Mutation {
        createGebrauchtwagen(input: GebrauchtwagenInput!): Gebrauchtwagen!
        updateGebrauchtwagen(
            id: ID!
            version: Int!
            input: GebrauchtwagenInput!
        ): UpdatePayload!
        deleteGebrauchtwagen(id: ID!): DeletePayload!
    }

    type Gebrauchtwagen {
        id: ID!
        marke: String!
        modell: String!
        fahrzeugklasse: Fahrzeugklasse!
        kraftstoffart: Kraftstoffart!
        schadenfrei: Boolean!
        kilometerstand: Int!
        version: Int!
    }

    type GebrauchtwagenPage {
        data: [Gebrauchtwagen!]!
        page: Int!
        size: Int!
        total: Int!
    }

    type UpdatePayload {
        version: Int!
    }

    type DeletePayload {
        success: Boolean!
    }

    input GebrauchtwagenSearchInput {
        marke: String
        modell: String
        fahrzeugklasse: Fahrzeugklasse
        kraftstoffart: Kraftstoffart
        schadenfrei: Boolean
        page: Int
        size: Int
    }

    input GebrauchtwagenInput {
        marke: String!
        modell: String!
        fahrzeugklasse: Fahrzeugklasse!
        kraftstoffart: Kraftstoffart!
        schadenfrei: Boolean!
        kilometerstand: Int!
    }

    enum Fahrzeugklasse {
        KLEINWAGEN
        KOMPAKTKLASSE
        MITTELKLASSE
        OBERKLASSE
        SUV
        KOMBI
        CABRIO
        TRANSPORTER
    }

    enum Kraftstoffart {
        BENZIN
        DIESEL
        ELEKTRO
        HYBRID
        ERDGAS
        WASSERSTOFF
    }
`;

export const toId = (value: string | number): ID => value.toString() as ID;

export const toNumber = (id: ID): number => Number.parseInt(id, 10);

export const toGebrauchtwagenType = (
    fahrzeug: GebrauchtwagenDto,
): Omit<GebrauchtwagenDto, 'id'> & { id: ID } => ({
    ...fahrzeug,
    id: toId(fahrzeug.id),
});

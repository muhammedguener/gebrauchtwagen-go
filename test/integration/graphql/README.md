# GraphQL Integrationstests

Die Tests pruefen den GraphQL-Yoga-Endpunkt `/graphql` mit der Fetch API.

Abgedeckt sind:

- Liste und Detailabfrage fuer Gebrauchtwagen
- Suche mit Fahrzeugklasse, Kraftstoffart und Schadenfreiheit
- Mutations fuer Create, Update und Delete
- Auth-Basisfehler fuer fehlenden Bearer-Token
- Zod-Validierungsfehler fuer ungueltige Mutation-Eingaben

Die Tests verwenden denselben Fixture-Service wie die REST-Integrationstests.

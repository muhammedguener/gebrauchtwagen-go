# gebrauchtwagen-ts

Neutrale Prisma- und TypeScript-Grundlage fuer die weitere Entwicklung des
Aggregats `gebrauchtwagen`.

## Zweck

Dieses Repository startet bewusst ohne fachliches Beispielaggregat. Es dient als
separater Team-Startpunkt neben dem bestehenden FastAPI-Repository
`gebrauchtwagen`.

Die naechsten fachlichen Schritte sind:

1. Lokale `.env` aus `.env.example` anlegen.
2. PostgreSQL starten und das Schema laden.
3. Prisma-Models aus der Datenbank introspektieren.
4. Danach die TypeScript-spezifische Anwendungslogik und Beispiele ergaenzen.

## Enthalten

- Bun-, TypeScript-, ESLint- und Prettier-Konfiguration
- Prisma-Konfiguration mit leerem Startschema
- Platz fuer den generierten Prisma-Client unter `src/generated/prisma`
- PostgreSQL-Compose-Setup mit DDL und CSV-Beispieldaten

## Absichtlich entfernt

- das vorherige Beispielaggregat aus Schema und Skripten
- die dazugehoerigen SQL- und Compose-Dateien
- die lokale `.env`

## DB-Backend einrichten

```powershell
Copy-Item .env.example .env
docker compose -f extras\compose\postgres\compose.yml up -d db
docker exec gebrauchtwagen-db psql -U gebrauchtwagen -d gebrauchtwagen -v ON_ERROR_STOP=1 -f /init/gebrauchtwagen/sql/create-schema.sql
docker exec gebrauchtwagen-db psql -U gebrauchtwagen -d gebrauchtwagen -v ON_ERROR_STOP=1 -f /init/gebrauchtwagen/sql/load-csv.sql
```

Danach kann das Prisma-Schema aus der bestehenden Datenbank erzeugt werden:

```powershell
bun --env-file=.env prisma db pull
bun --env-file=.env prisma generate
```

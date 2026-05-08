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
- PlantUML-ER-Diagramm unter `docs/er-diagramm.md`

## Absichtlich entfernt

- das vorherige Beispielaggregat aus Schema und Skripten
- die dazugehoerigen SQL- und Compose-Dateien
- die lokale `.env`

## ER-Diagramm

Das relationale Zielmodell ist als PlantUML-ER-Diagramm dokumentiert:

- [docs/er-diagramm.md](docs/er-diagramm.md)
- [docs/diagramme/src/er-diagramm.plantuml](docs/diagramme/src/er-diagramm.plantuml)

In VS Code kann die PlantUML-Datei mit der PlantUML-Erweiterung geoeffnet und
mit `<Alt>d` als Vorschau angezeigt werden.

## DB-Backend einrichten

```powershell
Copy-Item .env.example .env
docker compose -f extras\compose\postgres\compose.yml up -d db
```

Danach kann das Prisma-Schema aus der bestehenden Datenbank erzeugt werden:

```powershell
bun --env-file=.env prisma db pull
bun run prisma:generate
```

Beim ersten Initialisieren des PostgreSQL-Containers werden Schema und CSV-Daten
automatisch geladen. Wenn der Container schon vorher existierte, kann die
Demo-Datenbank mit folgendem Befehl neu aufgebaut werden:

```powershell
docker compose -f extras\compose\postgres\compose.yml down
docker compose -f extras\compose\postgres\compose.yml up -d db
```

## Aufruf der Beispiele

Die zentrale Prisma-Factory fuer die App liegt in
`src/config/prisma-client.mts`.
Sie kapselt Adapter, Logging und den Zugriff auf `DATABASE_URL`.

Ein einfacher Verbindungscheck gegen die Compose-DB erfolgt ueber die
Beispielskripte:

```powershell
bun --env-file=.env src/beispiele.mts
```

Die Beispiel-Datei `src\beispiele.mts` zeigt lesende Prisma-Zugriffe mit
Filterbedingungen, Relationen, Mapping und Pagination:

```powershell
bun --env-file=.env src/beispiele.mts
```

Die Beispiel-Datei `src\beispiele-write.mts` zeigt schreibende Prisma-Zugriffe
mit `create`, `update`, `delete`, verschachtelten Relationen und Transaktion:

```powershell
bun --env-file=.env src/beispiele-write.mts
```

Beide Beispiele koennen auch als ausfuehrbare Dateien gebaut werden:

```powershell
bun run build
bun run build:write
```

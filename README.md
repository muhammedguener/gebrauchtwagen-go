# gebrauchtwagen-ts

Neutrale Prisma- und TypeScript-Grundlage fuer die weitere Entwicklung des
Aggregats `gebrauchtwagen`.

## Zweck

Dieses Repository startet bewusst ohne fachliches Beispielaggregat. Es dient als
separater Team-Startpunkt neben dem bestehenden FastAPI-Repository
`gebrauchtwagen`.

Die naechsten fachlichen Schritte sind:

1. DB-bezogene Dateien aus `C:\Users\anna\gebrauchtwagen` gezielt uebernehmen.
2. Das Prisma-Datenmodell fuer das Aggregat `gebrauchtwagen` aufbauen.
3. Danach die TypeScript-spezifische Anwendungslogik und Beispiele ergaenzen.

## Enthalten

- Bun-, TypeScript-, ESLint- und Prettier-Konfiguration
- Prisma-Konfiguration mit leerem Startschema
- Platz fuer den generierten Prisma-Client unter `src/generated/prisma`
- generische PostgreSQL-Ressourcen unter `src/config/resources/postgresql`

## Absichtlich entfernt

- das vorherige Beispielaggregat aus Schema und Skripten
- die dazugehoerigen SQL- und Compose-Dateien
- die lokale `.env`

## Erste lokale Schritte

```powershell
bun i
bun --env-file=.env prisma generate
```

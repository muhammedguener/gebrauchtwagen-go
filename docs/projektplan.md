# Projektplan

Dieser Plan strukturiert die Umsetzung des Gebrauchtwagen-Appservers mit Bun,
Hono, Prisma, PostgreSQL, GraphQL Yoga, Keycloak, Docker, GitHub Actions,
Bruno, k6, Pino, AsciiDoctor und OWASP Dependency Check.

## Team und Arbeitsweise

| Person | Schwerpunkt |
| ------ | ----------- |
| Anna | Hono-App, REST, GraphQL, Doku, Docker |
| Mo | Prisma/PostgreSQL, Keycloak, Tests, CI, Lasttests |

- Planung: GitHub Projects mit `Backlog`, `Ready`, `In Progress`, `Review`,
  `Done`.
- Branches: `feature/<issue-nr>-<kurzer-name>`.
- Commits: Deutsch, kurz, fachlich, ohne Punkt am Ende.
- Pull Requests: Issue verlinken, Testnotiz ergaenzen, gegenseitig reviewen.
- Zeiterfassung: Excel mit Datum, Person, Issue, Taetigkeit, Dauer, Ergebnis.

## Issue-Backlog

| Nr. | Titel | Labels | Person | Ergebnis |
| --- | ----- | ------ | ------ | -------- |
| 1 | Hono-Grundstruktur fuer Appserver portieren | backend, logging | Anna | App startet mit Config, Health, Pino, CORS, Security Headers |
| 2 | Prisma-Client und DB-Konfiguration integrieren | db | Mo | Gemeinsame Prisma-Factory mit PostgreSQL-Verbindung |
| 3 | REST-Lesezugriffe fuer Gebrauchtwagen implementieren | rest, test | Anna | `GET /rest/gebrauchtwagen` und `GET /rest/gebrauchtwagen/:id` |
| 4 | REST-Schreibzugriffe mit Zod validieren | rest, test | Anna | `POST`, `PUT`, `DELETE`, Problem Details |
| 5 | Suchfilter und Pagination umsetzen | rest, db | Mo | Filter fuer Marke, Modell, Fahrzeugklasse, Kraftstoffart, Schadenfreiheit |
| 6 | Vitest-Integrationstests mit Fetch API aufbauen | test | Mo | REST-CRUD, Fehlerfaelle und Auth-Basistests |
| 7 | GraphQL Yoga integrieren | graphql | Anna | Queries und Mutations ueber dieselbe Service-Schicht |
| 8 | Keycloak mit OIDC und OAuth2 anbinden | auth, security | Mo | Tokenpruefung, Rollen `user` und `admin` |
| 9 | Bruno Collection erstellen | bruno | Anna | REST, GraphQL, Auth, Health, Prometheus, DB Reload |
| 10 | GitHub Actions fuer Qualitaetssicherung einrichten | ci | Mo | `tsc`, ESLint, Prettier, Tests, Prisma Generate |
| 11 | Docker-Image und Compose-Setup finalisieren | docker | Anna | App, DB und Keycloak starten reproduzierbar |
| 12 | Monitoring und Pino-Logging abrunden | logging | Anna | Request Logs, Response Time, Prometheus-Endpunkt |
| 13 | k6-Lasttests vorbereiten | k6 | Mo | Lasttest-Skript fuer REST und GraphQL |
| 14 | OWASP Dependency Check dokumentieren | security, docs | Mo | Skript und Ergebnisdokumentation |
| 15 | Projekthandbuch mit AsciiDoctor und PlantUML erstellen | docs | Anna | Architektur, ER, Sequenz, Tests, CI, Security, Lasttests |

## Erste Umsetzungsreihenfolge

1. Issue 1 und 2 als technische Basis.
2. Issue 3 bis 6 fuer REST und Testbarkeit.
3. Issue 7 und 8 fuer GraphQL und Security.
4. Issue 9 bis 14 fuer Tooling, Betrieb und Bewertungskriterien.
5. Issue 15 laufend pflegen und am Ende abschliessen.

## Akzeptanzkriterien

- `bun run tsc`, `bun run eslint`, `bun run prettier:check` und
  `bun run test` laufen lokal und in GitHub Actions.
- Docker Compose startet PostgreSQL, Keycloak und Appserver reproduzierbar.
- REST, GraphQL, Bruno, k6, Security Checks und Doku sind im README oder
  Projekthandbuch nachvollziehbar beschrieben.
- GitHub Project, Issues, PRs, Commits und Excel-Zeiterfassung dokumentieren
  die Arbeit von Anna und Mo.

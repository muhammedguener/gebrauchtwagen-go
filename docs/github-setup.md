# GitHub Setup

Diese Befehle bereiten Labels und Issues fuer das GitHub Project vor. Die
Issue-Nummern entstehen beim Anlegen automatisch; Branch-Namen werden danach an
die tatsaechlichen Nummern angepasst.

## Labels

```powershell
gh label create rest --color 0E8A16 --description "REST-Schnittstelle"
gh label create graphql --color 5319E7 --description "GraphQL Yoga"
gh label create db --color 1D76DB --description "Prisma und PostgreSQL"
gh label create auth --color D93F0B --description "Keycloak, OIDC und OAuth2"
gh label create docker --color 006B75 --description "Docker und Compose"
gh label create ci --color FBCA04 --description "GitHub Actions"
gh label create test --color C2E0C6 --description "Vitest und Testdaten"
gh label create docs --color 0075CA --description "AsciiDoctor und PlantUML"
gh label create security --color B60205 --description "Security Checks"
gh label create bruno --color 7057FF --description "Bruno Collection"
gh label create k6 --color F9D0C4 --description "Lasttests mit k6"
gh label create logging --color D4C5F9 --description "Pino und Monitoring"
gh label create backend --color 1D76DB --description "Hono-Appserver"
```

## Issues

```powershell
gh issue create --title "Hono-Grundstruktur fuer Appserver portieren" --label backend,logging --assignee buan1027 --body "Ziel: App startet mit Config, Health, Pino, CORS, Security Headers und Compression.`n`nAkzeptanz: bun run dev startet den Appserver; Health-Endpunkte liefern erwartete Antworten."
gh issue create --title "Prisma-Client und DB-Konfiguration integrieren" --label db --assignee muhammedguener --body "Ziel: Gemeinsame Prisma-Factory mit PostgreSQL-Verbindung.`n`nAkzeptanz: Prisma Client wird generiert und Beispielzugriffe funktionieren gegen Compose-DB."
gh issue create --title "REST-Lesezugriffe fuer Gebrauchtwagen implementieren" --label rest,test --assignee buan1027 --body "Ziel: GET /rest/gebrauchtwagen und GET /rest/gebrauchtwagen/:id.`n`nAkzeptanz: Integrationstests pruefen Liste, Detail und 404."
gh issue create --title "REST-Schreibzugriffe mit Zod validieren" --label rest,test --assignee buan1027 --body "Ziel: POST, PUT und DELETE mit Zod-Validierung und Problem Details.`n`nAkzeptanz: Tests decken erfolgreiche Schreibzugriffe, 422 und Versionskonflikte ab."
gh issue create --title "Suchfilter und Pagination umsetzen" --label rest,db --assignee muhammedguener --body "Ziel: Filter fuer Marke, Modell, Fahrzeugklasse, Kraftstoffart und Schadenfreiheit.`n`nAkzeptanz: Tests pruefen kombinierte Filter und Pagination."
gh issue create --title "Vitest-Integrationstests mit Fetch API aufbauen" --label test --assignee muhammedguener --body "Ziel: Teststruktur analog zur technischen Vorlage.`n`nAkzeptanz: bun run test laeuft lokal und spaeter in CI."
gh issue create --title "GraphQL Yoga integrieren" --label graphql --assignee buan1027 --body "Ziel: Queries und Mutations ueber dieselbe Service-Schicht wie REST.`n`nAkzeptanz: GraphQL-Tests pruefen Query, Suche, Create, Update und Delete."
gh issue create --title "Keycloak mit OIDC und OAuth2 anbinden" --label auth,security --assignee muhammedguener --body "Ziel: Tokenpruefung mit jose und Rollen user/admin.`n`nAkzeptanz: Schreibzugriffe sind geschuetzt; Tests pruefen fehlende, falsche und unzureichende Tokens."
gh issue create --title "Bruno Collection erstellen" --label bruno --assignee buan1027 --body "Ziel: REST, GraphQL, Auth, Health, Prometheus und DB Reload als Bruno Requests.`n`nAkzeptanz: Collection ist im Repo dokumentiert und lokal ausfuehrbar."
gh issue create --title "GitHub Actions fuer Qualitaetssicherung einrichten" --label ci --assignee muhammedguener --body "Ziel: CI fuer Bun install, Prisma Generate, tsc, ESLint und Prettier Check.`n`nAkzeptanz: Workflow laeuft bei Push und Pull Request."
gh issue create --title "Docker-Image und Compose-Setup finalisieren" --label docker --assignee buan1027 --body "Ziel: App, PostgreSQL und Keycloak reproduzierbar starten.`n`nAkzeptanz: docker compose startet die lokale Gesamtumgebung."
gh issue create --title "Monitoring und Pino-Logging abrunden" --label logging --assignee buan1027 --body "Ziel: Request Logs, Response Time und Prometheus-Endpunkt.`n`nAkzeptanz: Logs sind strukturiert; Prometheus liefert Metriken."
gh issue create --title "k6-Lasttests vorbereiten" --label k6 --assignee muhammedguener --body "Ziel: Lasttest-Skript fuer REST und GraphQL.`n`nAkzeptanz: bun run k6 bzw. k6 run test/lasttest/script.ts ist dokumentiert ausfuehrbar."
gh issue create --title "OWASP Dependency Check dokumentieren" --label security,docs --assignee muhammedguener --body "Ziel: Dependency Check Skript und Ergebnisdokumentation.`n`nAkzeptanz: Projekthandbuch beschreibt Aufruf, Ergebnis und Bewertung."
gh issue create --title "Projekthandbuch mit AsciiDoctor und PlantUML erstellen" --label docs --assignee buan1027 --body "Ziel: Architektur, ER, Sequenz, Tests, CI, Security, Lasttests und Teamarbeit dokumentieren.`n`nAkzeptanz: AsciiDoctor-Ausgabe ist reproduzierbar."
```

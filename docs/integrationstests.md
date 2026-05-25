# Vitest-Integrationstests

Diese Projektdokumentation beschreibt die lokale Ausfuehrung der
Vitest-Integrationstests fuer Ticket 6.

## Testlauf lokal

```powershell
cd C:\Projekt3\hono
$env:Path += ";C:\Users\muham\.bun\bin"
bun x vitest --run
```

## k6-Lasttests (Ticket 13)

Das Lasttest-Skript liegt unter `test/lasttest/script.ts` und belastet
REST-Lesezugriffe. Ein zusaetzliches GraphQL-Szenario ist enthalten und kann
bei verfuegbarem GraphQL-Endpunkt aktiviert werden.

```powershell
cd C:\Projekt3\hono
$env:Path += ";C:\Users\muham\.bun\bin"
bun run k6
```

Optional mit GraphQL-Szenario:

```powershell
$env:ENABLE_GRAPHQL = "true"
$env:GRAPHQL_PATH = "/graphql"
bun run k6
```

Optional mit angepasster Testdauer und Lastprofil:

```powershell
$env:REST_RAMP_UP_DURATION = "10s"
$env:REST_HOLD_DURATION = "20s"
$env:REST_MAX_VUS = "8"
$env:THRESHOLD_P95 = "p(95)<1500"
bun run k6
```

Schneller Smoke-Run (kurz, lokal):

```powershell
$env:REST_RAMP_UP_DURATION = "5s"
$env:REST_HOLD_DURATION = "10s"
$env:REST_MAX_VUS = "3"
$env:HEALTH_PATH = "/health/liveness"
bun run k6
```

## Teststruktur

- REST-Tests liegen unter `test/integration/rest`
- GraphQL-Tests liegen unter `test/integration/graphql`
- Gemeinsames Setup fuer Basis-URL und lokalen Server liegt in `test/integration/setup.ts`
- Das Test-Setup nutzt worker-spezifische Ports, damit REST- und GraphQL-Suites
  parallel laufen koennen

## REST-Modulstruktur

Die REST-Route `/api/gebrauchtwagen` ist in kleine Hono-Module geschnitten:

- `src/rest/gebrauchtwagen-router.mts` setzt die Teilrouter zusammen
- `src/rest/gebrauchtwagen-read-router.mts` enthaelt `GET /` und `GET /:id`
- `src/rest/gebrauchtwagen-write-router.mts` enthaelt `POST`, `PUT` und `DELETE`
- `src/rest/gebrauchtwagen-validation.mts` buendelt Body- und ID-Validierung
- `src/rest/create-base-url.mts` erzeugt Base-URL und Location-Header
- `src/rest/rest-headers.mts` buendelt Accept-, ETag- und Auth-Helper
- `src/rest/statuscode.mts` haelt REST-spezifische Statuscodes zentral
- `src/service/gebrauchtwagen-service.mts` trennt die Service-Vertraege in
  Read- und Write-Service; `src/service/pageable.mts` erzeugt die gemeinsamen
  Page-/Slice-Daten fuer Listenresultate
- `src/container.mts` haelt die Default-Services als einfache manuelle
  Dependency-Injection-Stelle; Tests koennen weiterhin eigene Services ueber
  `createApp()` injizieren

Damit bleibt die Struktur nah an der Hono-Vorlage: Lesen und Schreiben sind
getrennt, Validierung und Header-Helfer liegen ausserhalb der Router, und die
fachliche REST-Funktionalitaet bleibt unveraendert.

Bewusst bleibt die fachliche Gruppierung vorerst bei `src/rest` und
`src/service`. Eine Verschiebung nach `src/gebrauchtwagen/router` und
`src/gebrauchtwagen/service` wuerde ohne neue Funktionalitaet viele Imports
beruehren und ist deshalb kein Bestandteil dieses Architektur-Follow-ups.

## GraphQL-Modulstruktur

Der GraphQL-Endpunkt `/graphql` ist analog zur Hono-Vorlage in kleine Module
geschnitten:

- `src/graphql/graphql-app.mts` bindet GraphQL Yoga in Hono ein
- `src/graphql/types.mts` definiert Schema, Eingabetypen und DTO-Mapping
- `src/graphql/query-handler.mts` nutzt den Read-Service fuer Liste, Suche und
  Detail
- `src/graphql/mutation-handler.mts` nutzt den Write-Service fuer Create,
  Update und Delete und wiederverwendet die Zod-Body-Validierung aus REST
- `src/graphql/errors.mts` bildet Validierungs-, Auth- und Systemfehler auf
  GraphQL-Fehlercodes ab

Die Mutations verwenden derzeit die vorhandene Bearer-Admin-Basispruefung.
Die vollstaendige Keycloak/OIDC-Anbindung bleibt bewusst in Issue #8.

## Abgedeckte Faelle in Ticket 6

- REST-Lesezugriffe fuer Liste und Detail
- REST-Schreibzugriffe fuer `POST`, `PUT` und `DELETE`
- GraphQL-Queries fuer Liste, Suche und Detail
- GraphQL-Mutations fuer Create, Update und Delete
- Prometheus-Metriken unter `/prometheus`
- Erfolgs- und Fehlerfaelle (`200`, `201`, `204`, `400`, `401`, `403`, `404`)
- Auth-Basistests fuer fehlenden Bearer-Token und fehlende Admin-Rolle

## Logging und Monitoring

Der Appserver nutzt Pino fuer strukturierte Logs. Das globale Log-Level kommt
aus `LOG_LEVEL`; Request-Logs enthalten Methode und URL, Response-Time-Logs
enthalten HTTP-Status und Dauer. Die Dauer ist zusaetzlich im Header
`X-Response-Time` sichtbar.

Prometheus-Metriken sind unter `/prometheus` abrufbar. Die Middleware
`src/monitoring/prometheus-metrics.mts` zaehlt Requests ueber
`http_requests_total` und misst Dauer mit
`http_request_duration_seconds`. Der Router
`src/monitoring/prometheus-router.mts` liefert das Prometheus-Textformat aus.

Die Integrationstests rufen den Metrik-Endpunkt per Fetch API ab. Die Bruno-
Collection fuer denselben manuellen Aufruf ist Teil von Issue #9.

## Technische Einordnung

Die Integrationstests nutzen die Fetch API gegen eine lokal gestartete Hono-App.
Dadurch koennen sie ohne externe Services laufen und bereits in CI oder lokal
ausgefuehrt werden.

Falls spaeter eine persistente Datenbank oder weitere Infrastruktur in CI noetig
wird, kann die Pipeline darauf erweitert werden. Der aktuelle Stand ist bewusst
so gehalten, dass die Tests bereits heute reproduzierbar laufen.

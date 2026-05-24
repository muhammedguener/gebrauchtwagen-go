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
- GraphQL ist fuer spaetere Tests unter `test/integration/graphql` vorbereitet
- Gemeinsames Setup fuer Basis-URL und lokalen Server liegt in `test/integration/setup.ts`

## REST-Modulstruktur

Die REST-Route `/api/gebrauchtwagen` ist in kleine Hono-Module geschnitten:

- `src/rest/gebrauchtwagen-router.mts` setzt die Teilrouter zusammen
- `src/rest/gebrauchtwagen-read-router.mts` enthaelt `GET /` und `GET /:id`
- `src/rest/gebrauchtwagen-write-router.mts` enthaelt `POST`, `PUT` und `DELETE`
- `src/rest/gebrauchtwagen-validation.mts` buendelt Body- und ID-Validierung
- `src/rest/create-base-url.mts` erzeugt Base-URL und Location-Header
- `src/rest/rest-headers.mts` buendelt Accept-, ETag- und Auth-Helper
- `src/rest/statuscode.mts` haelt REST-spezifische Statuscodes zentral

Damit bleibt die Struktur nah an der Hono-Vorlage: Lesen und Schreiben sind
getrennt, Validierung und Header-Helfer liegen ausserhalb der Router, und die
fachliche REST-Funktionalitaet bleibt unveraendert.

## Abgedeckte Faelle in Ticket 6

- REST-Lesezugriffe fuer Liste und Detail
- REST-Schreibzugriffe fuer `POST`, `PUT` und `DELETE`
- Erfolgs- und Fehlerfaelle (`200`, `201`, `204`, `400`, `401`, `403`, `404`)
- Auth-Basistests fuer fehlenden Bearer-Token und fehlende Admin-Rolle

## Technische Einordnung

Die Integrationstests nutzen die Fetch API gegen eine lokal gestartete Hono-App.
Dadurch koennen sie ohne externe Services laufen und bereits in CI oder lokal
ausgefuehrt werden.

Falls spaeter eine persistente Datenbank oder weitere Infrastruktur in CI noetig
wird, kann die Pipeline darauf erweitert werden. Der aktuelle Stand ist bewusst
so gehalten, dass die Tests bereits heute reproduzierbar laufen.

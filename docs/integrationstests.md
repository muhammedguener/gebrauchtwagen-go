# Vitest-Integrationstests

Diese Projektdokumentation beschreibt die lokale Ausfuehrung der
Vitest-Integrationstests fuer Ticket 6.

## Testlauf lokal

```powershell
cd C:\Projekt3\hono
$env:Path += ";C:\Users\muham\.bun\bin"
bun x vitest --run
```

## Teststruktur

- REST-Tests liegen unter `test/integration/rest`
- GraphQL ist fuer spaetere Tests unter `test/integration/graphql` vorbereitet
- Gemeinsames Setup fuer Basis-URL und lokalen Server liegt in `test/integration/setup.ts`

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
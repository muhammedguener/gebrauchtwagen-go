Dieses Verzeichnis enthält Laufzeit-Logs, die während der Integrationstests gesammelt wurden.

- `gebrauchtwagen-db.log`: Docker/Postgres-Container-Logs (Start, Recovery, Init-Skript Meldungen).
- `proto-go-app.log`: Auszüge der API-Antworten (Health, POST/GET `/cars`) aus den Smoke-Tests.
- `db_smoke_test.output`: Kurzprotokoll des ausgeführten Smoke-Test-Versuchs inklusive Compose-Fehler (Port-Kollision) und Ergebnis der alternativen lokalen Testausführung.

Verwendung:
1. Lies die Logs, um Fehlerursachen (z. B. Port-Kollisionen, doppelte Inserts) zu prüfen.
2. Prüfe `hono/proto-go/README.md` für Anweisungen, wie die DB lokal gestartet werden kann.

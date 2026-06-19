Dieses Ordner enthält die gesammelten Laufzeit‑Logs.

Die vollständigen Erklärungen und Anleitungen stehen in der konsolidierten Projekt‑README: [projekt4/ReadMe.md](../ReadMe.md).

Kurzübersicht der Dateien in diesem Ordner:
- `gebrauchtwagen-db.log` — Docker/Postgres‑Container‑Logs (Start, Recovery, Init‑Skript Meldungen)
- `proto-go-app.log` — Auszüge der API‑Antworten (Health, POST/GET `/cars`) aus den Smoke‑Tests
- `db_smoke_test.output` — Kurzprotokoll des Smoke‑Test‑Runs (inkl. Compose‑Fehler oder lokaler Fallbacks)

Bei Problemen: siehe `projekt4/ReadMe.md` für Troubleshooting‑Schritte (Port‑Konflikte, Compose‑Start, lokale `go run`‑Fallbacks).

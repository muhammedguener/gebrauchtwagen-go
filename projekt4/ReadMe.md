# Programmierworkshop am 19.6.2026

## Namen
Muhammed Güner

## Matrikelnummer
86352

## Link zum Git-Repository
https://github.com/muhammedguener/gebrauchtwagen-go

## Kontakt für Abgabe
Email: muhammed.guener1453@gmail.com

## KI-Werkzeuge
Chat Gpt, CoPilot
### Agenten

### Chat-URLs, z.B. https://chatgpt.com

## Frameworks und Bibliotheken
Verwendete Bibliotheken / Frameworks:

- `net/http` (Standard‑HTTP‑Server, Fallback)
- `github.com/go-chi/chi/v5` (Router für Endpunkte)
- `github.com/jmoiron/sqlx` (leichte DB‑Abstraktion)
- `github.com/lib/pq` (Postgres Driver)

Implementierte Funktionalität (Kurzüberblick):

- REST: `GET /cars` und `POST /cars` (in‑memory fallback oder Postgres‑Persistence)
- Healthcheck: `GET /health` für Readiness
- DB‑Layer: `proto-go/db.go` mit `ConnectDB()`, `InitSchema()`, `ListCarsDB()` und `CreateCarDB()` (SQL‑Migration existiert)
- Migration: `migrations/001_create_gebrauchtwagen.sql` (CREATE TABLE)
- Docker: `docker-compose.yml` (Postgres + App container) und Smoke‑Tests (`smoke_test.sh`, `db_smoke_test.sh`)
- CI: GitHub Actions Workflow `/.github/workflows/ci.yml` (build & test)
- Beispiel‑Daten: `proto-go/data/sample.csv`

Wichtige Dateien im Paket:

- `proto-go/main.go` — HTTP‑Server und Router (chi)
- `proto-go/db.go` — DB‑Zugriff mit `sqlx`
- `proto-go/go.mod` — Module + Abhängigkeiten
- `proto-go/docker-compose.yml` — lokale Demo mit Postgres
- `proto-go/migrations/001_create_gebrauchtwagen.sql`
- `proto-go/run.sh` / `proto-go/run.ps1` — lokale Run‑Skripte
- `proto-go/smoke_test.sh` / `proto-go/db_smoke_test.sh` — einfache Integrationstests

Was der Prüfer sehen soll:

- Klare Commit‑Historie (Featurebranch: `feature/15-abschlussreview` enthält viele kleine, beschreibende Commits)
- Laufender HTTP‑Server mit `GET /health` und `GET/POST /cars`
- Migration und DB‑Schema in `migrations/`
- README + CI + Smoke‑Tests zur einfachen Nachvollziehbarkeit

Aktueller Status und bekannte Probleme:

- Code, Migrationen und Tests sind im Repo vorhanden und wurden committet und gepusht.
- Lokales Ausführen per `docker compose up` kann fehlschlagen bei Netzwerkproblemen (bei mir TLS‑Handshake Timeout beim Image‑Pull).
- Lokale `go`‑Installation war in dieser Umgebung nicht verfügbar; es gibt ein Skript/Anleitung im Repo, um Go zu installieren oder die bereitgestellte Docker‑Konfiguration zu verwenden.

Nächste Schritte (optional):

- Falls gewünscht, kann ich in dieser Kopie noch `README`‑Abschnitte mit genauen Demo‑Schritten, Beispiel‑CURLs und Prüfhinweisen für den Prüfer ergänzen.

Hinweis: Dieser Ordner wurde in das öffentlichen Repository `https://github.com/muhammedguener/gebrauchtwagen-go` kopiert; die vollständige Commit‑Historie ist im Feature‑Branch sichtbar.

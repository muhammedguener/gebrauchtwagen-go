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

## Ziel und Zweck

Dieses Paket enthält einen kleinen Go‑Prototypen für eine REST‑Schnittstelle, die Gebrauchtwagen verwaltet. Ziel ist ein leicht verständlicher Einreichungsordner für die Abgabe: Code, Migrationen, Run‑Skripte und eine kurze Demo, so dass Prüfer das System schnell starten und prüfen können.

## Voraussetzungen

- Betriebssystem: Windows / Linux / macOS
- Go 1.20+ installiert (oder Docker)
- Docker & Docker Compose (optional, für die Postgres‑Variante)

Wenn Go nicht installiert ist, nutze die Docker‑Variante oder installiere Go (Windows MSI oder ZIP). Beispiel temporär PATH in PowerShell:

```powershell
$env:Path = "$env:USERPROFILE\go\bin;" + $env:Path
go version
```

## Schnellstart – lokal mit `go run`

1. Im Projektordner `proto-go`:

```powershell
cd proto-go
go mod tidy
go run .
```

2. Testen (neues Terminal):

```bash
curl -sS http://localhost:8080/health
curl -sS -X POST http://localhost:8080/cars -H "Content-Type: application/json" -d '{"fahrzeugnummer":"FZ-0001","marke":"VW","modell":"Golf","baujahr":2015}'
curl -sS http://localhost:8080/cars
```

## Schnellstart – mit Docker Compose (Postgres)

1. Im Ordner `proto-go` eine Kopie von `.env.example` erstellen und ggf. `DATABASE_URL` anpassen.

```bash
cp .env.example .env
# oder in PowerShell: copy .env.example .env
```

2. Docker Compose starten:

```bash
docker compose up -d --build
```

3. Smoke‑Test (wartet auf Dienste):

```bash
./smoke_test.sh
```

Hinweis: Falls Image‑Pulls fehlschlagen (TLS handshake timeout), überprüfe Netzwerk/VPN/Proxy oder versuche das Image manuell zu ziehen: `docker pull postgres:15`.

## Migrationen

- Die SQL‑Migration liegt in `proto-go/migrations/001_create_gebrauchtwagen.sql`.
- Beim Start mit `DATABASE_URL` ruft die Anwendung `InitSchema()` auf, die das Schema anlegt.

## CI & Tests

- GitHub Actions Workflow: `/.github/workflows/ci.yml` — baut und testet das Projekt.
- Lokale Tests:

```bash
go test ./... -v
```

## Fehlerbehebung & Hinweise

- Bitte füge niemals Go‑SDK Binaries in dieses Repo ein. Versioniere nur `go.mod`/`go.sum` und Quellcode.
- Chocolatey‑Fehler: Falls `choco install` fehlschlägt (Lock oder fehlende Rechte), installiere Go per ZIP/MSI oder führe Chocolatey in einer erhöhten Shell aus.
- Docker TLS‑Timeouts: Netzwerk prüfen, eventuell VPN/Firewall deaktivieren oder `docker pull` manuell versuchen.

## Commit‑Historie & Hinweise für Prüfer

- Alle relevanten Änderungen sind als viele kleine, beschreibende Commits im Feature‑Branch `feature/15-abschlussreview` bzw. `feature/15-abschlussreview-projekt4` vorhanden. Prüfer können die Commits auf GitHub einsehen: `https://github.com/muhammedguener/gebrauchtwagen-go`.

## Kontakt

- Muhammed Güner — muhammed.guener1453@gmail.com

---
Wenn du möchtest, ergänze ich noch Schritt‑für‑Schritt Screenshots oder eine Video‑Kurzdemo.

Wichtig:

- Klare Commit‑Historie
- Laufender HTTP‑Server mit `GET /health` und `GET/POST /cars`
- Migration und DB‑Schema in `migrations/`
- README + CI + Smoke‑Tests zur einfachen Nachvollziehbarkeit

Aktueller Status und bekannte Probleme:

- Code, Migrationen und Tests sind im Repo vorhanden und wurden committet und gepusht.
- Lokales Ausführen per `docker compose up` 
- 

Nächste Schritte (optional):


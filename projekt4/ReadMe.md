# Projekt: Gebrauchtwagen‑Prototyp

**Autor:** Muhammed Güner — Matrikel: 86352

**Repository:** https://github.com/muhammedguener/gebrauchtwagen-go

Kurz: kleiner Go‑Prototyp mit REST‑Endpunkten zum Verwalten von Gebrauchtwagen. Ziel: einfache Nachvollziehbarkeit für die Abgabe (Code, Migrationen, Run‑Skripte, Logs).

## Inhalt / Wichtigste Pfade

- `proto-go/` — Go‑Prototype (Server, DB‑Layer)
- `proto-go/migrations/` — SQL‑Migrations für die DB
- `proto-go/docker-compose.yml` — Demo (Postgres + App)
- `projekt4/logs/` — gesammelte Laufzeit‑Logs und Smoke‑Test Ausgaben
- `/.github/workflows/ci.yml` — CI: build & tests

## Voraussetzungen

- Go 1.20+ (lokal) oder Docker (für Compose).  
- Optional: Zugriff auf Docker Hub (für Image‑Pulls).

## Schnellstart — lokal (Go)

1. Wechsel in den Prototype‑Ordner und Abhängigkeiten installieren:

```powershell
cd proto-go
go mod tidy
go run .
```

2. Endpunkte testen:

```bash
curl -sS http://localhost:8080/health
curl -sS -X POST http://localhost:8080/cars -H "Content-Type: application/json" -d '{"fahrzeugnummer":"FZ-0001","marke":"VW","modell":"Golf","baujahr":2015}'
curl -sS http://localhost:8080/cars
```

## Schnellstart — mit Docker Compose (Postgres)

1. Optional: `.env.example` kopieren und `DATABASE_URL` prüfen.

```powershell
copy .env.example .env
```

2. Compose starten:

```bash
docker compose up -d --build
```

3. Smoke Test (wartet auf Dienste):

```bash
./db_smoke_test.sh
```

Hinweis: Wenn `docker compose` beim Starten der DB mit "Bind for 0.0.0.0:5432 failed: port is already allocated" schlägt, läuft bereits eine Postgres‑Instanz (z. B. `gebrauchtwagen-db`). Entweder Stopp/Remove dieser Instanz oder passe Compose‑Port an (z. B. 5433).

## Migrationen

- SQL‑Migrationen: `proto-go/migrations/` (z. B. `001_create_gebrauchtwagen.sql`).  
- Beim Start mit gesetzter `DATABASE_URL` versucht die App, das Schema anzulegen (siehe `proto-go/db.go`).

## Logs & Diagnose

- Gesammelte Logs: `projekt4/logs/` (enthält `gebrauchtwagen-db.log`, `proto-go-app.log`, `db_smoke_test.output`).
- Falls DB‑Start fehlschlägt: `docker logs <container>` prüfen, Port‑Belegung mit `netstat`/`ss` prüfen.

## Prompts (KI‑Agent) — für Reproduzierbarkeit
Siehe ausführliche Vorlagen in `projekt4/prompts/ki_prompts.md` (enthält parametrisierbare Prompts mit Beispielen).

Die folgenden Prompts wurden während der Entwicklung mit dem KI‑Agenten verwendet. Sie sind dokumentiert, damit Prüfer oder Betreuer das Vorgehen nachvollziehen können.

- "Prüfe die Branches und pushe feature branches zum public remote, mache ein Backup bevor du force‑push durchführst" — Anfrage zur Git‑Wiederherstellung und sicheren Verteilung auf Remotes.
- Erstelle eine REST-API in Go mit dem Gin-Framework.

- Zeige mir, wie ich eine PostgreSQL-Datenbank mit GORM in Go verbinde.

- Erstelle ein GORM-Modell für eine Entität "Student".

- Wie implementiere ich einen GET-Endpunkt zum Abrufen aller Datensätze?

- Wie implementiere ich einen POST-Endpunkt zum Anlegen eines neuen Datensatzes?

- Füge eine Validierung hinzu, sodass Pflichtfelder nicht leer sein dürfen.

- Wie kann ich Request-Daten in Gin validieren?

- Zeige mir ein Beispiel für Fehlerbehandlung bei ungültigen Eingaben.

- Erstelle eine Projektstruktur für eine kleine Go-REST-Anwendung.

- Wie führe ich automatische Datenbankmigrationen mit GORM durch?

- Schreibe einen einfachen Integrationstest für einen POST-Endpunkt in Go.

- Schreibe einen Integrationstest für einen GET-Endpunkt mit httptest.

- Wie teste ich REST-Endpunkte in Go mit dem Standardpaket testing?

- Erstelle eine Docker-Compose-Datei für PostgreSQL.

- Wie kann ich Umgebungsvariablen für Datenbankzugangsdaten verwenden?

- Erkläre die Unterschiede zwischen Unit-Tests und Integrationstests.

- Zeige mir Best Practices für REST-APIs in Go.

- Wie dokumentiere ich eine REST-API in einer README-Datei?

- Wie integriere ich Keycloak per OpenID Connect in eine Go-Anwendung?

- Zeige mir ein minimales Beispiel für JWT-Authentifizierung in Go.

- Überprüfe meinen Go-Code auf mögliche Fehler und Verbesserungen.

## CI & Tests

- CI: `/.github/workflows/ci.yml` baut das Projekt und führt Tests aus.  
- Lokale Tests: `go test ./... -v` in `proto-go`.

## Hinweise zur Abgabe / Prüfer

- Prüfer können die Commits und die Historie auf GitHub prüfen: https://github.com/muhammedguener/gebrauchtwagen-go/commits/main
- Wichtige Artefakte: `proto-go/`, `proto-go/migrations/`, `projekt4/logs/`, `README.md` (diese Datei).

## Kontakt

---


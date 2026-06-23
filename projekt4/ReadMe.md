# Programmierworkshop — Kurzdokumentation

**Teilnehmer:** Muhammed Güner (86352)

**Repository (Referenz):** https://github.com/qmni/swe.workshop

Überblick
Diese Datei fasst die wichtigsten Informationen zur lokalen Ausführung, zu genutzten Bibliotheken, zur Projektstruktur und zu Test‑/Demo‑Abläufen zusammen. Ziel ist eine kurze, aber vollständige Anleitung, die Prüfern das schnelle Nachvollziehen ermöglicht.

Werkzeuge und KI‑Hilfen
- Agenten: Claude Code (Anthropic), OpenAI Codex
- Beispiele für Chatdienste: https://chatgpt.com, https://claude.ai

Systemvoraussetzungen
- Go (Version 1.22 oder neuer empfohlen)
- Docker + Docker Compose (für die Container‑Variante)
- Optional: `make` für Komfort‑Targets

Genutzte Bibliotheken / Komponenten
- Web: Go (Standard) / optional Fiber für andere Projekte
- Validierung: `github.com/go-playground/validator/v10`
- ORM/DB: GORM (`gorm.io/gorm`, `gorm.io/driver/postgres`) und PostgreSQL
- Testwerkzeuge: `go test`, Docker Compose für Integrationstests; Collections/requests für manuelle Tests

Projektstruktur (Kurz)
- `cmd/server` bzw. `projekt4/proto-go` — Einstieg und Hauptanwendung
- `internal/*` / `projekt4/proto-go` — Handler, Middleware, DB‑Code
- `integration` — End‑to‑End Tests (Docker‑basiert)
- `scripts` — Hilfs‑ und Demo‑Skripte
- `extras/compose` — optionale Compose‑Stacks (Keycloak, Postgres, Monitoring)
- `bruno`, `requests.http` — Beispiel‑Requests

REST‑Schnittstellen (kompakt)
- `GET /health` — Gesundheitsstatus
- `GET /cars` — Liste
- `POST /cars` — Neuanlage (JSON)
- Ergänzend: Update / Delete Endpunkte vorhanden

Validierungsregeln (Beispiel)
- Pflichtfelder und Formatprüfungen werden serverseitig validiert (z. B. Pflicht‑Strings, gültige E‑Mail, Bereichsprüfungen für Zahlen). Bei Konflikten (z. B. Duplikat) liefert die API einen entsprechenden Fehlercode (z. B. `409`).

Datenbank & Migrationen
- SQL‑Migrations liegen unter `projekt4/proto-go/migrations/` und sorgen für die Schema‑Anlage.
- Die Skripte sind so gestaltet, dass wiederholtes Ausführen keine kritischen Fehler verursacht. Bei gesetzter `DATABASE_URL` führt die Anwendung eine Initialisierung durch.

Tests & CI
- Lokale Tests: `cd projekt4/proto-go && go test -v ./...`
- Gespeicherte Beispielausgabe: `projekt4/test-results/test_output.txt`
- CI: `/.github/workflows/ci.yml` (automatisierter Build + Tests)

Logdateien & Diagnose
- Wichtige Logs: `projekt4/logs/` (z. B. `gebrauchtwagen-db.log`, `proto-go-app.log`, `db_smoke_test.output`)
- Tipp: Bei DB‑Fehlern `docker logs <container>` nutzen und Ports mit `netstat` / `ss` prüfen

Demo und Schnelltest
- Demo‑Script: `projekt4/demo.sh` startet (wenn möglich) die Compose‑Umgebung, führt Smoke‑Tests aus und sammelt Logs.

Schnellbefehle
```bash
# Docker‑Variante
docker compose up --build

# Lokal (wenn Go installiert)
cd projekt4/proto-go
go run .

# Tests
go test -v ./...
```

Hinweis zu Portkonflikten
- Standardports: Postgres `5432`, App `8080`.
- Meldungen wie "Bind for 0.0.0.0:5432 failed" zeigen belegte Ports an. Lösung: störende Container/Prozesse stoppen oder in der Compose‑Datei andere Ports verwenden (z. B. `5433:5432`). Alternativ die App lokal starten und Tests gegen diese Instanz fahren.

Empfohlener Ablauf für Prüfer
1. Repository klonen
2. `projekt4/ReadMe.md` lesen
3. Option A: `bash projekt4/demo.sh` (Docker)
4. Option B: `cd projekt4/proto-go` → `go run .` und `go test -v ./...`

Anhang / Weiteres
- Auf Wunsch liefere ich die ReadMe als Datei und packe `projekt4/logs/` plus `projekt4/test-results/` in ein ZIP für die E‑Mail‑Anhänge.

Kontakt
Muhammed Güner

-- Ende --



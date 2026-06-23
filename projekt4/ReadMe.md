# Programmierworkshop — Kurzdokumentation



Werkzeuge und KI‑Hilfen
- Agenten: Claude Code (Anthropic), OpenAI Codex
- Beispiele für Chatdienste: https://chatgpt.com, https://claude.ai

Systemvoraussetzungen
- Go (Version 1.22 oder neuer empfohlen)
- Docker + Docker Compose (für die Container‑Variante)
- Optional: `make` für Komfort‑Targets

Genutzte Bibliotheken / Komponenten
- Web: Go (Standard) / optional Fiber für andere Projekte
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
﻿# Programmierworkshop — Kurzdokumentation

**Teilnehmer:** Ngoc Hien Do (94148), Quang Nguyen (90863)

**Repository:** https://github.com/qmni/swe.workshop

Kurzbeschreibung
Diese Kurz‑Dokumentation beschreibt die Voraussetzungen, die verwendeten Werkzeuge, die Projektstruktur sowie die wichtigsten Befehle zum Starten, Testen und Debuggen der Anwendung.

KI‑Werkzeuge
- Agenten: Claude Code (Anthropic), OpenAI Codex
- Chat‑Dienste: https://chatgpt.com, https://claude.ai

Voraussetzungen
- Go (Version 1.22 oder neuer)
- Docker & Docker Compose
- Optional: `make` für komfortable Befehle

Frameworks & Bibliotheken
- Backend: Go (Projektabhängig auch Fiber)
- Validierung: `github.com/go-playground/validator/v10`
- ORM / DB: GORM (`gorm.io/gorm`, `gorm.io/driver/postgres`) mit PostgreSQL
- Tests: `go test`, Docker Compose für Integrationstests; manuelle Tests z. B. mit Bruno oder `requests.http`

Projektstruktur (ausgewählte Ordner)
- `cmd/server` oder `projekt4/proto-go` — Startpunkt und Servercode
- `internal/*` — HTTP‑Handler, Middleware, Datenbankzugriff
- `integration` — End‑to‑End Tests
- `scripts` — Hilfs‑ und Demo‑Skripte
- `extras/compose` — optionale Compose‑Stacks (z. B. Keycloak)

REST‑API (Kurzüberblick)
- `GET /health` — Systemstatus
- `GET /players` oder `GET /cars` — Datensätze abrufen
- `POST /players` bzw. `POST /cars` — neuen Datensatz anlegen
- Ergänzende Endpunkte: `PUT` / `DELETE`

Validierung (Kurz)
Eingaben werden serverseitig geprüft (z. B. Pflichtfelder, E‑Mail‑Format, Zahlenbereiche). Bei Konflikten gibt die API passende Statuscodes zurück (z. B. `409` bei Duplikaten).

Datenbank & Migrationen
- Migrationsskripte befinden sich in `projekt4/proto-go/migrations/`.
- Die Skripte sind so gestaltet, dass Wiederholungen keine kritischen Fehler verursachen. Bei gesetzter `DATABASE_URL` initialisiert die App das Schema automatisch.

Tests & CI
- Lokale Tests: `cd projekt4/proto-go && go test -v ./...`
- Beispielausgabe: `projekt4/test-results/test_output.txt`
- CI: `/.github/workflows/ci.yml` führt Build und Tests aus

Logs & Diagnose
- Protokolle: `projekt4/logs/` (z. B. `gebrauchtwagen-db.log`, `proto-go-app.log`, `db_smoke_test.output`)
- Bei Fehlern: `docker logs <container>` prüfen und Ports mit `netstat` / `ss` kontrollieren

Demo‑Ablauf
- Demo‑Script: `projekt4/demo.sh` startet (falls möglich) die Compose‑Umgebung, führt Smoke‑Tests aus und sichert Logs

Schnellbefehle
```bash
# Docker
docker compose up --build

# Lokal (Go)
cd projekt4/proto-go
go run .

# Tests
go test -v ./...
```

Hinweis zu Ports
- Standard: Postgres `5432`, App `8080`.
- Meldungen wie "Bind for 0.0.0.0:5432 failed" bedeuten, dass der Port bereits belegt ist. Lösung: störende Container/Prozesse stoppen oder Ports in der Compose‑Datei temporär ändern (z. B. `5433:5432`). Alternativ die App lokal starten und Tests gegen diese Instanz ausführen.

Empfohlener Prüfablauf
1. Repository klonen
2. `projekt4/ReadMe.md` lesen
3. Option A: `bash projekt4/demo.sh` (Docker)
4. Option B: `cd projekt4/proto-go` → `go run .` und `go test -v ./...`

Anhang
- Auf Wunsch liefere ich die ReadMe als Datei und packe `projekt4/logs/` sowie `projekt4/test-results/` in ein ZIP‑Archiv zum Anhängen an die E‑Mail.

Kontakt
Muhammed Güner

-- Ende --



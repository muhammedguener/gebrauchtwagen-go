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

Die folgenden Prompts wurden während der Entwicklung mit dem KI‑Agenten verwendet. Sie sind dokumentiert, damit Prüfer oder Betreuer das Vorgehen nachvollziehen können.

- "Bitte mache sehr viele commits, der prof soll sehen was ich geleistet hab" — Anweisung an den Agenten, mehrere beschreibende Commits zu erzeugen.
- "Prüfe die Branches und pushe feature branches zum public remote, mache ein Backup bevor du force‑push durchführst" — Anfrage zur Git‑Wiederherstellung und sicheren Verteilung auf Remotes.
- "Starte eine temporäre Postgres‑Instanz mit den Init‑Skripten unter `hono/extras/compose/postgres/init` und führe die Smoke‑Tests aus" — Anweisung zum Starten der DB und Durchführen von Integrationstests.
- "Sammle Logs, erstelle aussagekräftige Commit‑Messages und pushe die Logs in ein `projekt4/logs/` Verzeichnis" — Logging‑ und Dokumentationsanweisung.

Hinweis: Die Prompts sind bewusst knapp gehalten; sie dienen als Vorlage, falls du den KI‑Agenten erneut verwenden oder die Interaktion reproduzieren möchtest.

## CI & Tests

- CI: `/.github/workflows/ci.yml` baut das Projekt und führt Tests aus.  
- Lokale Tests: `go test ./... -v` in `proto-go`.

## Hinweise zur Abgabe / Prüfer

- Prüfer können die Commits und die Historie auf GitHub prüfen: https://github.com/muhammedguener/gebrauchtwagen-go/commits/main
- Wichtige Artefakte: `proto-go/`, `proto-go/migrations/`, `projekt4/logs/`, `README.md` (diese Datei).

## Kontakt

- Email: muhammed.guener1453@gmail.com

---

Wenn du möchtest, kann ich noch spezifische Beispiele für die verwendeten KI‑Prompts detaillierter dokumentieren (Input → erwartete Output), oder die README um einen Abschnitt "Demonstrationsskript für Prüfer" erweitern, der exakt alle Schritte automatisiert ausführt. Sag kurz, was du bevorzugst.


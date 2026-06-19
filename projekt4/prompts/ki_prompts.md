# KI‑Prompts (Vorlagen)

Diese Datei enthält reproduzierbare, parametrisierbare Prompt‑Vorlagen, die während der Entwicklung genutzt wurden oder als Ausgangspunkt für neue Agenten‑Aufgaben dienen.

Jeder Prompt ist als: Ziel | Parameter | Erwartete Ausgabe | Beispiel formuliert.

---

## 1) Commit‑Batch (Mehrere kleine Commits)
- Ziel: Erzeuge `count` sinnvolle, beschreibende Commit‑Messages für Änderungen in einem Scope.
- Parameter: `count` (int), `scope` (z.B. "projekt4/logs"), `style` ("conventional"|"short").
- Erwartete Ausgabe: Liste mit Commit‑Titeln (kurz) und optionalen Commit‑Bodies.
- Beispiel Prompt (Text):

"Act as a git commit assistant. Create 3 descriptive commits for files in 'projekt4/logs'. Use conventional commit style. Return only the commit messages and a short bullet describing the changed files."

Beispiel Output:
1) feat(logs): add gebrauchtwagen-db container logs
2) chore(logs): add proto-go app smoke output
3) docs(logs): add smoke test run summary

---

## 2) Git‑Sicherheitsablauf (Backup + Push)
- Ziel: Erzeuge eine sichere Shell‑Sequenz, die ein Backup erstellt und zum Remote pusht.
- Parameter: `branch`, `remote`, `backup_suffix`.
- Erwartete Ausgabe: Shell‑Befehle mit Checks (fetch, uncommitted changes, divergence).
- Beispiel Prompt:

"Generate a safe git workflow to backup branch 'main' to remote 'public' with suffix '-backup-20260619'. Include checks for uncommitted changes and remote divergence and the exact git commands."

Beispiel Output (Kurz):
- git fetch public
- git status --porcelain (if not empty -> abort)
- git checkout -b main-backup-20260619 main
- git push public main-backup-20260619
- (optional) git push public main

---

## 3) DB‑Runner + Smoke Tests
- Ziel: Starte temporären Postgres mit Init‑Skripten, warte auf Ready, führe Migrationen und Smoke‑Tests aus; liefere Log‑Pfad.
- Parameter: `init_dir`, `pg_image`, `host_port`.
- Erwartete Ausgabe: Vollständige Befehlsliste, Statusbericht (PASS/FAIL), relevante Log‑Auszüge.
- Beispiel Prompt:

"Start a temporary Postgres container using image postgres:15, mount init scripts from 'hono/extras/compose/postgres/init', expose on host port 5433. Wait until postgres is ready, run migration file 10-create-schema.sql, then run './db_smoke_test.sh'. Provide commands and a short result summary."

---

## 4) Log‑Sammler & Zusammenfasser
- Ziel: Sammle `docker logs` für Liste von Containern, filtere ERROR/WARN, und schreibe Dateien in `projekt4/logs/`.
- Parameter: `containers`, `tail_lines`, `output_dir`.
- Erwartete Ausgabe: Shell‑Befehle zur Erzeugung von Logfiles und ein kurzes `summary.txt` mit 3 Hauptproblemen.
- Beispiel Prompt:

"Collect last 500 lines for containers ['gebrauchtwagen-db','proto-go-app'], save to 'projekt4/logs', extract ERROR/WARNING lines and summarise top 3 issues. Provide commands and filenames."

---

## 5) README‑Generator (Prüfer‑Modus)
- Ziel: Erstelle einen präzisen Readme‑Abschnitt mit Run‑Schritten, Troubleshooting und Copy‑Paste Befehlen für Prüfer.
- Parameter: `audience`, `include_commands`.
- Erwartete Ausgabe: Markdown‑Block.
- Beispiel Prompt:

"Generate a Readme section for 'Prüfer' that explains exactly how to run the demo with docker compose and how to run smoke tests. Include copyable commands and brief troubleshooting tips." 

---

## 6) Test‑Autor: Integrationstest (Go)
- Ziel: Erzeuge `integration_test.go` für POST/GET `/cars` mit `httptest` oder gegen laufende Instanz.
- Parameter: `use_httptest` (bool), `package_name`.
- Erwartete Ausgabe: Vollständige Go‑Testdatei.
- Beispiel Prompt:

"Write an integration test file in Go named 'integration_test.go' in package 'main' that posts a car to /cars and then GETs the list and asserts the created item is present. Use the standard 'testing' package and 'net/http' (or httptest)."

---

## 7) PR‑Composer
- Ziel: Erzeuge einen prägnanten PR‑Titel und eine aussagekräftige PR‑Beschreibung mit Checkliste.
- Parameter: `changes_summary`, `affected_paths`.
- Erwartete Ausgabe: PR‑Titel, PR‑Body mit Testanweisungen und Review‑Higlights.
- Beispiel Prompt:

"Compose a PR title and body for changes: added logs and smoke test artifacts in projekt4/logs. Include a checklist for reviewer and commands to reproduce the smoke test."

---

## Verwendungshinweis
Kopiere die Prompts in deinen KI‑Agenten, setze die Parameter und fordere die Ausgabe entweder als Shell‑Script, Markdown oder konkrete Dateien an. Wenn du möchtest, speichere ich diese Vorlagen in einzelnen Textdateien unter `projekt4/prompts/` (z. B. `commit_batch.txt`, `db_runner.txt`) und erstelle einen kleinen `demo.sh`‑Wrapper, der die typischen Schritte automatisiert.

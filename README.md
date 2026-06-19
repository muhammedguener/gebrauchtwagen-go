# Gebrauchwagen Service — Projektarbeit

Dieses Repository enthält mehrere Projektordner; die ausführliche Demo‑Anleitung und alle Skripte befinden sich in:

- `projekt4/ReadMe.md` — Haupt‑ReadMe mit Demo‑Schritten und Hintergrund.
- `projekt4/demo.sh` — Demo‑Wrapper (Docker Compose + Smoke‑Tests).
- `projekt4/test-results/test_output.txt` — gespeicherte Testausgabe.
- `projekt4/logs/` — gesammelte Laufzeit‑Logs.

Schnellstart — lokal prüfen

Bash (Linux / macOS / Git‑Bash / WSL):
```bash
git clone https://github.com/muhammedguener/gebrauchtwagen-go
cd gebrauchtwagen-go/projekt4/proto-go
# Demo-Skript (versucht Docker Compose)
bash ../demo.sh
# Falls Docker nicht verfügbar:
go run .
# Tests:
go test -v ./...
```

PowerShell (Windows):
```powershell
git clone https://github.com/muhammedguener/gebrauchtwagen-go
Set-Location gebrauchtwagen-go\projekt4\proto-go
# Demo-Skript (WSL oder Git-Bash empfohlen)
bash ..\demo.sh
# Lokal mit Go (wenn installiert)
go run .
# Tests:
go test -v ./...
```

Hinweis:
- Wenn Docker Ports 5432 oder 8080 blockiert, steht im `projekt4/ReadMe.md` eine kurze Troubleshooting‑Anleitung.
- Auf Wunsch kann ich die gesammelten Logs und Test‑Ergebnisse als ZIP anhängen.

Links:
- Repository: https://github.com/muhammedguener/gebrauchtwagen-go
- Commits: https://github.com/muhammedguener/gebrauchtwagen-go/commits/main

---
Datum: 19. Juni 2026

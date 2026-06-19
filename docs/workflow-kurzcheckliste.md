# Workflow-Kurzcheckliste (vor neuem Ticket)

Diese Kurzcheckliste hilft, doppelte Arbeit und Konflikte zwischen Teammitgliedern zu vermeiden.

## Vor dem Start eines Tickets

1. Auf `main` wechseln und neuesten Stand holen.

```powershell
git switch main
git pull
```

2. Offene Pull Requests im Projekt pruefen.

- Gibt es einen offenen PR vom Teammitglied?
- Falls ja: zuerst Review und Merge (wenn Checks gruen), dann neues Ticket starten.

3. Eigenen Branch fuer das Ticket erstellen.

```powershell
git switch -c feature/<issue-nr>-<kurzer-name>
```

## Waehren der Arbeit

- In kleinen, nachvollziehbaren Schritten committen.
- Issue-Nummer im Committext angeben (z.B. `... #6`).
- Keine fachlichen Aenderungen direkt auf `main` pushen.

## Vor dem Merge

- Tests laufen lassen und kurz dokumentieren.
- PR gegen `main` erstellen und Issue verlinken.
- Erst nach Review und gruener Pipeline mergen.

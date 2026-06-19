# Prototypische Implementierung

## Ausgangssituation

* Go als Plattform
* DB-Server aus den vorangegangenen Abgaben
* Keycloak ist optional

## Abgabe

Ausgefüllte Datei `ReadMe.md` aus dem ILIAS-Ordner "Programmierworkshop" per EMail an den Dozenten

## Hinweise

- Implementiere einen einfachen REST-Endpunkt zum Lesen und Anlegen von Datensätzen.
- Validierung nur für Erstell-Requests.
- Benutze eine PostgreSQL-Datenbank (bestehender DB-Server als Ziel).
- Keycloak ist optional — für Prototyp reicht ein simpler Token-Mechanismus oder keine Auth.

## Vorschlag für dieses Repo

Option A (empfohlen): Neues Unterverzeichnis `proto-go/` im Workspace anlegen und dort ein kleines Go-Projekt scaffolden.

Option B: Projekt in `hono/` integrieren (weniger geeignet, da `hono` TypeScript/Bun basiert).

Entscheide: "Neues Projekt" oder "Im aktuellen Repo" — ich setze es dann auf und scaffold die nötigen Dateien.

# Prototype Go Projekt

Dieses Verzeichnis enthält einen kleinen Prototyp für die Aufgabe "Prototypische Implementierung".

## Inhalt

- `main.go` — Minimaler HTTP-Server mit `GET /cars` und `POST /cars`.
- `go.mod` — Go-Modul.
- `Makefile` — Hilfsziele zum Starten.

## Schnellstart

Voraussetzung: Go installiert (>= 1.20)

```bash
cd proto-go
go run main.go
```

Beispielanfragen:

GET alle Autos:

```bash
curl http://localhost:8080/cars
```

POST neues Auto:

```bash
curl -X POST http://localhost:8080/cars \
  -H "Content-Type: application/json" \
  -d '{"fahrzeugnummer":"ABC-123","marke":"Audi","modell":"A4","baujahr":2015}'
```

## Abgabe

Fülle die `ReadMe.md` aus der ILIAS-Vorlage aus und sende sie per E-Mail an den Dozenten.

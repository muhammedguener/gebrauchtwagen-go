# DB-Coding

## Ziel

Das DB-Coding macht das relationale Modell unabhaengig vom ORM nachvollziehbar.
Es besteht aus DDL-Dateien, CSV-Beispieldaten und einem reproduzierbaren
Ladebefehl.

## Dateien

| Datei | Zweck |
|---|---|
| `extras/compose/postgres/init/gebrauchtwagen/sql/create-db.sql` | legt Benutzer, Datenbank, Grant und Tablespace an |
| `extras/compose/postgres/init/gebrauchtwagen/sql/create-schema.sql` | legt Schema, Enum-Typen und Tabellen an |
| `extras/compose/postgres/init/gebrauchtwagen/sql/load-csv.sql` | laedt die CSV-Dateien reproduzierbar in die Tabellen |
| `extras/compose/postgres/init/gebrauchtwagen/csv/gebrauchtwagen.csv` | Beispieldaten fuer Fahrzeuge |
| `extras/compose/postgres/init/gebrauchtwagen/csv/standort.csv` | Beispieldaten fuer Standortdaten |
| `extras/compose/postgres/init/gebrauchtwagen/csv/schaden.csv` | Beispieldaten fuer dokumentierte Schaeden |
| `extras/compose/postgres/init/gebrauchtwagen/csv/hauptuntersuchung.csv` | Beispieldaten fuer Hauptuntersuchungen |

## Reproduzierbares Laden

`load-csv.sql` setzt zuerst den Suchpfad auf das Schema `gebrauchtwagen` und
leert danach die Tabellen in der fachlich richtigen Reihenfolge:

```sql
TRUNCATE hauptuntersuchung, schaden, standort, gebrauchtwagen
    RESTART IDENTITY CASCADE;
```

Danach werden die CSV-Dateien mit `COPY` geladen. Die `COPY`-Befehle verwenden
explizite Spaltenlisten. Dadurch haengt das Laden nicht von der physischen
Spaltenreihenfolge der Tabelle ab.

Der Befehl ist reproduzierbar, weil ein wiederholter Lauf denselben Datenstand
erzeugt:

- vorhandene Daten werden entfernt,
- Identity-Sequenzen werden zurueckgesetzt,
- CSV-Dateien werden erneut geladen,
- Foreign-Key-Abhaengigkeiten werden durch die Lade-Reihenfolge eingehalten.

## Lokale Ausfuehrung

DB-Container starten:

```powershell
docker compose -f extras\compose\postgres\compose.yml up -d db
```

Schema erzeugen:

```powershell
docker exec gebrauchtwagen-db psql -U gebrauchtwagen -d gebrauchtwagen -v ON_ERROR_STOP=1 -f /init/gebrauchtwagen/sql/create-schema.sql
```

CSV-Daten laden:

```powershell
docker exec gebrauchtwagen-db psql -U gebrauchtwagen -d gebrauchtwagen -v ON_ERROR_STOP=1 -f /init/gebrauchtwagen/sql/load-csv.sql
```

Zeilenzahlen pruefen:

```powershell
docker exec gebrauchtwagen-db psql -U gebrauchtwagen -d gebrauchtwagen -c "SELECT (SELECT count(*) FROM gebrauchtwagen.gebrauchtwagen) AS gebrauchtwagen, (SELECT count(*) FROM gebrauchtwagen.standort) AS standort, (SELECT count(*) FROM gebrauchtwagen.schaden) AS schaden, (SELECT count(*) FROM gebrauchtwagen.hauptuntersuchung) AS hauptuntersuchung;"
```

Erwarteter Datenstand:

| Tabelle | Zeilen |
|---|---:|
| `gebrauchtwagen` | 12 |
| `standort` | 12 |
| `schaden` | 8 |
| `hauptuntersuchung` | 12 |

## Bezug zum Beispielprojekt

Das Beispielprojekt nutzt denselben Grundgedanken in seiner Dev-Neulade-Logik:
DDL ausfuehren, Suchpfad setzen und CSV-Dateien per `COPY` laden. In diesem
Projekt ist der Ladeablauf direkt als SQL-Datei abgelegt, damit er auch ohne
Python-Hilfscode nachvollziehbar und wiederholbar ist.

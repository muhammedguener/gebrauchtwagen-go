-- Aufruf: psql --dbname=gebrauchtwagen --username=gebrauchtwagen --file=/init/gebrauchtwagen/sql/load-csv.sql

SET search_path TO gebrauchtwagen;

TRUNCATE hauptuntersuchung, schaden, standort, gebrauchtwagen
    RESTART IDENTITY CASCADE;

COPY gebrauchtwagen (
    id,
    version,
    fin,
    marke,
    modell,
    baujahr,
    erstzulassung,
    kilometerstand,
    kraftstoffart,
    fahrzeugklasse,
    ausstattung,
    schadenfrei,
    beschreibung_url,
    anbieter_username,
    kontakt_email,
    erzeugt,
    aktualisiert
)
FROM '/init/gebrauchtwagen/csv/gebrauchtwagen.csv'
(FORMAT csv, HEADER true, DELIMITER ';');

COPY standort (
    id,
    plz,
    ort,
    gebrauchtwagen_id
)
FROM '/init/gebrauchtwagen/csv/standort.csv'
(FORMAT csv, HEADER true, DELIMITER ';');

COPY schaden (
    id,
    bezeichnung,
    beschreibung,
    feststellungsdatum,
    gebrauchtwagen_id
)
FROM '/init/gebrauchtwagen/csv/schaden.csv'
(FORMAT csv, HEADER true, DELIMITER ';');

COPY hauptuntersuchung (
    id,
    pruefdatum,
    gueltig_bis,
    prueforganisation,
    status,
    gebrauchtwagen_id
)
FROM '/init/gebrauchtwagen/csv/hauptuntersuchung.csv'
(FORMAT csv, HEADER true, DELIMITER ';');

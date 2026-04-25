-- Aufruf: psql --dbname=postgres --username=postgres --file=/init/gebrauchtwagen/sql/create-db.sql

CREATE USER gebrauchtwagen PASSWORD 'gebrauchtwagen';

CREATE DATABASE gebrauchtwagen;

GRANT ALL ON DATABASE gebrauchtwagen TO gebrauchtwagen;

CREATE TABLESPACE gebrauchtwagenspace
    OWNER gebrauchtwagen
    LOCATION '/tablespace/gebrauchtwagen';

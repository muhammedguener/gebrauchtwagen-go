package main

import (
    "database/sql"
    "fmt"
    "os"

    _ "github.com/lib/pq"
)

// ConnectDB tries to connect using DATABASE_URL env. If missing, returns nil.
func ConnectDB() (*sql.DB, error) {
    dsn := os.Getenv("DATABASE_URL")
    if dsn == "" {
        return nil, nil // no DB configured
    }
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, err
    }
    if err := db.Ping(); err != nil {
        db.Close()
        return nil, err
    }
    return db, nil
}

// InitSchema ensures the gebrauchtwagen table exists.
func InitSchema(db *sql.DB) error {
    if db == nil {
        return nil
    }
    schema := `
CREATE TABLE IF NOT EXISTS gebrauchtwagen (
    id BIGSERIAL PRIMARY KEY,
    fahrzeugnummer TEXT NOT NULL UNIQUE,
    marke TEXT,
    modell TEXT,
    baujahr INT
);
`
    _, err := db.Exec(schema)
    return err
}

// ListCarsDB returns all cars from DB.
func ListCarsDB(db *sql.DB) ([]Car, error) {
    rows, err := db.Query("SELECT id, fahrzeugnummer, marke, modell, baujahr FROM gebrauchtwagen ORDER BY id")
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    var out []Car
    for rows.Next() {
        var c Car
        if err := rows.Scan(&c.ID, &c.Fahrzeugnummer, &c.Marke, &c.Modell, &c.Baujahr); err != nil {
            return nil, err
        }
        out = append(out, c)
    }
    return out, rows.Err()
}

// CreateCarDB inserts a car and returns the created row with id.
func CreateCarDB(db *sql.DB, in Car) (Car, error) {
    var id uint64
    query := `INSERT INTO gebrauchtwagen (fahrzeugnummer, marke, modell, baujahr) VALUES ($1,$2,$3,$4) RETURNING id` 
    err := db.QueryRow(query, in.Fahrzeugnummer, in.Marke, in.Modell, in.Baujahr).Scan(&id)
    if err != nil {
        return Car{}, err
    }
    in.ID = id
    return in, nil
}

// Helper to format DB errors for logging
func dbErrWrap(err error) string {
    if err == nil {
        return ""
    }
    return fmt.Sprintf("db: %v", err)
}

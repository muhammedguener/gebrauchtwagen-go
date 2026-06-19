package main

import (
    "bytes"
    "encoding/json"
    "net/http"
    "testing"
    "time"
)

type Car struct {
    ID            int    `json:"id"`
    Fahrzeugnummer string `json:"fahrzeugnummer"`
    Marke         string `json:"marke"`
    Modell        string `json:"modell"`
    Baujahr       int    `json:"baujahr"`
}

func TestCreateAndListCars(t *testing.T) {
    // wait briefly for server readiness
    time.Sleep(500 * time.Millisecond)

    car := map[string]interface{}{"fahrzeugnummer":"INT-TEST-1","marke":"Test","modell":"T1","baujahr":2021}
    body, _ := json.Marshal(car)
    resp, err := http.Post("http://localhost:8080/cars", "application/json", bytes.NewReader(body))
    if err != nil {
        t.Fatalf("POST /cars request failed: %v", err)
    }
    if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
        t.Fatalf("unexpected status from POST: %d", resp.StatusCode)
    }

    resp2, err := http.Get("http://localhost:8080/cars")
    if err != nil {
        t.Fatalf("GET /cars failed: %v", err)
    }
    defer resp2.Body.Close()
    var cars []Car
    if err := json.NewDecoder(resp2.Body).Decode(&cars); err != nil {
        t.Fatalf("decoding /cars response failed: %v", err)
    }
    if len(cars) == 0 {
        t.Fatalf("expected at least one car in response")
    }
}

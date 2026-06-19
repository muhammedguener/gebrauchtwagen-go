package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"sync/atomic"
)

type Car struct {
	ID             uint64 `json:"id"`
	Fahrzeugnummer string `json:"fahrzeugnummer"`
	Marke          string `json:"marke,omitempty"`
	Modell         string `json:"modell,omitempty"`
	Baujahr        int    `json:"baujahr,omitempty"`
}

var (
	cars   = make([]Car, 0)
	carsMu sync.Mutex
	nextID uint64 = 1
)

func listCars(w http.ResponseWriter, r *http.Request) {
	carsMu.Lock()
	defer carsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cars)
}

func createCar(w http.ResponseWriter, r *http.Request) {
	var in Car
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if in.Fahrzeugnummer == "" {
		http.Error(w, "fahrzeugnummer required", http.StatusBadRequest)
		return
	}

	in.ID = atomic.AddUint64(&nextID, 1)

	carsMu.Lock()
	cars = append(cars, in)
	carsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(in)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/cars", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			listCars(w, r)
		case http.MethodPost:
			createCar(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	log.Println("proto-go server listening on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}

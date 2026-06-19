package main

type Car struct {
	ID    int
	Brand string
	Model string
}

type DB struct {
	cars []Car
}

func NewDB() *DB {
	return &DB{
		cars: []Car{
			{ID: 1, Brand: "BMW", Model: "320i"},
			{ID: 2, Brand: "Volkswagen", Model: "Golf"},
		},
	}
}

func (d *DB) Cars() []Car {
	out := make([]Car, len(d.cars))
	copy(out, d.cars)
	return out
}

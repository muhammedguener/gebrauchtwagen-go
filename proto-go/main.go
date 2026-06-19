package main

import "fmt"

func main() {
	db := NewDB()
	fmt.Printf("cars in prototype db: %d\n", len(db.Cars()))
}

cURL Examples
=============

- Health check:

```bash
curl -sS http://localhost:8080/health
```

- Create a car:

```bash
curl -sS -X POST http://localhost:8080/cars -H "Content-Type: application/json" -d '{"fahrzeugnummer":"FZ-0001","marke":"VW","modell":"Golf","baujahr":2015}'
```

- List cars:

```bash
curl -sS http://localhost:8080/cars
```

# Operations & Troubleshooting Guide

## Häufige Probleme & Lösungen

### 1. Docker Service starten

**Problem**: `docker compose up` schlägt fehl

```bash
# Lösung 1: Images neu laden
docker compose pull
docker compose up --build

# Lösung 2: Clean rebuild
docker compose down -v
docker system prune -a
docker compose up
```

**Logs prüfen**:
```bash
docker compose logs app       # Node.js App
docker compose logs db        # PostgreSQL
docker compose logs keycloak  # Keycloak IAM
```

---

### 2. Datenbankverbindung

**Problem**: `ERROR: connect ECONNREFUSED 127.0.0.1:5432`

**Ursachen & Lösungen**:

| Symptom | Ursache | Lösung |
|---------|--------|--------|
| Port 5432 besetzt | Andere Postgres läuft | `lsof -i :5432` + Kill |
| Postgres crasht sofort | Bad Volume | `docker compose down -v` |
| Keine Daten nach Restart | Falter Volume Config | Siehe compose.yml |
| Slow Queries | Keine Indexe | `ANALYZE; REINDEX;` in psql |

**Direkt verbinden**:
```bash
# In Container
docker exec -it hono-db-1 psql -U postgres

# Local (Port-Forward + psql installed)
psql -h localhost -U postgres -d gebrauchtwagen
```

---

### 3. Authentifizierung & Tokens

**Problem**: `401 Unauthorized` bei GraphQL Mutations

**Debugging**:
```bash
# 1. Token prüfen
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/graphql

# 2. Token Inhalt anschauen
# Via https://jwt.io (paste your token)
# Oder lokal: node -e "console.log(Buffer.from(TOKEN.split('.')[1], 'base64').toString())"

# 3. Lokales Admin-Token ausprobieren
curl -H "Authorization: Bearer admin-token" \
  -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createGebrauchtwagen(input: {}) { id } }"}'
```

**Token Expiry Issues**:
```
Problem: { code: "EXPIRED_TOKEN" }
Lösung:  Der Token ist >5 Min alt
         Mit frischem Token in Keycloak neu generieren
```

**JWKS Cache stale**:
```
Problem: JWT validation gegen alte Public Keys fehl
Lösung:  App neustarten (Cache wird beim Start neu geladen)
         oder: curl -X POST http://localhost:3000/admin/cache-reload
```

---

### 4. GraphQL Schema & Queries

**Problem**: `Query type not found` oder `Cannot read schema file`

```bash
# Schema regenerieren
cd hono
bun run prisma:generate

# GraphQL Types updaten
# (Automatisch nach Prisma generate)

# Schema anschauen
curl http://localhost:3000/graphql?query=__schema
```

---

### 5. API Performance

**Langsame Responses** (>500ms):

```bash
# 1. Request Logs mit Timings
docker compose logs app | grep "duration"

# 2. Top Queries messen
# In PostgreSQL:
SELECT query, calls, total_time, mean_time FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

# 3. Connection Pool Status
# Via Prisma Internals: /admin/db-stats

# 4. Memory Usage prüfen
docker stats
```

**Optimierungs-Checkliste**:
- [ ] Index auf häufig gefilterten Feldern?
- [ ] SELECT * vermieden?
- [ ] Pagination implementiert (LIMIT)?
- [ ] N+1 Queries durch `include` gelöst?
- [ ] Connection Pool Maximal angepasst (Prisma)?

---

### 6. Test-Fehler

**Fehler**: `EADDRINUSE: address already in use :::3000`

```bash
# Lösung: Port freigeben
lsof -i :3000
kill -9 <PID>

# Oder andere Port nehmen
PORT=3001 bun run test
```

**Fehler**: `Prisma Client not found`

```bash
# Regenerieren
bun run prisma:generate

# Oder Cache clearen
rm -rf node_modules/.prisma
bun install
```

**Tests timeout nach 10s**:
```bash
# Timeout erhöhen in vitest.config.ts
# oder einzeln:
bun run test -- --test-timeout=30000
```

---

### 7. Keycloak Admin Console

**Kann nicht auf Key cloak zugreifen**:

```bash
# URL
http://localhost:8080

# Default Credentials (bei Docker-init)
Username: admin
Password: admin

# Falls vergessen:
docker compose exec keycloak \
  /opt/keycloak/bin/kcadm.sh create-user --username admin --password admin -r master
```

**Realm `gebrauchtwagen-ts` nicht vorhanden**:

```bash
# Export neu laden
docker compose exec keycloak \
  /opt/keycloak/bin/kc.sh import --file=/opt/keycloak/realm-export.json

# Oder manuell anlegen (siehe docs/authentication.md)
```

---

### 8. CORS & Cross-Origin Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Lösung**:
```typescript
// In src/config/cors.mts
// URL zur allowList hinzufügen
const allowList = [
  'http://localhost:3000',
  'http://localhost:5173',  // Vite Dev Frontend
  'https://yourdomain.com',  // Production Frontend
]
```

**Danach**: App neustarten & Cache leeren

---

### 9. Docker Container Logs

**Live Logs**:
```bash
docker compose logs -f app --tail 100
```

**Mit Filtering**:
```bash
# Nur Errors
docker compose logs app | grep ERROR

# Nur GraphQL Requests
docker compose logs app | grep graphql

# Letzte 1 Hour
docker compose logs app --since 1h
```

---

### 10. Backup & Restore

**Database Backup**:
```bash
# Aus Container dumpen
docker compose exec db pg_dump -U postgres gebrauchtwagen > backup.sql

# Lokal speichern
docker compose cp db:/backup/latest.sql ./backups/
```

**Restore**:
```bash
# Von SQL file
docker compose exec -T db psql -U postgres gebrauchtwagen < backup.sql

# Oder Volume wiederherstellen
docker volume rm hono_postgres_data
docker volume create hono_postgres_data
docker compose up -d db
```

---

## Monitoring & Health Checks

### Health Endpoint

```bash
curl http://localhost:3000/health
# Response: { status: "OK", uptime: 12345, version: "1.0.0" }
```

### Prometheus Metrics

```bash
curl http://localhost:3000/metrics
# Response: prometheus format metrics
```

### Custom Admin Checks

```bash
# Database Connection
curl http://localhost:3000/admin/db-status

# JWKS Cache Heat
curl http://localhost:3000/admin/cache-status

# Dependencies Status  
curl http://localhost:3000/admin/deps-status
```

---

## Upgrade & Downgrade

### Version Upgrade

```bash
# 1. Backup
docker compose exec db pg_dump -U postgres gebrauchtwagen > backup-pre-upgrade.sql

# 2. Code Update
git pull origin main
bun install
bun run prisma:migrate deploy

# 3. Container Rebuild
docker compose build --no-cache
docker compose up -d

# 4. Verify
curl http://localhost:3000/health
bun run test
```

### Version Downgrade

```bash
# 1. Rollback Migrations
bun run prisma:migrate resolve --rolled-back MIGRATION_NAME

# 2. Dienst neu starten
docker compose down
docker compose up -d

# 3. Verify
bun run test
```

---

## Performance Tuning

### PostgreSQL Tuning

```sql
-- Statistiken aktualisieren
ANALYZE;

-- Indizes neu bauen
REINDEX DATABASE gebrauchtwagen;

-- Slow Query Log aktivieren
ALTER SYSTEM SET log_min_duration_statement = 100;  -- 100ms threshold
SELECT pg_reload_conf();
```

### Cache Optimization

```typescript
// In jwt-auth.mts
// JWKS Cache TTL anpassen (default: 1h)
const JWKS_CACHE_TTL_MS = 3600000; // Increase für Prod

// In prisma-client.mts  
// Connection Pool anpassen
maxPoolSize: 20,  // Für High Load
minPoolSize: 5,
```

### GraphQL Query Optimization

```typescript
// In mutation-handler.mts
// Selektive Includes statt `select: *`
include: {
  hauptuntersuchung: true,  // Nur notwendige Relations
  // standort: false,       // Nicht nötig? Ausschließen
}
```

---

## Automatisierte Wartung

### Daily Task

```bash
#!/bin/bash
# scripts/daily-maintenance.sh

# Backup
docker compose exec db pg_dump -U postgres gebrauchtwagen > backups/$(date +%Y%m%d).sql

# Statistics Update
docker compose exec db psql -U postgres -c "ANALYZE;"

# Log Cleanup  
docker compose logs --tail 1000 app > logs/app-$(date +%Y%m%d).log
```

### Cron Job einrichten

```bash
# Jeden Tag um 2:00 Uhr
0 2 * * * /path/to/daily-maintenance.sh

# Alle 4 Stunden JWKS Cache refresh
0 */4 * * * curl -X POST http://localhost:3000/admin/jwks-refresh
```

---

## Support & Debugging

### Debug Mode

```bash
# Ausführliche Logs
DEBUG=* bun run dev

# Nur App-Logs
DEBUG=app:* bun run dev
```

### Performance Profiling

```bash
# Node Inspector aktivieren
node --inspect-brk ./dist/index.js

# Dann öffnen: chrome://inspect
```

### Datenbank Profiling

```sql
-- Top 10 slow queries
SELECT query, calls, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Index Nutzung
SELECT * FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

---

**Weitere Hilfe**: Siehe `docs/` Verzeichnis für spezifische Themen  
**Issues**: GitHub Issues auf dem Repo öffnen  
**Kontakt**: Team @ [email protected]

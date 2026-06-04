# Deployment Guide - Produktionsumgebung

## Überblick

Diese Guide covert den Deployment von gebrauchtwagen-ts APIs in eine Production/Staging Umgebung.

Folgende Szenarien werden abgedeckt:
- Local Development Setup
- Docker Compose Staging Stack (3-Tier)
- Kubernetes Production Cluster (optional)
- CI/CD Pipeline Konfiguration

---

## Voraussetzungen

### Systemanforderungen

| Komponente | Lokal | Staging | Production |
|-----------|-------|---------|-----------|
| CPU | 2 Cores | 4 Cores | 8 Cores |
| RAM | 4 GB | 8 GB | 16 GB |
| Disk | 20 GB SSD | 50 GB SSD | 100 GB SSD |
| OS | Any | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Installierte Tools

```bash
# Essentiell
docker --version      # >= 24.0
docker-compose --version  # >= 2.20
git --version         # >= 2.40

# Optional
kubectl --version     # >= 1.28 (nur für K8s)
helm --version        # >= 3.12 (nur für K8s)
```

### Zugang & Credentials

- [ ] GitHub Access (Deploy Keys Setup)
- [ ] Docker Registry (Falls privat)
- [ ] PostgreSQL Admin Credentials
- [ ] Keycloak Admin Credentials
- [ ] SSL/TLS Certificates (für Production)

---

## Phase 1: Local Development

### Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/your-org/gebrauchtwagen-ts.git
cd gebrauchtwagen-ts

# 2. Environment Setup
cp .env.example .env
# Edit .env für lokale URLs

# 3. Dependencies installieren
bun install

# 4. Datenbank Migrations
bun run prisma:migrate deploy

# 5. Services starten
docker compose up -d

# 6. Verify
curl http://localhost:3000/health
# { "status": "OK" }
```

### Development Workflow

```bash
# Terminal 1: Watch Mode
bun run dev

# Terminal 2: Tests
bun run test --watch

# Terminal 3: Logs  
docker compose logs -f app

# GraphQL Playground
open http://localhost:3000/graphql
```

---

## Phase 2: Docker Compose Staging Stack

### Stack Architektur

```
┌─────────────┐
│   Frontend  │ (Optional: Reverse Proxy/Load Balancer)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
┌──▼──┐  ┌─▼──┐
│HTTP │  │UAT │ (Keycloak IAM)
│3000 │  │8080│
└──┬──┘  └─┬──┘
   │   APP │
   └───┬───┘
       │
   ┌───▼────┐
   │Postgres│
   │  5432  │
   └────────┘
```

### Docker Compose Bereitstellung

**1. Compose File Vorbereiten** (extras/compose/docker-compose.yml)

```yaml
version: '3.8'

services:
  app:
    image: gebrauchtwagen-ts:1.0.0
    container_name: gw-app
    env_file: .env
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - db
      - keycloak
    networks:
      - gw-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:16-alpine
    container_name: gw-db
    environment:
      POSTGRES_DB:${DB_NAME:-gebrauchtwagen}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    restart: unless-stopped
    ports:
      - "5432:5432"
    networks:
      - gw-net
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d

  keycloak:
    image: quay.io/keycloak/keycloak:26.2
    container_name: gw-keycloak
    command: start
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://db:5432/${DB_NAME:-gebrauchtwagen}
      KC_DB_USERNAME: ${DB_USER}
      KC_DB_PASSWORD: ${DB_PASSWORD}
      KC_REALM_NAME: gebrauchtwagen-ts
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_PASSWORD}
    restart: unless-stopped
    ports:
      - "8080:8080"
    networks:
      - gw-net
    depends_on:
      - db

volumes:
  postgres_data:

networks:
  gw-net:
    driver: bridge
```

**2. Environment Setup**

```bash
# .env für Staging
cp .env.example .env

# Wesentliche Vars:
cat >> .env << EOF
NODE_ENV=production
PORT=3000

# Database
DB_HOST=db
DB_USER=postgres
DB_NAME=gebrauchtwagen
DB_PASSWORD=SecurePassword123!
DATABASE_URL=postgresql://postgres:SecurePassword123!@db:5432/gebrauchtwagen

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_PASSWORD=AdminPassword123!
KEYCLOAK_ISSUER=http://localhost:8080/realms/gebrauchtwagen-ts
KEYCLOAK_AUDIENCE=gebrauchtwagen-ts
KEYCLOAK_JWKS_URL=http://keycloak:8080/realms/gebrauchtwagen-ts/protocol/openid-connect/certs

# Logging
LOG_LEVEL=info
EOF
```

**3. Compose Stack Deployment**

```bash
# Stack hochfahren
docker compose -f extras/compose/docker-compose.yml up -d

# Verify
docker compose ps
docker compose logs -f app

# Health Check
curl http://localhost:3000/health
curl http://localhost:8080/  # Keycloak
```

**4. Datenbank Initialisierung**

```bash
# Migrations applizieren
docker compose exec app bun run prisma:migrate deploy

# Optional: Seed mit Test-Daten
docker compose exec app bun run prisma:seed
```

---

## Phase 3: Production Deployment - Nginx Reverse Proxy

### Nginx Setup

**1. Nginx Konfiguration** (extras/compose/nginx.conf)

```nginx
upstream app {
    server app:3000;
    keepalive 40;
}

server {
    listen 80;
    server_name gebrauchtwagen-api.example.com;
    
    client_max_body_size 10m;
    
    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Connection Reuse
        proxy_set_header Connection "";
    }
    
    # GraphQL Endpoint
    location /graphql {
        proxy_pass http://app/graphql;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # POST für Queries
        proxy_method POST;
        limit_except GET POST OPTIONS {
            deny all;
        }
    }
    
    # Health Endpoint (Monitoring)
    location /health {
        access_log off;
        proxy_pass http://app/health;
    }
}

# HTTPS Redirect (nach Zertifikat Setup)
server {
    listen 443 ssl http2;
    server_name gebrauchtwagen-api.example.com;
    
    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # ... location blocks wie oben ...
}
```

**2. Docker Compose mit Nginx erweitern**

```yaml
services:
  nginx:
    image: nginx:alpine
    container_name: gw-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs  # SSL Certs
    depends_on:
      - app
    networks:
      - gw-net

  # ... app, db, keycloak ...
```

---

## Phase 4: Kubernetes Deployment (Optional)

### K8s Manifests

**1. App Deployment** (k8s/app-deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gebrauchtwagen-ts
  labels:
    app: gebrauchtwagen
spec:
  replicas: 3
  selector:
    matchLabels:
      app: gebrauchtwagen
  template:
    metadata:
      labels:
        app: gebrauchtwagen
    spec:
      containers:
      - name: api
        image: your-registry/gebrauchtwagen-ts:1.0.0
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secrets
              key: connection-string
        - name: KEYCLOAK_ISSUER
          value: "https://auth.example.com/realms/gebrauchtwagen-ts"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          
        resources:
          requests:
            cpu: 200m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 512Mi

---
apiVersion: v1
kind: Service
metadata:
  name: gebrauchtwagen-ts-service
spec:
  selector:
    app: gebrauchtwagen
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**2. Deployment mit Helm**

```bash
# Chart erzeugen (optional)
helm create gebrauchtwagen-ts

# Deployment
helm install gebrauchtwagen-ts ./gebrauchtwagen-ts \
  --set image.repository=your-registry/gebrauchtwagen-ts \
  --set image.tag=1.0.0 \
  --set replicas=3
```

---

## Phase 5: CI/CD Pipeline

### GitHub Actions Workflow

**Datei**: `.github/workflows/deploy.yml`

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker Image
      run: |
        docker build -t gebrauchtwagen-ts:${{ github.sha }} .
        docker tag gebrauchtwagen-ts:${{ github.sha }} gebrauchtwagen-ts:latest
    
    - name: Push to Registry
      run: |
        docker login -u ${{ secrets.REGISTRY_USER }} -p ${{ secrets.REGISTRY_PASSWORD }}
        docker push gebrauchtwagen-ts:latest
    
    - name: Deploy to Production
      run: |
        ssh deploy@prod.example.com \
          "cd /app && docker compose pull && docker compose up -d"
```

---

## Rollback Strategie

### Bei Problemen

```bash
# 1. Probleme identifizieren
curl http://localhost:3000/health
# Falls nicht OK:

# 2. Logs prüfen
docker compose logs app

# 3. Zu vorheriger Version rollback
docker compose down
git checkout v0.9.0  # Vorige Version
docker compose up -d

# 4. Verify
curl http://localhost:3000/health
```

### Database Rollback

```bash
# Zu vorheriger Migration zurück
bun run prisma:migrate resolve --rolled-back 20260604100000_schema_update

# Oder Backup restore
psql -f backup-pre-deploy.sql
```

---

## Monitoring nach Deployment

### Essential Checks

```bash
# Health Status
watch curl http://localhost:3000/health

# Database Connection
curl http://localhost:3000/admin/db-status

# Cache Status
curl http://localhost:3000/admin/cache-status

# Service Logs
docker compose logs app | grep -i error
```

### Alerts Konfigurieren (Optional)

```bash
# Prometheus Alert Rules
cat > prometheus-rules.yml << EOF
groups:
- name: gebrauchtwagen-ts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
    for: 2m
    annotations:
      summary: High error rate detected
  
  - alert: DatabaseDown
    expr: up{job="postgres"} == 0
    for: 1m
    annotations:
      summary: PostgreSQL is unreachable
EOF
```

---

## Skalierung & Optimierung

### Horizontale Skalierung (Multiple Instances)

```bash
# Hinter Load Balancer
docker compose -f docker-compose.prod.yml up -d --scale app=3

# K8s Replicas
kubectl scale deployment gebrauchtwagen-ts --replicas=5
```

### Vertikale Skalierung (Ressourcen erhöhen)

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## Sicherheit im Deployment

### Checklist für Production

- [ ] SSL/TLS Certificates konfiguriert
- [ ] Firewall Rules: nur notwendige Ports offen
- [ ] Database Password ist starker Hash
- [ ] Keycloak Admin-Credentials werden sichere gelagert
- [ ] Secrets in Environment, nicht in Code
- [ ] Rate Limiting konfiguriert
- [ ] CORS auf nur benötigte Origins
- [ ] Logging ohne sensible Daten konfiguriert

### Secrets Management

```bash
# Mit Docker Secrets (Swarm)
echo "SecurePassword123!" | docker secret create db_password -

# Mit Kubernetes Secrets
kubectl create secret generic db-secrets --from-literal=connection-string="..."

# Mit External Secret Manager (Optional)
# AWS Secrets Manager, HashiCorp Vault, etc.
```

---

## Dokumentation & Support

- **Troubleshooting**: Siehe docs/OPERATIONS.md
- **Architecture**: Siehe docs/er-diagramm.md
- **API Calls**: Bruno Collection in `bruno/`
- **Monitoring**: Prometheus auf Port 9090

**Support-Kontakt**: devops-team@example.com

---

**Deployment Guide Version**: 1.0  
**Letztes Update**: 4. Juni 2026  
**Wartung durch**: DevOps Team

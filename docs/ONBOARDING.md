# Developer Onboarding Guide

Willkommen beim gebrauchtwagen-ts Projekt! Diese Guide hilft neuen Entwicklern schnell produktiv zu werden.

---

## ⏱️ Quick Start (5 Minuten)

### 1. Repository klonen

```bash
git clone https://github.com/your-org/gebrauchtwagen-ts.git
cd gebrauchtwagen-ts
```

### 2. Dependencies installieren

```bash
bun install
```

### 3. Environment vorbereiten

```bash
cp .env.example .env
# .env ist ok mit defaults für local dev
```

### 4. Docker Stack starten

```bash
docker compose up -d
```

### 5. Tests ausführen

```bash
bun run test
```

**Fertig!** Deine Umgebung läuft. Siehe [Architecture Overview](#architecture-overview) für nächste Schritte.

---

## 📁 Project Structure

```
gebrauchtwagen-ts/
├── src/                    # Quellcode
│   ├── app.mts            # Express/Hono App setup
│   ├── index.mts          # Entry point
│   ├── admin/             # Admin endpoints (/health, /metrics)
│   ├── config/            # Konfiguration (env, logger, DB, server)
│   ├── logger/            # Logging (Pino)
│   ├── rest/              # REST API Routers
│   │   └── gebrauchtwagen-router.mts
│   ├── graphql/           # GraphQL Resolver
│   ├── service/           # Business Logic
│   ├── data/              # Test Fixtures
│   └── generated/         # Prisma Generated Client
│
├── test/                  # Test Dateien
│   ├── unit/             # Unit Tests
│   └── integration/      # Integration Tests
│
├── docs/                 # Dokumentationen
│   ├── architecture.md   # Tech Stack erklärung
│   ├── authentication.md # Keycloak/OAuth Setup
│   ├── er-diagramm.md   # Database Schema
│   └── ... [weitere docs]
│
├── extras/              # Docker Configs
│   └── compose/
│       └── docker-compose.yml
│
├── prisma/              # Database Schema + Migrations
│   └── schema.prisma
│
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vitest.config.ts     # Test runner config
└── eslint.config.mts    # Linter rules
```

---

## 🏗️ Architecture Overview

### Tech Stack

```
Frontend              API Gateway              Database
┌──────────┐         ┌──────────┐            ┌──────────┐
│HTML/CSS  │ ────→   │ Hono     │ ──GraphQL─→│ Prisma   │
│TypeScript│ ←────   │ REST/GQL │ ←──REST──  │ Postgres │
└──────────┘         └──────────┘            └──────────┘
                     ├─ Logging
                     ├─ Error Handling
                     ├─ Auth (JWT/OIDC)
                     └─ CORS
                     
                        Keycloak IAM
                     (OIDC Identity Provider)
```

### Layer-basierte Architektur

```
┌─────────────────────────────────┐
│   Router (REST/GraphQL)         │ ← URL Mapping
├─────────────────────────────────┤
│   Middleware (Auth, Logging)    │ ← Request Processing
├─────────────────────────────────┤
│   Service Layer (Business Logic)│ ← Core Logic
├─────────────────────────────────┤
│   Prisma Client (Data Access)   │ ← Database
├─────────────────────────────────┤
│   PostgreSQL / Keycloak         │ ← External Services
└─────────────────────────────────┘
```

### API Patterns

```
REST API Pattern          │  GraphQL Pattern
──────────────────────────┼──────────────────
GET  /gebrauchtwagen       │  query { gebrauchtwagen { } }
POST /gebrauchtwagen       │  mutation { createGebrauchtwagen() }
PUT  /gebrauchtwagen/:id   │  mutation { updateGebrauchtwagen() }
DELETE /gebrauchtwagen/:id │  mutation { deleteGebrauchtwagen() }
```

---

## 📝 Development Workflow

### Einen Feature entwickeln

**1. Feature Branch erstellen**

```bash
git checkout -b feature/issue-123-description
# z.B. feature/8-keycloak-integration
```

**2. Feature implementieren**

```
src/rest/gebrauchtwagen-router.mts      ← REST Endpoint hinzufügen
src/graphql/mutation-handler.mts        ← GraphQL Mutation hinzufügen
src/service/gebrauchtwagen-service.mts ← Business Logic
test/                                   ← Tests schreiben
```

**3. Tests schreiben & ausführen**

```bash
# Alle Tests
bun run test

# Spezifischen Test
bun run test gebrauchtwagen.test.ts

# Watch Mode (bei jeder Datei-Änderung)
bun run test --watch
```

**4. Linter & Formatter**

```bash
# Linting
bun run lint

# Format Code
bun run fmt

# Combined
bun run lint:fix
```

**5. Commit erstellen**

```bash
# Staged Changes müssen es sein
git add src/
git commit -m "feat(gebrauchtwagen): add new filter feature (#123)"

# Commit Format: <type>(<scope>): <message> (<issue>)
# Types: feat, fix, docs, test, refactor, chore, style
```

**6. Pull Request erstellen**

```bash
git push origin feature/issue-123
# → öffne PR auf GitHub
```

---

## 🧪 Testing Strategy

### Test-Pyramid

```
         △  E2E Tests (1-2)
        ╱ ╲ Integration Tests (6 Suites)
       ╱   ╲ Unit Tests (42+)
      ╱─────╲
```

### Unit Tests schreiben

**Pattern**: Test Aufsatz mit `describe()` + `test()`

```typescript
// test/service/gebrauchtwagen-service.test.ts

import { describe, it, expect } from 'vitest'
import { GebrauchtwagenService } from '../../src/service/gebrauchtwagen-service'

describe('GebrauchtwagenService', () => {
  
  it('should create a new car', async () => {
    const service = new GebrauchtwagenService()
    const car = await service.create({ fahrzeugnummer: 'ABC-123' })
    expect(car.id).toBeDefined()
    expect(car.fahrzeugnummer).toBe('ABC-123')
  })
  
  it('should throw on invalid fahrzeugnummer', async () => {
    const service = new GebrauchtwagenService()
    await expect(
      service.create({ fahrzeugnummer: '' })
    ).rejects.toThrow('fahrzeugnummer required')
  })
})
```

### Integration Tests schreiben

```typescript
// test/integration/rest/gebrauchtwagen.test.ts

describe('REST: Gebrauchtwagen Endpoint', () => {
  
  beforeAll(async () => {
    // Setup: DB Connection, Server start
    await setupTestDatabase()
    await startServer()
  })
  
  afterAll(async () => {
    // Cleanup
    await teardownTestDatabase()
  })
  
  it('GET /gebrauchtwagen returns cars', async () => {
    const response = await fetch('http://localhost:3000/gebrauchtwagen')
    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })
})
```

### Test-Tipps

| Szenario | Tool | Beispiel |
|----------|------|----------|
| Logic-Test | Unit Test | Service-Methode komplexe Berechnung |
| API-Test | Integration Test | REST Endpoint behavior |
| Error Handling | Unit/Integration | Exception Werfen/Catching |
| Performance | Benchmark | `bun run perf:test` |

---

## 🔐 Authentication & Authorization

### Token Types

**1. Admin Token** (lokal für Tests)
```
Token: admin-token
Rolle: admin
Nutze für: Alle Mutationen in local dev
```

**2. User Token** (lokal für Tests)
```
Token: user-token
Rolle: user
Nutze für: Queries, keine Mutations
```

**3. JWT Token** (Production mit Keycloak)
```
Issue von: Keycloak OIDC Provider
Format: Bearer TOKEN
Nutze für: All authenticated requests
```

### Auth in Requests testen

**REST**:
```bash
curl -H "Authorization: Bearer admin-token" \
  -X POST http://localhost:3000/graphql \
  -d '{...}'
```

**GraphQL Playground** (auf http://localhost:3000/graphql):
```json
{
  "headers": {
    "Authorization": "Bearer admin-token"
  }
}
```

### Auth Fehler debuggen

```bash
# Siehe docs/authentication.md für:
# - Token Validation Flow
# - Claims / Roles
# - Error Codes & Solutions
```

---

## 🐘 Database & Prisma

### Prisma Schema bearbeiten

```typescript
// prisma/schema.prisma

model Gebrauchtwagen {
  id           String   @id @default(cuid())
  fahrzeugnummer String  @unique
  marke        String
  modell       String
  baujahr      Int
  
  // Relations
  standort     Standort @relation(fields: [standortId], references: [id])
  standortId   String
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Migration erstellen

```bash
# Schema bearbeitet? Dann:
bun run prisma:migrate dev --name add_new_field

# Was geschah:
# 1. Migration file erstellt
# 2. Database aktualisiert
# 3. Prisma Client generiert
```

### DB Queries in Code

```typescript
// src/service/gebrauchtwagen-service.mts

import { prisma } from '../config/prisma-client'

export async function getAllCars() {
  return await prisma.gebrauchtwagen.findMany({
    include: {
      standort: true,
      hauptuntersuchung: true,
      schaden: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50  // Pagination
  })
}
```

### Häufige Errors

| Error | Ursache | Lösung |
|-------|--------|--------|
| `PrismaClientKnownRequestError` | DB constraint violated | Check unique fields, relations |
| `not found` query | ID nicht existent | `findUniqueOrThrow()` vs `findUnique()` |
| Type mismatch | Schema update ohne regen | `bun run prisma:generate` |

---

## 🚀 Common Tasks

### Feature hinzufügen (Checkliste)

```
☐ Feature Branch erstellen
☐ Schema.prisma Änderung (wenn nötig)
☐ Migration: bun run prisma:migrate dev
☐ REST Endpoint implementieren (src/rest/)
☐ GraphQL Mutation implementieren (src/graphql/)
☐ Service Layer (Business Logic)
☐ Error Handling hinzufügen
☐ Unit Tests schreiben
☐ Integration Tests schreiben
☐ Dokumentation (docs/ oder inline comments)
☐ git add / git commit
☐ Linting: bun run lint:fix
☐ All tests pass: bun run test
☐ Git push + Create PR
```

### Bug fixen

```bash
# 1. Bug reproduzieren (Test schreiben)
bun run test bug-report.test.ts  # → FAIL

# 2. Fix implementieren
# (In relevant source file)

# 3. Test validieren
bun run test bug-report.test.ts  # → PASS

# 4. Regression Check
bun run test  # Alle Tests noch PASS?

# 5. Commit
git commit -m "fix: resolve issue #123"
```

### Performance Optimieren

```bash
# Langsame Query finden
docker compose logs app | grep "duration"

# Details anschauen
# In docs/OPERATIONS.md → Performance Tuning
```

---

## 📚 Key Documentation Files

| Datei | Zweck |
|-------|--------|
| [README.md](../README.md) | Project Overview |
| [docs/er-diagramm.md](./er-diagramm.md) | Database Schema |
| [docs/authentication.md](./authentication.md) | Auth Details |
| [docs/OPERATIONS.md](./OPERATIONS.md) | Troubleshooting |
| [docs/DEPLOYMENT.md](./DEPLOYMENT.md) | Production Deploy |

---

## 💬 Getting Help

### Fragen zum Code?

1. **Code Comments** lesen (sollten explaining sein)
2. **Test Cases** anschauen (oft beste Dokumentation)
3. **docs/** Verzeichnis durchsuchen
4. **GitHub Issues** durchsuchen
5. Team fragen (Slack/Discord)

### PR Review Process

```
1. Feature fertig → git push
2. Öffne PR auf GitHub
3. CI läuft automatisch:
   ✓ Tests
   ✓ Linting
   ✓ Type Check
4. Team Lead review + approve
5. Merge to main branch
```

### Code Review Checklist

Wenn du andere Code reviewst:

- [ ] Tests vorhanden & passing
- [ ] TypeScript strikt (keine `any`)
- [ ] Keine console.logs debuggen
- [ ] Error Handling korrekt
- [ ] Dokumentiert (Kommentare / JSDoc)
- [ ] Keine hardcoded values (except tests)
- [ ] Performance ok (keine N+1 queries)

---

## 🎯 Learning Path

### Week 1 - Grundlagen

- [ ] Setup fertig (Quick Start)
- [ ] Architecture verstehen (READ: docs/er-diagramm.md)
- [ ] Einen kleinen Bugfix machen
- [ ] Tests schreiben üben

### Week 2 - Deeper Dive

- [ ] REST API erweitern (neuer Endpoint)
- [ ] GraphQL Mutation schreiben
- [ ] Database Schema ändern
- [ ] Authentication testen (siehe docs/auth)

### Week 3+ - Full Contributor

- [ ] Complex Features umsetzen
- [ ] PR Reviews durchführen
- [ ] Deploy in Staging testen
- [ ] Performance optimieren

---

## ⚡ Pro Tips

1. **Immer Tests zuerst schreiben** (TDD) → weniger Bugs
2. **bun run dev** im Watch Mode → schnelleres Feedback
3. **Docker logs -f** für Live Logs bei Debugging
4. **GraphQL Playground** lokal für API Experimente
5. **Commit oft** → einfacher zu revert bei Fehler

---

## 📞 Support Contact

- **Tech Questions**: Open GitHub Issue
- **Architecture**: Code Review Thread
- **Environment Issues**: DevOps Team
- **Deploy Questions**: Release Manager

---

**Willkommen ins Team!** 🎉  
Viel Spaß beim Coden!

Last updated: 4. Juni 2026  
Maintained by: Dev Team

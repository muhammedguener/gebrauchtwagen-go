# API Migration & Evolution Guide

## Versioning Strategy

Wir verwenden **Semantic Versioning (SemVer)** für API Versionen:

```
MAJOR.MINOR.PATCH
  ↑     ↑     ↑
  │     │     └─ Bugfixes (v1.0.1, v1.0.2)
  │     └─────── Features (v1.1.0, v1.2.0)
  └───────────── Breaking Changes (v2.0.0)
```

**Aktuelle Version**: 1.0.0

---

## Phase 1: v1.0.0 → v1.1.0 (Non-Breaking)

### Neue Features

```typescript
// Beispiel: Neue Feld hinzufügen
interface Gebrauchtwagen {
  id: string
  fahrzeugnummer?: string  // optional, rückwärts kompatibel ✅
}

// REST Endpoint
GET /gebrauchtwagen?brand=audi&minPrice=10000
```

### Deployment Strategy

```bash
# 1. Feature Branch
git checkout -b feature/v1.1-new-filter

# 2. Implementierung (keine Breaking Changes)
# - Nur neue optionale Felder
# - Neue Query Parameter
# - Neue Endpoints
# - Bugs fixieren

# 3. Backward Compatibility prüfen
bun run compat:check  # Prüft: alte Clients funktionieren noch?

# 4. Release
npm version minor  # v1.0.0 → v1.1.0
git push && create PR
```

### Client Migration - Nicht nötig!
```typescript
// Alte Clients funktionieren unverändert
const gw = await fetch('/gebrauchtwagen/123')

// Neue Clients nutzen neue Features optional
const gw = await fetch('/gebrauchtwagen?brand=audi')
```

---

## Phase 2: v1.1.0 → v2.0.0 (Breaking Change)

### Breaking Change Szenarien

**Szenario A**: Feldname ändern

```typescript
// v1.0.0
interface Gebrauchtwagen {
  km: number  // ← renamed
}

// v2.0.0
interface Gebrauchtwagen {
  mileage: number  // ← new name
  // km wurde entfernt → BREAKING!
}
```

**Szenario B**: Enum-Wert ändern

```typescript
// v1.0.0
enum Zustand {
  NEU = "NEW",
  GEBRAUCHT = "USED",
  RENOVIERT = "RECONDITIONED"
}

// v2.0.0
enum Zustand {
  MINT = "MINT",           // Renamed
  USED = "USED",
  PARTS = "PARTS"          // Removed RECONDITIONED!
}
```

**Szenario C**: Endpoint Änderung

```typescript
// v1.0.0
POST /gebrauchtwagen
Response: 200 { id, data }

// v2.0.0
POST /gebrauchtwagen
Response: 201 { id, data }  // ← Status Code changed!
```

### Migration Path in v2.0.0

**Dual-version Support** (empfohlen für großen Kundenstamm):

```typescript
// REST API Handler
app.post('/v1/gebrauchtwagen', async (c) => {
  // v1 Handler - Legacy
  return h andle_v1(c)
})

app.post('/v2/gebrauchtwagen', async (c) => {
  // v2 Handler - New
  return handleV2(c)
})

// GraphQL - separate root, wird mittels Alias erreicht
schema_v1.defineQuery({
  gebrauchtwagenList: // ... old field names
})

schema_v2.defineQuery({
  gebrauchtwagen: // ... new field names
})
```

**Deployment Timeline**:

```
T+0 Tage (Release)      → v2.0.0 deployed mit v1 Compatibility
T+7 Tage               → v1 deprecated (warning logs)
T+14 Tage              → v1 support ends (docs updated)
T+21 Tage              → v1 endpoints removed
T+30 Tage              → Old Clients show 404 nur noch
```

---

## Migration Guide für Clients

### REST API Clients

#### Migration v1 → v2

**Vorher (v1.0.0)**:
```typescript
// Client mit alte Schema
async function fetching() {
  const response = await fetch('https://api.example.com/gebrauchtwagen')
  const car = response.json()
  
  console.log(car.km)  // Alter Feldname
  console.log(car.zustand)  // GEBRAUCHT value
}
```

**Nachher (v2.0.0)**:
```typescript
// Migration 1: Version in URL anpassen
async function fetching() {
  const response = await fetch('https://api.example.com/v2/gebrauchtwagen')
  const car = response.json()
  
  console.log(car.mileage)  // ← Neuer Feldname!
  console.log(car.condition)  // ← Neuer Name
  
  // Mapping für alte Enums
  const zustandMap = {
    'USED': 'GEBRAUCHT',
    'MINT': 'NEU',
    'PARTS': 'VERSCHROTT'
  }
}
```

**Oder Compatibility Layer**:
```typescript
// Adapter für Backward Kompatibilität
class GebrauchtwagenAdapter {
  static fromV2(data: V2Gebrauchtwagen): V1Gebrauchtwagen {
    return {
      km: data.mileage,
      zustand: this.mapCondition(data.condition),
      // ... weitere Feldmappings
    }
  }
  
  private static mapCondition(cond: string) {
    const map = { 'MINT': 'NEU', 'USED': 'GEBRAUCHT' }
    return map[cond] || cond
  }
}

// Nutzen
const car = GebrauchtwagenAdapter.fromV2(await fetchV2())
```

### GraphQL Clients

#### Apollo Client Migration

**Vorher**:
```typescript
const QUERY = gql`
  query GetCars {
    gebrauchtwagen {
      id
      km
      zustand
    }
  }
`
```

**Nachher (mit Deprecation Warnings)**:
```typescript
const QUERY_V2 = gql`
  query GetCars {
    gebrauchtwagen {  # ← neue Root
      id
      mileage        # ← neuer Feldname (km ist deprecated)
      condition      # ← neuer Feldname
    }
  }
`
```

**Oder mit Fragment-Abstraktionen für Zukunft**:
```typescript
// Defineierte Fragment
const CarFragment = gql`
  fragment CarData on Gebrauchtwagen {
    id
    mileage
    condition
  }
`

// Wiederverwendbar across versions
const QUERY = gql`
  query {
    gebrauchtwagen {
      ...CarData
    }
  }
  ${CarFragment}
`
```

---

## Breaking Change - Minimierung

### Best Practices

**❌ Schlecht**: Einfach Felder löschen
```typescript
// v1
interface Car { id: string; km: number; }

// v2 - BREAKING!
interface Car { id: string; mileage: number; }
```

**✅ Besser**: Deprecation Period mit Dual Support
```typescript
// v2 Release Notes
/**
 * DEPRECATED: field `km` will be removed in v3.0.0
 * Migrate to field `mileage` for future compatibility
 */
interface Car {
  id: string
  
  // Alte Felder - DEPRECATED
  km?: number  // @deprecated - use mileage instead
  
  // Neue Felder
  mileage: number  // Available since v2.0.0
}
```

### Deprecation Kennzeichnung

**In Code**:
```typescript
/**
 * @deprecated Use `mileage` instead. Will be removed in v3.0.0.
 */
get km(): number {
  return this.mileage  // Rechnet um für Kompatibilität
}
```

**In API Responses**:
```json
{
  "data": { "mileage": 150000 },
  "deprecations": [
    {
      "field": "km",
      "message": "Use 'mileage' instead",
      "removedIn": "v3.0.0"
    }
  ]
}
```

**In Headers**:
```
Deprecation: true
Sunset: Sun, 31 Dec 2026 23:59:59 GMT
Link: <https://docs.example.com/migration-v2>; rel="deprecation"
```

---

## Datenbank Schema Migration

### Smooth Schema Evolution

**Szenario**: Auto-km Feld auf auto-mileage umbenennen

```sql
-- Step 1: Neue Spalte hinzufügen (v1.1.0)
ALTER TABLE gebrauchtwagen ADD COLUMN mileage INTEGER;

-- Step 2: Daten migrieren
UPDATE gebrauchtwagen SET mileage = km WHERE km IS NOT NULL;

-- Step 3: Application Code führt beide
-- read aus (Fallback)

-- Step 4: Nach Deployment Period - alte spalte droppen (v2.0.0)
ALTER TABLE gebrauchtwagen DROP COLUMN km;
```

**In Prisma Schema**:
```prisma
model Gebrauchtwagen {
  id         String @id
  
  // Neue Spalte
  mileage    Int?
  
  // Alte Spalte - wird noch gelesen aber nicht mehr geschrieben
  km         Int? @deprecated
  
  // Migration Helper
  preUpdate() {
    if (km !== null) this.mileage = km
  }
}
```

---

## Testing für Kompatibilität

### Compatibility Test Suite

```bash
# Test gegen v1 u. v2 gleichzeitig
bun run test:compat

# Ergebnis
✓ v1 Client können v2 API nutzen
✓ v2 Client haben neue Features
✓ Keine Breaking Changes für alte Clients
```

**Test Implementation**:
```typescript
// test/compat-v1-v2.test.ts

describe('API Compat v1 → v2', () => {
  
  test('v1 Client kann /gebrauchtwagen lista nutzen', async () => {
    const res = await v1Client.get('/gebrauchtwagen')
    expect(res.body.cars[0]).toHaveProperty('km')  // v1 Feld
  })
  
  test('v2 Client nutzt /gebrauchtwagen mit mileage', async () => {
    const res = await v2Client.get('/gebrauchtwagen')
    expect(res.body.cars[0]).toHaveProperty('mileage')  // v2 Feld
  })
  
  test('v1 Feld km → berechnet aus mileage', async () => {
    const gw = new Gebrauchtwagen({ mileage: 100000 })
    expect(gw.km).toBe(100000)  // Rückwärts-OK
  })
})
```

---

## Dokumentation für Major Versions

### Upgrade Dokumentation

**Datei**: `docs/UPGRADE-v2.md`

```markdown
# Migration Guide: v1 → v2

## What's Changed

| v1 | v2 | Impact |
|----|----|----|
| `km` | `mileage` | **BREAKING** - Field renamed |
| `zustand: GEBRAUCHT` | `condition: USED` | **BREAKING** - Enum changed |
| POST returns 200 | POST returns 201 | **BREAKING** - Status codes |

## Migration Steps

1. Update API URLs:
   - `/v1/...` → `/v2/...`

2. Update field names:
   - `car.km` → `car.mileage`
   - `car.zustand` → `car.condition`

3. Update enum handling:
   - Old: `if (car.zustand === 'GEBRAUCHT')`
   - New: `if (car.condition === 'USED')`

## Timeline

- **Now**: v2.0.0 released, v1 still supported
- **30 days**: v1 deprecated warnings
- **60 days**: v1 support ends
- **90 days**: v1 removed completely
```

---

## Support Richtlinien

### Version Support Matrix

| Version | Released | Support Until | Status |
|---------|----------|---------------|--------|
| v0.9.0 | 2024-01 | 2024-06-01 | ⚠️ Deprecated |
| v1.0.0 | 2024-05 | 2026-01-01 | ✅ Active |
| v1.1.0 | 2025-08 | 2026-06-01 | ✅ Latest |
| v2.0.0 | 2026-06 | 2028-06-01 | 🚀 New |

### Bug Fix & Security Policy

- **Latest Minor**: Alle Updates
- **Previous Minor**: Security + Critical Bugs
- **Older**: Keineunterstützung

---

## Checklist für neue API Version

Bevor Deployment einer neuen Major Version:

- [ ] Breaking Changes dokumentiert
- [ ] Migration Path definiert
- [ ] Deprecation Warnings implementiert
- [ ] Compat Tests schreiben & passing
- [ ] Client Libraries updaten
- [ ] Dokumentation aktualisiert
- [ ] Timeline für alte Version kommuniziert
- [ ] Support Team trainiert
- [ ] Rollback Plan vorhanden

---

**Guide Version**: 1.0  
**Nächste Version Geplant**: v1.1.0 (Q3 2026)

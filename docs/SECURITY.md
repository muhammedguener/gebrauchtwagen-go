# Security Hardening & Best Practices

## 🔒 Security Overview

### Current Security Posture

| Area | Status | Notes |
|------|--------|-------|
| Authentication | ✅ Implemented | JWT + OIDC via Keycloak |
| Authorization | ✅ Implemented | Role-based (admin/user) |
| Transport Security | ⚠️ Partial | HTTPS required in production |
| Input Validation | ✅ Implemented | Zod schemas in Prisma |
| SQL Injection | ✅ Protected | Prisma ORM prevents |
| CORS | ✅ Configured | Whitelisted origins only |
| Rate Limiting | ⚠️ TODO | Should add in production |
| Secrets Management | ⚠️ Partial | .env locally, needs Vault in prod |
| Logging | ✅ Implemented | Non-sensitive data only |

---

## 🔐 Authentication & Authorization

### 1. JWT Token Security

**Token Flow**:
```
┌─────────────┐         ┌──────────┐         ┌────────┐
│   Client    │──────→  │Keycloak  │────→    │ JWT    │
│             │  Login  │  OIDC    │ Token   │ Token  │
└─────────────┘         └──────────┘         └────────┘
                                    │
                   ┌────────────────┘
                   │
                   ▼
            ┌──────────────┐
            │API / GraphQL │
            │Verify JWT    │
            │Check Role    │
            └──────────────┘
```

**Token Claims prüfen**:
```typescript
// src/config/jwt-auth.mts
interface JWTClaims {
  sub: string              // Subject (user ID)
  iss: string              // Issuer (Keycloak URL)
  aud: string              // Audience (app name)
  exp: number              // Expiration
  iat: number              // Issued at
  email: string            // User email
  email_verified: boolean
  given_name: string
  family_name: string
  preferred_username: string
  realm_access: {
    roles: string[]        // ['admin', 'user', ...]
  }
}

// Validierung
function verifyJWT(token: string) {
  // 1. Signature prüfen (gegen JWKS)
  // 2. Expiration prüfen
  // 3. Issuer prüfen
  // 4. Audience prüfen
  // 5. Return Claims
}
```

### 2. Role-Based Access Control (RBAC)

```typescript
// src/config/jwt-auth.mts
function hasAdminRole(claims: JWTClaims): boolean {
  return claims.realm_access?.roles?.includes('admin') ?? false
}

function hasUserRole(claims: JWTClaims): boolean {
  return claims.realm_access?.roles?.includes('user') ?? false
}

// In Endpoints
app.post('/gebrauchtwagen', async (c) => {
  const claims = await getJWTClaims(c)
  
  if (!hasAdminRole(claims)) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  
  // Admin only operation
})
```

### 3. Token Expiration & Refresh

**Local Development** (static tokens):
```
admin-token / user-token → keine Expiration (testing only!)
```

**Production** (Keycloak):
```
Access Token  → 5 min expiration
Refresh Token → 30 day expiration

RefreshFlow:
1. Token expires
2. Client uses Refresh Token to get new Access Token
3. No re-login needed (seamless)
```

**Implementierung** (optional für v1.1):
```typescript
// In production auth middleware
async function ensureValidToken(c: Context) {
  const token = extractBearerToken(c)
  
  try {
    return await verifyJWT(token)
  } catch (err) {
    if (err.message.includes('expired')) {
      // Try refresh
      const refreshed = await refreshToken(token)
      return await verifyJWT(refreshed)
    }
    throw err
  }
}
```

---

## 🛡️ Transport Security

### 1. HTTPS/TLS Configuration

**In Production** (nginx reverse proxy):
```nginx
server {
    listen 443 ssl http2;
    
    ssl_certificate /etc/nginx/certs/server.crt;
    ssl_certificate_key /etc/nginx/certs/server.key;
    
    # Modern TLS Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS (force HTTPS)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Prevent SSL Stripping
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Zertifikat Management**:
```bash
# Mit Let's Encrypt (kostenfrei)
certbot certonly --standalone -d api.example.com

# Oder selbst signiert (development only!)
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

### 2. CORS Configuration

```typescript
// src/config/cors.mts
const ALLOWED_ORIGINS = [
  'http://localhost:3000',      // Local dev
  'http://localhost:5173',      // Vite dev
  'https://app.example.com',    // Production
  'https://admin.example.com'   // Admin portal
]

app.use(cors({
  origin: (origin) => {
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin
    }
    return false  // Reject
  },
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count', 'Link'],
  maxAge: 86400  // Preflight cache 24h
}))
```

### 3. Security Headers

```typescript
// Security Headers Middleware
app.use(securityHeadersMiddleware)

function securityHeadersMiddleware(c: Context, next: Next) {
  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY')
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff')
  
  // Enable XSS protection
  c.header('X-XSS-Protection', '1; mode=block')
  
  // Content Security Policy
  c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'")
  
  // Referrer Policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  return next()
}
```

---

## 🔒 Input Validation & Sanitization

### 1. Schema Validation

```typescript
// Mit Zod (in Prisma types)
import { z } from 'zod'

const CreateGebrauchtwagenSchema = z.object({
  fahrzeugnummer: z.string().min(5).max(20),
  marke: z.string().min(2).max(50),
  modell: z.string().min(2).max(50),
  baujahr: z.number().int().min(1900).max(new Date().getFullYear()),
  zustand: z.enum(['NEU', 'GEBRAUCHT', 'RENOVIERT']),
  preis: z.number().positive().optional(),
  notizen: z.string().max(1000).optional(),
})

// Validierung vor DB Write
async function createGebrauchtwagen(input: unknown) {
  const valid = CreateGebrauchtwagenSchema.parse(input)
  return await prisma.gebrauchtwagen.create({ data: valid })
}
```

### 2. SQL Injection Prevention

```typescript
// ✅ SICHER - Prisma handles escaping
const cars = await prisma.gebrauchtwagen.findMany({
  where: {
    fahrzeugnummer: userInput  // Parameterized
  }
})

// ❌ UNSICHER - Never do this!
const cars = await db.raw(`
  SELECT * FROM gebrauchtwagen WHERE fahrzeugnummer = '${userInput}'
`)
// SQL Injection possible!
```

### 3. XSS Prevention

```typescript
// In GraphQL Responses - HTML escape
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

// Usage
const notizen = escapeHtml(input.notizen)  // Before storing
```

---

## 🚫 Rate Limiting & DDoS Protection

### 1. Rate Limiting Implementation

```typescript
// npm install express-rate-limit
import rateLimit from 'express-rate-limit'

// Global rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                  // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,     // Return RateLimit-* headers
  skip: (req) => req.path === '/health'  // Skip health checks
})

app.use(limiter)

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts per 15 min
  skipSuccessfulRequests: true  // Don't count successful logins
})

app.post('/auth/login', authLimiter, handleLogin)
```

### 2. DDoS Protection (reverse proxy level)

```nginx
# Nginx Rate Limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_status 429;  # Return 429 Too Many Requests

server {
    location /api {
        limit_req zone=api burst=20 nodelay;  # Allow 20 burst requests
    }
}
```

---

## 🔐 Secrets Management

### 1. Environment Variables

**Development** (.env.example shared):
```
# Add to git - NO SECRETS
DATABASE_URL="postgresql://dev:dev@localhost:5432/gebrauchtwagen"
KEYCLOAK_ADMIN="admin"
KEYCLOAK_PASSWORD="should-be-secret"  # ← Only in actual .local.env
```

**Production** (.env NOT shared):
```bash
# Use secrets manager
DATABASE_URL="postgresql://prod_user:$(aws secretsmanager get-secret-value ...)
KEYCLOAK_PASSWORD="..."
JWT_SECRET="..."
```

### 2. Secrets Storage Options

| System | Best For | Setup |
|--------|----------|-------|
| Docker Secrets | Swarm | `docker secret create` |
| Kubernetes Secrets | K8s | `kubectl create secret` |
| AWS Secrets Manager | AWS | `aws secretsmanager` |
| HashiCorp Vault | Multi-cloud | Helm chart install |
| .env.local | Development | gitignore + template |

### 3. Using AWS Secrets Manager

```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

async function getSecret(secretName: string): Promise<string> {
  const client = new SecretsManagerClient({ region: 'eu-central-1' })
  
  const command = new GetSecretValueCommand({ SecretId: secretName })
  const response = await client.send(command)
  
  return response.SecretString!
}

// Usage
const dbPassword = await getSecret('prod/db-password')
```

---

## 📊 Audit Logging

### 1. Security Event Logging

```typescript
// src/logger/security-audit.mts
async function logSecurityEvent(
  eventType: 'AUTH_SUCCESS' | 'AUTH_FAILED' | 'UNAUTHORIZED' | 'MODIFIED_DATA',
  details: Record<string, any>
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    userId: details.userId,
    ip: details.ip,
    action: details.action,
    resource: details.resource,
    status: details.status,
    details: details.details
  }
  
  logger.info(logEntry, 'SECURITY_AUDIT')
  
  // Optional: Send to external audit log
  // await auditLogService.send(logEntry)
}

// Usage
logSecurityEvent('AUTH_SUCCESS', {
  userId: 'user-123',
  ip: '192.168.1.1',
  action: 'LOGIN',
  status: 'SUCCESS'
})
```

### 2. Log Rotation & Retention

```bash
# In docker-compose.yml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"        # Max log file size
        max-file: "3"          # Keep 3 old files
        labels: "service=api"
```

---

## 🔍 Vulnerability Scanning

### 1. Dependency Scanning

```bash
# Automated: GitHub Dependabot (auto PRs for updates)

# Manual scan
npm audit

# Output example:
# found 2 high, 1 critical vulnerabilities

# Fix
npm audit fix

# Force
npm audit fix --force  # May break API compatibility
```

### 2. Code Scanning

```bash
# ESLint Security Plugin
bun run lint

# SonarQube (optional)
bun run sonar

# OWASP Dependency-Check
bun run dependency-check
```

---

## 📋 Security Checklist - Pre Production

### Before every Production Deployment

- [ ] All dependencies updated & audited (`npm audit`)
- [ ] No console.logs with sensitive data
- [ ] No hardcoded secrets in code
- [ ] HTTPS/TLS configured + certificates valid
- [ ] CORS origins whitelist configured
- [ ] Rate limiting enabled
- [ ] SQL injection impossible (Prisma ORM used)
- [ ] XSS prevention (HTML escaping done)
- [ ] CSRF tokens for mutations (if applicable)
- [ ] Security headers configured (Content-Security-Policy, etc)
- [ ] Authentication/Authorization tested
- [ ] Error messages non-informative (no stack traces)
- [ ] Database backups automated
- [ ] Logging configured (audit trail exists)
- [ ] Secrets in secrets manager (not .env)
- [ ] IP whitelisting if internal API
- [ ] Firewall rules: minimal open ports
- [ ] Monitoring & alerting active
- [ ] Incident response plan documented

---

## 🚨 Incident Response

### If Security Breach Detected

```
1. IMMEDIATE (0-5 min)
   └─ Isolate affected system
   └─ Document timeline
   └─ Notify security team

2. SHORT TERM (5-60 min)
   └─ Analyze scope (what was accessed?)
   └─ Revoke compromised credentials
   └─ Check logs for suspicious activity
   └─ Notify affected users if data exposed

3. MEDIUM TERM (1-24 hours)
   └─ Implement emergency patches
   └─ Deploy to all systems
   └─ Post-incident review
   └─ Update monitoring rules

4. LONG TERM (days/weeks)
   └─ Root cause analysis
   └─ Process improvements
   └─ Preventive controls added
   └─ Team training
```

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT.io](https://jwt.io/) - Token inspection/validation
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

---

## 🔄 Security Review Schedule

| Frequency | Activity |
|-----------|----------|
| Weekly | Dependency audit checks |
| Monthly | Code security scan (ESLint) |
| Quarterly | Penetration testing (external) |
| Annually | Security assessment + training |

---

**Security Guide Version**: 1.0  
**Last Updated**: 4. Juni 2026  
**Security Officer**: [TBD]  
**Incident Contact**: security@example.com

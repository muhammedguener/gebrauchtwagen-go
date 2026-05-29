# syntax=docker.io/docker/dockerfile-upstream:1.22.0
# check=error=true

# Aufruf:
#   docker build --tag gebrauchtwagen-ts:latest .
#   docker run --rm --env DATABASE_URL=postgresql://gebrauchtwagen:gebrauchtwagen@host.docker.internal:5432/gebrauchtwagen?schema=gebrauchtwagen -p 3000:3000 gebrauchtwagen-ts:latest

ARG BUN_VERSION=1.3.13

FROM oven/bun:${BUN_VERSION}-alpine AS builder

WORKDIR /opt/app

ENV DATABASE_URL="postgresql://gebrauchtwagen:gebrauchtwagen@db:5432/gebrauchtwagen?schema=gebrauchtwagen"

COPY bun.lock bunfig.toml package.json prisma.config.ts tsconfig.json ./
COPY prisma ./prisma

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY src ./src

RUN bun run prisma:generate \
    && bun run tsc

FROM oven/bun:${BUN_VERSION}-alpine AS production-deps

WORKDIR /opt/app

COPY bun.lock bunfig.toml package.json ./

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production

FROM oven/bun:${BUN_VERSION}-alpine AS final

LABEL org.opencontainers.image.title="gebrauchtwagen-ts" \
    org.opencontainers.image.description="Hono-, Prisma- und TypeScript-Appserver fuer das Gebrauchtwagen-Aggregat" \
    org.opencontainers.image.version="0.1.0" \
    org.opencontainers.image.licenses="GPL-3.0-or-later" \
    org.opencontainers.image.authors="Gebrauchtwagen-Team"

WORKDIR /opt/app

ENV NODE_ENV=production \
    PORT=3000

COPY --from=production-deps --chown=bun:bun /opt/app/node_modules ./node_modules
COPY --from=builder --chown=bun:bun /opt/app/src ./src
COPY --from=builder --chown=bun:bun /opt/app/package.json ./package.json

USER bun

EXPOSE 3000

STOPSIGNAL SIGINT

CMD ["bun", "src/index.mts"]

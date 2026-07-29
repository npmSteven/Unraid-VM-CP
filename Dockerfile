FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/shared-utils/package.json packages/shared-utils/
COPY packages/unraid-client/package.json packages/unraid-client/
COPY packages/mock-unraid/package.json packages/mock-unraid/

COPY packages/ packages/

RUN bun install --trust

COPY apps/frontend/index.html apps/frontend/
COPY apps/frontend/src apps/frontend/src/
COPY apps/frontend/tsconfig.json apps/frontend/
COPY apps/frontend/vite.config.ts apps/frontend/

RUN bun run build:frontend

FROM base AS release
COPY --from=install /app/node_modules node_modules
COPY --from=install /app/apps/frontend/dist apps/frontend/dist
COPY --from=install /app/packages packages
COPY apps/backend apps/backend
COPY package.json ./

RUN chown -R bun:bun /app

USER bun
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8787/health').then(r => {process.exit(r.status===200?0:1)})"

CMD ["bun", "run", "apps/backend/src/server.ts"]

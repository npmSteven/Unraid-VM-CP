FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS install
COPY package.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN cd backend && bun install --production && \
    cd /app/frontend && bun install --trust

COPY frontend/index.html frontend/
COPY frontend/src frontend/src/
COPY frontend/tsconfig.json frontend/
COPY frontend/vite.config.ts frontend/

RUN cd /app/frontend && bun run build

FROM base AS release
COPY --from=install /app/backend/node_modules backend/node_modules
COPY --from=install /app/frontend/dist frontend/dist
COPY backend/src backend/src/
COPY backend/package.json backend/

RUN chown -R bun:bun /app

USER bun
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:8787/health').then(r => {process.exit(r.status===200?0:1)})"

CMD ["bun", "run", "backend/src/server.ts"]

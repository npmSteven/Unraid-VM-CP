FROM oven/bun:1-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY frontend/ ./frontend/
COPY backend/ ./backend/

RUN pnpm install && \
    pnpm run build:frontend

EXPOSE 8787

CMD ["bun", "run", "backend/src/server.ts"]

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.14.0 --activate

COPY pnpm-lock.yaml ./
COPY package.json ./
COPY frontend/ ./frontend/
COPY backend/ ./backend/

RUN pnpm install && \
    pnpm run build:frontend && \
    pnpm run build:backend

EXPOSE 8787

CMD ["pnpm", "run", "start:prod"]

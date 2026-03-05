# syntax=docker/dockerfile:1.6
# Multi-stage build for OptionScope (React client + Express BFF)
# Uses npm workspaces — the single root lockfile drives all installs.

# Stage 1: Install all dependencies (shared across build stages)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# Stage 2: Build React client
FROM deps AS client-build
WORKDIR /app
COPY client/ ./client/
RUN npm run build --workspace=client

# Stage 3: Build Express server
FROM deps AS server-build
WORKDIR /app
COPY server/ ./server/
RUN npm run build --workspace=server

# Stage 4: Production
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init curl

RUN addgroup -g 5400 -S appgroup && \
    adduser -S appuser -u 5400 -G appgroup

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund --workspace=server

COPY --from=server-build /app/server/dist ./server/dist
COPY --from=client-build /app/client/dist ./client/dist

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/health >/dev/null || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/index.js"]

# syntax=docker/dockerfile:1.6
# Multi-stage build for OptionScope (React client + Express BFF)

# Stage 1: Build React client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY client/ .
RUN npm run build

# Stage 2: Build Express server
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY server/ .
RUN npx tsc

# Stage 3: Production
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init curl

RUN addgroup -g 5400 -S appgroup && \
    adduser -S appuser -u 5400 -G appgroup

WORKDIR /app

COPY server/package*.json ./server/
RUN --mount=type=cache,target=/root/.npm cd server && npm ci --omit=dev --no-audit --no-fund

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

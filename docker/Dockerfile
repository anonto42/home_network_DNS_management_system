# ─── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json ./
RUN npm install --prefer-offline
COPY frontend/ .
RUN npm run build

# ─── Stage 2: Build Go binary (production, with embedded frontend) ────────────
FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
# Cache deps separately from source
COPY backend/go.mod backend/go.sum ./
RUN GOWORK=off go mod download
# Copy source
COPY backend/ .
# Copy built frontend into the static/ dir that embed_prod.go expects
COPY --from=frontend-builder /app/dist ./cmd/dns-server/static/
ENV CGO_ENABLED=1 GOWORK=off
RUN go build -tags embed -o dns-server ./cmd/dns-server

# ─── Stage 3: Dev — Air hot-reload, source mounted as volume ─────────────────
FROM golang:1.25-alpine AS dev
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
RUN go install github.com/air-verse/air@latest
# Pre-download deps so volume-mounted source compiles without fetching
COPY backend/go.mod backend/go.sum ./
RUN GOWORK=off go mod download
ENV CGO_ENABLED=1 GOWORK=off
# Source is mounted at runtime via volume; Air watches for changes
CMD ["air", "-c", ".air.toml"]

# ─── Stage 4: Test — golangci-lint + go test ─────────────────────────────────
FROM golang:1.25-alpine AS test
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
# Pin lint version for reproducibility
RUN go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.64.8
# Pre-download deps
COPY backend/go.mod backend/go.sum ./
RUN GOWORK=off go mod download
# Source is mounted at runtime via volume
ENV CGO_ENABLED=1 GOWORK=off
CMD ["sh", "-c", "golangci-lint run ./... && go test ./..."]

# ─── Stage 5: Production — minimal Alpine image ───────────────────────────────
FROM alpine:3.20 AS production
RUN addgroup -S app && adduser -S -G app app
RUN apk add --no-cache libcap
WORKDIR /app
# Binary already has embedded frontend from stage 2
COPY --from=builder /app/dns-server .
RUN setcap cap_net_bind_service=+ep /app/dns-server
RUN mkdir -p data && chown app:app data
USER app
EXPOSE 53/udp 8080/tcp
CMD ["./dns-server", \
     "--dns-port",  "53", \
     "--http-port", "8080", \
     "--db",        "/app/data/dns.db", \
     "--log-format","json"]

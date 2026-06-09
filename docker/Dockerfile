FROM golang:1.25-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
COPY backend .
ENV CGO_ENABLED=1
RUN go build -o dns-server ./cmd/dns-server

FROM golang:1.25-alpine AS dev
WORKDIR /app
RUN apk add --no-cache gcc musl-dev
RUN go install github.com/air-verse/air@latest
COPY backend .
ENV CGO_ENABLED=1
CMD ["air", "-c", ".air.toml"]

FROM alpine:latest AS production
WORKDIR /root/
COPY --from=builder /app/dns-server .
EXPOSE 53/udp 8080/tcp
CMD ["./dns-server"]

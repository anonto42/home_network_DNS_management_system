FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o dns-server ./cmd/dns-server

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/dns-server .
EXPOSE 53/udp 8080/tcp
CMD ["./dns-server"]

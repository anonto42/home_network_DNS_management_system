.PHONY: build run test clean web web-dev

# Go backend
build:
	cd server && go build -o ../bin/dns-server ./cmd/dns-server

run:
	cd server && sudo go run ./cmd/dns-server

test:
	cd server && go test ./...

clean:
	rm -rf bin/

# React frontend
web:
	cd web && npm run build

web-dev:
	cd web && npm run dev

# ESP32 firmware
firmware-build:
	cd firmware && cargo build

firmware-flash:
	cd firmware && espflash flash

# All
all: build web

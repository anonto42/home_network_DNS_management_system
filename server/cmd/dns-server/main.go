package main

import (
	"flag"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/sohidul/esp32-dns-server/internal/api"
	"github.com/sohidul/esp32-dns-server/internal/db"
	"github.com/sohidul/esp32-dns-server/internal/dns"
)

var (
	dnsPort  = flag.Int("dns-port", 53, "DNS server port")
	httpPort = flag.Int("http-port", 8080, "HTTP API port")
	dbPath   = flag.String("db", "data/dns.db", "SQLite database path")
)

func main() {
	flag.Parse()

	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatal(err)
	}

	database, err := db.Open(*dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	handler := dns.NewHandler(database)

	addr := net.UDPAddr{Port: *dnsPort}
	conn, err := net.ListenUDP("udp", &addr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	go func() {
		log.Printf("DNS server listening on :%d", *dnsPort)
		buf := make([]byte, 512)
		for {
			n, client, err := conn.ReadFromUDP(buf)
			if err != nil {
				continue
			}
			go handler.Handle(conn, client, buf[:n])
		}
	}()

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	api.RegisterRoutes(r, database)

	log.Printf("HTTP API listening on :%d", *httpPort)
	httpServer := &http.Server{
		Addr:    fmt.Sprintf(":%d", *httpPort),
		Handler: r,
	}

	go func() {
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down...")
}

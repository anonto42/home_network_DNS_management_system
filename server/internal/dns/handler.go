package dns

import (
	"encoding/binary"
	"fmt"
	"log"
	"net"
	"strings"
	"time"

	"github.com/sohidul/esp32-dns-server/internal/db"
	"github.com/sohidul/esp32-dns-server/internal/models"
)

type Handler struct {
	db      *db.DB
	cache   *Cache
	started time.Time
}

func NewHandler(database *db.DB) *Handler {
	return &Handler{
		db:      database,
		cache:   NewCache(1000),
		started: time.Now(),
	}
}

func (h *Handler) Handle(conn *net.UDPConn, client *net.UDPAddr, data []byte) {
	domain, qtype := parseQuery(data)
	if domain == "" {
		return
	}

	log.Printf("Query: %s (type %d) from %s", domain, qtype, client.IP)

	if h.db.IsBlocked(domain) {
		h.db.LogQuery(domain, client.IP.String(), "blocked")
		respond(conn, client, data, domain, "0.0.0.0", 60, 0)
		return
	}

	if ip := h.db.GetCustomRecord(domain); ip != "" {
		h.db.LogQuery(domain, client.IP.String(), "custom")
		respond(conn, client, data, domain, ip, 300, 0)
		return
	}

	if cached := h.cache.Get(domain); cached != nil {
		h.db.LogQuery(domain, client.IP.String(), "cached")
		respond(conn, client, data, domain, cached.IP, cached.TTL, 0)
		return
	}

	response, err := forward(data)
	if err != nil {
		h.db.LogQuery(domain, client.IP.String(), "error")
		respond(conn, client, data, domain, "", 0, 2)
		return
	}

	if ip := extractAnswerIP(response); ip != "" {
		h.cache.Set(domain, ip, 300)
	}

	h.db.LogQuery(domain, client.IP.String(), "forwarded")
	conn.WriteToUDP(response, client)
}

func parseQuery(data []byte) (domain string, qtype uint16) {
	if len(data) < 12 {
		return "", 0
	}
	var labels []string
	i := 12
	for {
		if i >= len(data) {
			return "", 0
		}
		length := int(data[i])
		if length == 0 {
			i++
			break
		}
		if i+1+length > len(data) {
			return "", 0
		}
		labels = append(labels, string(data[i+1:i+1+length]))
		i += 1 + length
	}
	if i+4 > len(data) {
		return "", 0
	}
	qtype = binary.BigEndian.Uint16(data[i : i+2])
	return strings.ToLower(strings.Join(labels, ".")), qtype
}

func respond(conn *net.UDPConn, client *net.UDPAddr, query []byte, domain, ip string, ttl uint32, rcode uint8) {
	resp := make([]byte, len(query)+16)
	copy(resp, query[:2])

	var flags uint16 = 0x8000
	flags |= uint16(rcode)
	binary.BigEndian.PutUint16(resp[2:4], flags)

	copy(resp[4:6], query[4:6])

	ancount := uint16(0)
	if ip != "" {
		ancount = 1
	}
	binary.BigEndian.PutUint16(resp[6:8], ancount)
	binary.BigEndian.PutUint16(resp[8:10], 0)
	binary.BigEndian.PutUint16(resp[10:12], 0)

	// question section
	qstart := 12
	for resp[qstart] != 0 {
		qstart++
	}
	qstart += 5 // null terminator + QTYPE + QCLASS
	copy(resp[12:qstart], query[12:qstart])

	// answer section
	if ip != "" {
		off := qstart
		resp[off] = 0xC0
		resp[off+1] = 0x0C
		binary.BigEndian.PutUint16(resp[off+2:off+4], 1)    // type A
		binary.BigEndian.PutUint16(resp[off+4:off+6], 1)    // class IN
		binary.BigEndian.PutUint32(resp[off+6:off+10], ttl) // TTL
		binary.BigEndian.PutUint16(resp[off+10:off+12], 4)  // data length
		parts := strings.Split(ip, ".")
		if len(parts) == 4 {
			for j, p := range parts {
				resp[off+12+j] = byte(atoi(p))
			}
		}
		resp = resp[:off+16]
	} else {
		resp = resp[:qstart]
	}

	conn.WriteToUDP(resp, client)
}

func forward(data []byte) ([]byte, error) {
	upstream, err := net.Dial("udp", "1.1.1.1:53")
	if err != nil {
		return nil, fmt.Errorf("dial upstream: %w", err)
	}
	defer upstream.Close()

	upstream.SetDeadline(time.Now().Add(3 * time.Second))

	if _, err := upstream.Write(data); err != nil {
		return nil, fmt.Errorf("write upstream: %w", err)
	}

	resp := make([]byte, 512)
	n, err := upstream.Read(resp)
	if err != nil {
		return nil, fmt.Errorf("read upstream: %w", err)
	}

	return resp[:n], nil
}

func extractAnswerIP(data []byte) string {
	if len(data) < 12 {
		return ""
	}
	qend := 12
	for data[qend] != 0 {
		qend++
	}
	qend += 5

	if qend+12 > len(data) {
		return ""
	}

	if data[qend] == 0xC0 && data[qend+1] == 0x0C {
		rtype := binary.BigEndian.Uint16(data[qend+2 : qend+4])
		rdlength := binary.BigEndian.Uint16(data[qend+10 : qend+12])

		if rtype == 1 && rdlength == 4 && qend+16 <= len(data) {
			return fmt.Sprintf("%d.%d.%d.%d",
				data[qend+12], data[qend+13], data[qend+14], data[qend+15])
		}
	}
	return ""
}

func atoi(s string) int {
	n := 0
	for _, c := range s {
		n = n*10 + int(c-'0')
	}
	return n
}

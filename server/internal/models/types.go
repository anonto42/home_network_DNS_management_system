package models

import "time"

type QueryLog struct {
	ID        int64     `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Domain    string    `json:"domain"`
	ClientIP  string    `json:"client_ip"`
	Action    string    `json:"action"` // "forwarded", "blocked", "custom"
}

type CustomRecord struct {
	Domain string `json:"domain"`
	IP     string `json:"ip"`
	Type   string `json:"type"` // "A", "AAAA", "CNAME"
}

type BlockedDomain struct {
	Domain   string    `json:"domain"`
	AddedAt  time.Time `json:"added_at"`
	Wildcard bool      `json:"wildcard"` // *.example.com
}

type Stats struct {
	QueriesForwarded int     `json:"queries_forwarded"`
	QueriesBlocked   int     `json:"queries_blocked"`
	QueriesCustom    int     `json:"queries_custom"`
	CacheSize        int     `json:"cache_size"`
	UptimeSeconds    float64 `json:"uptime_seconds"`
}

type DNSQuestion struct {
	Name  string
	QType uint16
}

type DNSResponse struct {
	Question   DNSQuestion
	AnswerIP   string
	AnswerType uint16
	TTL        uint32
	RCode      uint8
}

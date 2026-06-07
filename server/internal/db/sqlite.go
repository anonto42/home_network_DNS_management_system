package db

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"

	"github.com/sohidul/esp32-dns-server/internal/models"
)

type DB struct {
	conn *sql.DB
}

func Open(path string) (*DB, error) {
	conn, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("ping db: %w", err)
	}

	db := &DB{conn: conn}
	if err := db.migrate(); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) migrate() error {
	schema := `
	CREATE TABLE IF NOT EXISTS query_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		timestamp TEXT NOT NULL,
		domain TEXT NOT NULL,
		client_ip TEXT NOT NULL,
		action TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS custom_records (
		domain TEXT PRIMARY KEY,
		ip TEXT NOT NULL,
		type TEXT DEFAULT 'A'
	);

	CREATE TABLE IF NOT EXISTS blocklist (
		domain TEXT PRIMARY KEY,
		added_at TEXT NOT NULL,
		wildcard INTEGER DEFAULT 0
	);

	CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON query_logs(timestamp DESC);
	`
	_, err := db.conn.Exec(schema)
	return err
}

func (db *DB) LogQuery(domain, clientIP, action string) {
	now := time.Now().UTC().Format(time.RFC3339)
	db.conn.Exec("INSERT INTO query_logs (timestamp, domain, client_ip, action) VALUES (?, ?, ?, ?)",
		now, domain, clientIP, action)
}

func (db *DB) GetLogs(limit int) []models.QueryLog {
	rows, err := db.conn.Query(
		"SELECT id, timestamp, domain, client_ip, action FROM query_logs ORDER BY id DESC LIMIT ?", limit)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var logs []models.QueryLog
	for rows.Next() {
		var l models.QueryLog
		var ts string
		if err := rows.Scan(&l.ID, &ts, &l.Domain, &l.ClientIP, &l.Action); err != nil {
			continue
		}
		l.Timestamp, _ = time.Parse(time.RFC3339, ts)
		logs = append(logs, l)
	}
	return logs
}

func (db *DB) ClearLogs() {
	db.conn.Exec("DELETE FROM query_logs")
}

func (db *DB) GetStats() models.Stats {
	var s models.Stats

	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action='forwarded'").Scan(&s.QueriesForwarded)
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action='blocked'").Scan(&s.QueriesBlocked)
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action='custom'").Scan(&s.QueriesCustom)

	return s
}

func (db *DB) IsBlocked(domain string) bool {
	var count int
	db.conn.QueryRow("SELECT COUNT(*) FROM blocklist WHERE domain = ?", domain).Scan(&count)
	if count > 0 {
		return true
	}

	var wildcards []string
	rows, _ := db.conn.Query("SELECT domain FROM blocklist WHERE wildcard = 1")
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var d string
			rows.Scan(&d)
			wildcards = append(wildcards, d)
		}
	}

	for _, w := range wildcards {
		wild := "." + w
		if len(domain) > len(w) && domain[len(domain)-len(wild):] == wild {
			return true
		}
	}

	return false
}

func (db *DB) GetCustomRecord(domain string) string {
	var ip string
	err := db.conn.QueryRow("SELECT ip FROM custom_records WHERE domain = ?", domain).Scan(&ip)
	if err != nil {
		return ""
	}
	return ip
}

func (db *DB) GetCustomRecords() map[string]string {
	rows, err := db.conn.Query("SELECT domain, ip FROM custom_records")
	if err != nil {
		return nil
	}
	defer rows.Close()

	recs := make(map[string]string)
	for rows.Next() {
		var domain, ip string
		rows.Scan(&domain, &ip)
		recs[domain] = ip
	}
	return recs
}

func (db *DB) AddCustomRecord(domain, ip string) {
	db.conn.Exec("INSERT OR REPLACE INTO custom_records (domain, ip) VALUES (?, ?)", domain, ip)
}

func (db *DB) DeleteCustomRecord(domain string) {
	db.conn.Exec("DELETE FROM custom_records WHERE domain = ?", domain)
}

func (db *DB) GetBlocklist() []models.BlockedDomain {
	rows, err := db.conn.Query("SELECT domain, added_at, wildcard FROM blocklist ORDER BY domain")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var list []models.BlockedDomain
	for rows.Next() {
		var b models.BlockedDomain
		var addedAt string
		rows.Scan(&b.Domain, &addedAt, &b.Wildcard)
		b.AddedAt, _ = time.Parse(time.RFC3339, addedAt)
		list = append(list, b)
	}
	return list
}

func (db *DB) AddToBlocklist(domain string, wildcard bool) {
	w := 0
	if wildcard {
		w = 1
	}
	now := time.Now().UTC().Format(time.RFC3339)
	db.conn.Exec("INSERT OR REPLACE INTO blocklist (domain, added_at, wildcard) VALUES (?, ?, ?)",
		domain, now, w)
}

func (db *DB) RemoveFromBlocklist(domain string) {
	db.conn.Exec("DELETE FROM blocklist WHERE domain = ?", domain)
}

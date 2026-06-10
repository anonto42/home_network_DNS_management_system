package db

import (
	"crypto/rand"
	"crypto/subtle"
	"database/sql"
	"encoding/base64"
	"fmt"
	"log/slog"
	"strings"
	"sync"
	"time"

	_ "modernc.org/sqlite"
	"github.com/sohidul/dns-server/internal/models"
	"golang.org/x/crypto/argon2"
)

type DB struct {
	conn      *sql.DB
	logChan   chan models.QueryLog
	logBuffer []models.QueryLog
	mu        sync.Mutex
	quit      chan struct{}
}

const (
	argonTime    = 2
	argonMemory  = 19 * 1024
	argonThreads = 1
	argonKeyLen  = 32
	argonSaltLen = 16
)

func hashPassword(password string) (string, error) {
	salt := make([]byte, argonSaltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(password), salt, argonTime, argonMemory, argonThreads, argonKeyLen)
	b64Salt := base64.RawStdEncoding.EncodeToString(salt)
	b64Hash := base64.RawStdEncoding.EncodeToString(hash)
	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s", argonMemory, argonTime, argonThreads, b64Salt, b64Hash), nil
}

func verifyPassword(password, encodedHash string) bool {
	parts := strings.Split(encodedHash, "$")
	if len(parts) != 6 {
		return false
	}
	var memory, time uint32
	var threads uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &time, &threads); err != nil {
		return false
	}
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}
	hash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false
	}
	computed := argon2.IDKey([]byte(password), salt, time, memory, threads, uint32(len(hash)))
	return subtle.ConstantTimeCompare(hash, computed) == 1
}

func Open(path string) (*DB, error) {
	conn, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	conn.Exec("PRAGMA journal_mode=WAL")
	conn.Exec("PRAGMA busy_timeout=5000")
	conn.Exec("PRAGMA synchronous=NORMAL")

	queries := []string{
		"CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, password TEXT)",
		"CREATE TABLE IF NOT EXISTS query_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, domain TEXT, client_ip TEXT, action TEXT)",
		"CREATE TABLE IF NOT EXISTS custom_records (domain TEXT PRIMARY KEY, ip TEXT)",
		"CREATE TABLE IF NOT EXISTS blocklist (domain TEXT PRIMARY KEY, added_at TEXT, wildcard INTEGER DEFAULT 0)",
	}
	for _, q := range queries {
		if _, err := conn.Exec(q); err != nil {
			return nil, err
		}
	}
	db := &DB{
		conn:    conn,
		logChan: make(chan models.QueryLog, 1000),
		quit:    make(chan struct{}),
	}
	go db.processLogBuffer()
	return db, nil
}

func (db *DB) Close() error {
	close(db.quit)
	db.Flush()
	return db.conn.Close()
}

func (db *DB) InitAdmin(email, password string) error {
	hashedPassword, err := hashPassword(password)
	if err != nil {
		return err
	}
	_, err = db.conn.Exec("INSERT OR IGNORE INTO users (email, password) VALUES (?, ?)", email, hashedPassword)
	return err
}

func (db *DB) VerifyUser(email, password string) bool {
	var hashedPassword string
	err := db.conn.QueryRow("SELECT password FROM users WHERE email = ?", email).Scan(&hashedPassword)
	if err != nil {
		return false
	}
	return verifyPassword(password, hashedPassword)
}

func (db *DB) LogQuery(domain, clientIP string, action models.Action) {
	db.logChan <- models.QueryLog{
		Timestamp: time.Now(),
		Domain:    domain,
		ClientIP:  clientIP,
		Action:    action,
	}
}

func (db *DB) processLogBuffer() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case log := <-db.logChan:
			db.mu.Lock()
			db.logBuffer = append(db.logBuffer, log)
			shouldFlush := len(db.logBuffer) >= 100
			db.mu.Unlock()
			if shouldFlush {
				db.Flush()
			}
		case <-ticker.C:
			db.Flush()
		case <-db.quit:
			return
		}
	}
}

func (db *DB) Flush() {
	db.mu.Lock()
	if len(db.logBuffer) == 0 {
		db.mu.Unlock()
		return
	}
	logs := db.logBuffer
	db.logBuffer = nil
	db.mu.Unlock()

	tx, err := db.conn.Begin()
	if err != nil {
		slog.Error("flush begin tx failed", "error", err)
		return
	}
	defer func() {
		if err := tx.Rollback(); err != nil && err != sql.ErrTxDone {
			slog.Error("failed to rollback transaction", "error", err)
		}
	}()

	stmt, err := tx.Prepare("INSERT INTO query_logs (timestamp, domain, client_ip, action) VALUES (?, ?, ?, ?)")
	if err != nil {
		slog.Error("flush prepare failed", "error", err)
		return
	}
	defer stmt.Close()

	for _, log := range logs {
		_, err := stmt.Exec(log.Timestamp.Format(time.RFC3339), log.Domain, log.ClientIP, log.Action)
		if err != nil {
			slog.Error("flush exec failed", "error", err)
		}
	}
	if err := tx.Commit(); err != nil {
		slog.Error("flush commit failed", "error", err)
	}
}

func (db *DB) GetStats() models.Stats {
	var forwarded, blocked, custom, cached int
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action = 'forwarded'").Scan(&forwarded)
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action = 'blocked'").Scan(&blocked)
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action = 'custom'").Scan(&custom)
	db.conn.QueryRow("SELECT COUNT(*) FROM query_logs WHERE action = 'cached'").Scan(&cached)
	return models.Stats{
		QueriesForwarded: forwarded,
		QueriesBlocked:   blocked,
		QueriesCustom:    custom,
		QueriesCached:    cached,
	}
}



func (db *DB) GetLogs(limit int) []models.QueryLog {
	rows, err := db.conn.Query("SELECT id, timestamp, domain, client_ip, action FROM query_logs ORDER BY id DESC LIMIT ?", limit)
	if err != nil {
		return []models.QueryLog{}
	}
	defer rows.Close()

	logs := make([]models.QueryLog, 0)
	for rows.Next() {
		var l models.QueryLog
		var ts string
		if err := rows.Scan(&l.ID, &ts, &l.Domain, &l.ClientIP, &l.Action); err != nil {
			continue
		}
		if t, err := time.Parse(time.RFC3339, ts); err == nil {
			l.Timestamp = t
		}
		logs = append(logs, l)
	}
	return logs
}

func (db *DB) ClearLogs() {
	if _, err := db.conn.Exec("DELETE FROM query_logs"); err != nil {
		slog.Error("clear logs failed", "error", err)
	}
}

func (db *DB) PruneLogs(t time.Time) {
	if _, err := db.conn.Exec("DELETE FROM query_logs WHERE timestamp < ?", t.Format(time.RFC3339)); err != nil {
		slog.Error("prune logs failed", "error", err)
	}
}

func (db *DB) GetCustomRecords() map[string]string {
	rows, err := db.conn.Query("SELECT domain, ip FROM custom_records")
	if err != nil {
		return map[string]string{}
	}
	defer rows.Close()

	records := map[string]string{}
	for rows.Next() {
		var domain, ip string
		if err := rows.Scan(&domain, &ip); err == nil {
			records[domain] = ip
		}
	}
	return records
}

func (db *DB) AddCustomRecord(domain, ip string) {
	if _, err := db.conn.Exec("INSERT OR REPLACE INTO custom_records (domain, ip) VALUES (?, ?)", domain, ip); err != nil {
		slog.Error("add custom record failed", "error", err)
	}
}

func (db *DB) DeleteCustomRecord(domain string) {
	if _, err := db.conn.Exec("DELETE FROM custom_records WHERE domain = ?", domain); err != nil {
		slog.Error("delete custom record failed", "error", err)
	}
}

func (db *DB) GetCustomRecord(domain string) string {
	var ip string
	err := db.conn.QueryRow("SELECT ip FROM custom_records WHERE domain = ?", domain).Scan(&ip)
	if err != nil {
		return ""
	}
	return ip
}

func (db *DB) GetBlocklist() []models.BlockedDomain {
	rows, err := db.conn.Query("SELECT domain, added_at, wildcard FROM blocklist ORDER BY domain")
	if err != nil {
		return []models.BlockedDomain{}
	}
	defer rows.Close()

	domains := make([]models.BlockedDomain, 0)
	for rows.Next() {
		var d models.BlockedDomain
		var addedAt string
		var wildcardInt int
		if err := rows.Scan(&d.Domain, &addedAt, &wildcardInt); err != nil {
			continue
		}
		d.Wildcard = wildcardInt != 0
		if t, err := time.Parse(time.RFC3339, addedAt); err == nil {
			d.AddedAt = t
		}
		domains = append(domains, d)
	}
	return domains
}

func (db *DB) AddToBlocklist(domain string, wildcard bool) {
	w := 0
	if wildcard {
		w = 1
	}
	if _, err := db.conn.Exec("INSERT OR IGNORE INTO blocklist (domain, added_at, wildcard) VALUES (?, ?, ?)", domain, time.Now().Format(time.RFC3339), w); err != nil {
		slog.Error("add to blocklist failed", "error", err)
	}
}

func (db *DB) RemoveFromBlocklist(domain string) {
	if _, err := db.conn.Exec("DELETE FROM blocklist WHERE domain = ?", domain); err != nil {
		slog.Error("remove from blocklist failed", "error", err)
	}
}

func (db *DB) IsBlocked(domain string) bool {
	var count int
	db.conn.QueryRow("SELECT COUNT(*) FROM blocklist WHERE ? LIKE CASE WHEN wildcard THEN '%' || domain ELSE domain END", domain).Scan(&count)
	return count > 0
}

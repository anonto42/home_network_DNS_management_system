package api

import (
	"encoding/json"
	"net/http"

	"github.com/sohidul/esp32-dns-server/internal/db"
)

type Handler struct {
	db *db.DB
}

func NewHandler(database *db.DB) *Handler {
	return &Handler{db: database}
}

func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) GetStatus(w http.ResponseWriter, r *http.Request) {
	respond(w, 200, h.db.GetStats())
}

func (h *Handler) GetLogs(w http.ResponseWriter, r *http.Request) {
	respond(w, 200, h.db.GetLogs(100))
}

func (h *Handler) ClearLogs(w http.ResponseWriter, r *http.Request) {
	h.db.ClearLogs()
	respond(w, 200, map[string]bool{"ok": true})
}

func (h *Handler) GetRecords(w http.ResponseWriter, r *http.Request) {
	respond(w, 200, h.db.GetCustomRecords())
}

func (h *Handler) AddRecord(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Domain string `json:"domain"`
		IP     string `json:"ip"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respond(w, 400, map[string]string{"error": err.Error()})
		return
	}
	h.db.AddCustomRecord(body.Domain, body.IP)
	respond(w, 200, map[string]bool{"ok": true})
}

func (h *Handler) DeleteRecord(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Domain string `json:"domain"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respond(w, 400, map[string]string{"error": err.Error()})
		return
	}
	h.db.DeleteCustomRecord(body.Domain)
	respond(w, 200, map[string]bool{"ok": true})
}

func (h *Handler) GetBlocklist(w http.ResponseWriter, r *http.Request) {
	respond(w, 200, h.db.GetBlocklist())
}

func (h *Handler) AddToBlocklist(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Domain   string `json:"domain"`
		Wildcard bool   `json:"wildcard"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respond(w, 400, map[string]string{"error": err.Error()})
		return
	}
	h.db.AddToBlocklist(body.Domain, body.Wildcard)
	respond(w, 200, map[string]bool{"ok": true})
}

func (h *Handler) RemoveFromBlocklist(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Domain string `json:"domain"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respond(w, 400, map[string]string{"error": err.Error()})
		return
	}
	h.db.RemoveFromBlocklist(body.Domain)
	respond(w, 200, map[string]bool{"ok": true})
}

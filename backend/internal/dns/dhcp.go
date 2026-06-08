package dns

import (
	"log/slog"
)

type DHCPHandler struct{}

func NewDHCPHandler() *DHCPHandler {
	return &DHCPHandler{}
}

func (h *DHCPHandler) Start() {
	slog.Info("DHCP server initialized (placeholder)")
}

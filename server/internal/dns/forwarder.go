package dns

import (
	"net"
	"sync"
	"time"
)

type PooledForwarder struct {
	mu       sync.Pool
	upstream string
}

func NewPooledForwarder(upstream string) *PooledForwarder {
	return &PooledForwarder{
		upstream: upstream,
		mu: sync.Pool{
			New: func() any {
				conn, _ := net.DialTimeout("udp", upstream, 3*time.Second)
				return conn
			},
		},
	}
}

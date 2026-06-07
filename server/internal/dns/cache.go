package dns

import (
	"sync"
	"time"
)

type cacheEntry struct {
	IP        string
	TTL       uint32
	ExpiresAt time.Time
}

type Cache struct {
	mu    sync.RWMutex
	items map[string]*cacheEntry
	max   int
}

func NewCache(max int) *Cache {
	c := &Cache{
		items: make(map[string]*cacheEntry),
		max:   max,
	}
	go c.evictLoop()
	return c
}

func (c *Cache) Get(domain string) *cacheEntry {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entry, ok := c.items[domain]
	if !ok {
		return nil
	}
	if time.Now().After(entry.ExpiresAt) {
		delete(c.items, domain)
		return nil
	}
	return entry
}

func (c *Cache) Set(domain, ip string, ttl uint32) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.items) >= c.max {
		for k := range c.items {
			delete(c.items, k)
			break
		}
	}

	c.items[domain] = &cacheEntry{
		IP:        ip,
		TTL:       ttl,
		ExpiresAt: time.Now().Add(time.Duration(ttl) * time.Second),
	}
}

func (c *Cache) Size() int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return len(c.items)
}

func (c *Cache) evictLoop() {
	ticker := time.NewTicker(30 * time.Second)
	for range ticker.C {
		c.mu.Lock()
		now := time.Now()
		for k, v := range c.items {
			if now.After(v.ExpiresAt) {
				delete(c.items, k)
			}
		}
		c.mu.Unlock()
	}
}

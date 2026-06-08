package dns

import (
	"sync"
)

type MemoryStore struct {
	blocklist     sync.Map // domain -> bool
	customRecords sync.Map // domain -> ip
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{}
}

func (s *MemoryStore) IsBlocked(domain string) bool {
	_, ok := s.blocklist.Load(domain)
	return ok
}

func (s *MemoryStore) Block(domain string) {
	s.blocklist.Store(domain, true)
}

func (s *MemoryStore) Unblock(domain string) {
	s.blocklist.Delete(domain)
}

func (s *MemoryStore) GetRecord(domain string) (string, bool) {
	val, ok := s.customRecords.Load(domain)
	if !ok {
		return "", false
	}
	return val.(string), true
}

func (s *MemoryStore) SetRecord(domain, ip string) {
	s.customRecords.Store(domain, ip)
}

func (s *MemoryStore) DeleteRecord(domain string) {
	s.customRecords.Delete(domain)
}

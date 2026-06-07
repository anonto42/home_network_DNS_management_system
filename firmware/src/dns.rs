/// DNS protocol implementation for ESP32.
/// Parses raw UDP packets, builds responses, forwards upstream.
///
/// DNS Packet format:
///   [Header: 12 bytes] [Question: variable] [Answer: variable]
///
/// Header:
///   ID:       2 bytes
///   Flags:    2 bytes (QR=1 for response, RCODE=0 OK, 3 NXDOMAIN)
///   QDCOUNT:  2 bytes (questions)
///   ANCOUNT:  2 bytes (answers)
///   NSCOUNT:  2 bytes
///   ARCOUNT:  2 bytes

pub struct DnsHandler {
    // blocklist: heapless::Set<heapless::String<64>, 128>,
    // records: heapless::Map<heapless::String<64>, heapless::String<16>, 32>,
}

impl DnsHandler {
    pub fn new() -> Self {
        Self {}
    }

    pub fn handle_query(&self, data: &[u8]) -> Option<heapless::Vec<u8, 512>> {
        let domain = self.parse_domain(data)?;
        // check blocklist
        // check custom records
        // forward to 1.1.1.1
        // return response
        None
    }

    fn parse_domain(&self, data: &[u8]) -> Option<heapless::String<256>> {
        let mut labels = heapless::String::new();
        // TODO: walk labels, build domain string
        Some(labels)
    }
}

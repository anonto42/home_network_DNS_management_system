/// Persistent storage for blocklist and custom records.
/// Uses ESP32 NVS (Non-Volatile Storage) or SPIFFS.

pub struct Storage {
    // TODO: read/write to flash
}

impl Storage {
    pub fn new() -> Self {
        Self {}
    }

    pub fn load_blocklist(&self) -> heapless::Vec<heapless::String<64>, 128> {
        heapless::Vec::new()
    }

    pub fn save_blocklist(&self, _list: &[heapless::String<64>]) {
        // TODO
    }

    pub fn load_records(&self) -> heapless::Vec<(heapless::String<64>, heapless::String<16>), 32> {
        heapless::Vec::new()
    }

    pub fn save_records(&self, _records: &[(heapless::String<64>, heapless::String<16>)]) {
        // TODO
    }
}

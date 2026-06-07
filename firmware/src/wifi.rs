/// WiFi station mode — connect to home router, auto-reconnect on disconnect.

pub struct WiFiManager {
    // ssid: String,
    // password: String,
    // connected: bool,
}

impl WiFiManager {
    pub fn new(ssid: &str, password: &str) -> Self {
        Self {}
    }

    pub fn connect(&mut self) -> Result<(), ()> {
        // TODO: Use esp-idf-svc WiFi driver
        Ok(())
    }

    pub fn is_connected(&self) -> bool {
        true
    }

    pub fn ip_address(&self) -> Option<String> {
        None
    }
}

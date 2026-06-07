/// OLED SSD1306 display (I2C) — show DNS stats.
///
/// Displays:
///   Line 1: IP address
///   Line 2: Queries forwarded
///   Line 3: Queries blocked
///   Line 4: Custom records served

pub struct Display {
    // TODO: ssd1306 driver
}

impl Display {
    pub fn new() -> Self {
        Self {}
    }

    pub fn update_stats(&mut self, forwarded: u32, blocked: u32, custom: u32) {
        // TODO: write to OLED
    }

    pub fn show_message(&mut self, msg: &str) {
        // TODO: show temporary message
    }
}

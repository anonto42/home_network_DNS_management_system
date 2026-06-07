//! ESP32 DNS Server — Rust firmware
//!
//! All-in-one DNS server running directly on ESP32.
//! Handles queries on port 53, forwards to 1.1.1.1,
//! blocks ads, serves custom records, displays stats on OLED.

#![no_std]
#![no_main]

use esp_idf_sys::{self as _};

#[no_mangle]
fn main() {
    esp_idf_sys::link_patches();

    println!("ESP32 DNS Server starting...");

    // TODO:
    // 1. Init WiFi (station mode, connect to router)
    // 2. Init DNS socket (UDP port 53)
    // 3. Load blocklist + custom records from NVS
    // 4. Init OLED display (I2C)
    // 5. Init button + LED GPIOs
    // 6. Main loop: poll DNS socket, handle queries
    // 7. Update OLED with live stats
}

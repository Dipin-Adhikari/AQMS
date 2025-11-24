#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// ----- PINS -----
#define SD_CS 5
#define PMS_RX 25
#define PMS_TX 26
#define ADC_PIN1 36 // Voltage 1 (Vin)
#define ADC_PIN2 35 // Voltage 2 (Battery)

// ----- VOLTAGE DIVIDER CONFIG -----
const float R1 = 9810.0;
const float R2 = 2150.0;
const float VOLTAGE_DIVIDER_RATIO = R2 / (R1 + R2); // k

// ----- WIFI & API CREDENTIALS -----
const char *const SSID_NAME = WIFI_SSID;       
const char *const WIFI_PASSWORD = WIFI_PASS;
const char *const TS_API_KEY = THINGSPEAK_API_KEY;
const char *const RENDER_URL = BACKEND_URL;

// ----- NTP / TIMEZONE -----
const char *const NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = 5 * 3600 + 45 * 60; // Nepal
const int DAYLIGHT_OFFSET_SEC = 0;

// ----- PMS7003 COMMANDS -----
const byte CMD_PASSIVE[] = {0x42, 0x4D, 0xE1, 0x00, 0x00, 0x01, 0x70};
const byte CMD_REQUEST[] = {0x42, 0x4D, 0xE2, 0x00, 0x00, 0x01, 0x71};
const byte CMD_SLEEP[] = {0x42, 0x4D, 0xE4, 0x00, 0x00, 0x01, 0x73};
const byte CMD_WAKEUP[] = {0x42, 0x4D, 0xE4, 0x00, 0x01, 0x01, 0x74};

#endif
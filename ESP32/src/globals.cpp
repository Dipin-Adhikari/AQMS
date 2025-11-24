#include "globals.h"

// Initialize Hardware Objects
HardwareSerial pmsSerial(2);
Adafruit_AHTX0 aht;
RTC_DS3231 rtc;

// Calibrated Vref values
float Vref1 = 3.543896;
float Vref2 = 3.610049;

// Initialize Status Flags
bool statusAHT = false;
bool statusRTC = false;
bool statusPMS = false;
bool statusWiFi = false;
bool statusSD = false;
bool statusThingSpeak = false;
bool statusRender = false;
bool statusNTP = false;
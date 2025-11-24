#include "esp_sleep.h"
#include <Arduino.h>
#include <SD.h>
#include <SPI.h>
#include <Wire.h>

// Custom Modules
#include "config.h"
#include "globals.h"
#include "network.h"
#include "sensors.h"
#include "storage.h"
#include "rtc.h"


uint64_t startTime = 0;

void printStatus() {
  Serial.println("\n===== DEVICE STATUS =====");
  Serial.printf("AHT20        : %s\n", statusAHT ? "OK" : "FAILED");
  Serial.printf("RTC          : %s\n", statusRTC ? "OK" : "FAILED");
  Serial.printf("PMS7003      : %s\n", statusPMS ? "OK" : "FAILED");
  Serial.printf("WiFi         : %s\n", statusWiFi ? "OK" : "FAILED");
  Serial.printf("NTP          : %s\n", statusNTP ? "OK" : "FAILED");
  Serial.printf("ThingSpeak   : %s\n", statusThingSpeak ? "OK" : "FAILED");
  Serial.printf("Render       : %s\n", statusRender ? "OK" : "FAILED");
  Serial.printf("SD Card      : %s\n", statusSD ? "OK" : "FAILED");
  Serial.println("=========================\n");
}

void setup() {
  startTime = millis();

  Serial.begin(9600);
  delay(1000);
  Serial.println(F("Sensors ON"));

  // ----- VOLTAGE ADC SETUP -----
  analogReadResolution(12);
  analogSetPinAttenuation(ADC_PIN1, ADC_11db);
  analogSetPinAttenuation(ADC_PIN2, ADC_11db);

  /* * CALIBRATION SECTION
   * If you need to calibrate, measure real voltage with multimeter,
   * uncomment lines below, upload, check Serial Monitor for new Vref values,
   * then update Vref1/Vref2 variables in src/globals.cpp and comment this back
   * out.
   */
  // calibrateVref(ADC_PIN1, 12.04, Vref1);
  // calibrateVref(ADC_PIN2, 8.42, Vref2);
  // -----------------------------

  // Initialize AHT20 and PM7003 sensor
  initSensors();

  // --- RTC ---
  initRTC();

  // --- WiFi ---
  connectWiFi();

  // --- Get time ---
  struct tm timeinfo;
  bool ntp_ok = false;
  ntp_ok = syncTimeAndRTC(timeinfo);
  if (ntp_ok == false) {
    getRTCTime(timeinfo);
    statusNTP = false;
  }

  // --- Read Sensor Data (AHT & PMS) ---
  float temperature = NAN, humidity = NAN;
  int pm1_0 = -1, pm2_5 = -1, pm10 = -1;
  bool pmReadSuccess = false;

  temperature = readTemperature(humidity);
  pmReadSuccess = readPMData(pm1_0, pm2_5, pm10);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println(F("❌ Invalid AHT data"));
    statusAHT = false;
  }
  if (!pmReadSuccess) {
    Serial.println(F("❌ PM read failed in loop"));
    statusPMS = false;
  }

  // --- Read Voltage Data ---
  float voltage1 = readVoltage(ADC_PIN1, Vref1);
  float voltage2 = readVoltage(ADC_PIN2, Vref2);

  Serial.print("Voltage 1 (Vin): ");
  Serial.print(voltage1);
  Serial.println(" V");
  Serial.print("Voltage 2 (Bat): ");
  Serial.print(voltage2);
  Serial.println(" V");

  // Put PMS to sleep
  sendPMSCommand(CMD_SLEEP);
  delay(5000);

  // Initialize SD Card Module
  initSD();

  // Logging to SD
  logToSD("/testdata1124.csv", temperature, humidity, pm1_0, pm2_5, pm10, voltage1, voltage2,
          (rtc.begin() ? &timeinfo : nullptr));

  // --- Uploads ---
  sendToThingSpeak(temperature, humidity, pm1_0, pm2_5, pm10, voltage1, voltage2);

  sendToRenderBackend(temperature, humidity, pm1_0, pm2_5, pm10, voltage1,
                      voltage2, &timeinfo);

  delay(5000);

  // --- Print final status before sleep ---
  printStatus();

  // --- Sleep scheduling ---
  uint64_t activeTime = millis() - startTime;
  uint64_t cycleTime = 30ULL * 60ULL * 1000ULL;

  uint64_t sleepTime = 0;
  if (activeTime < cycleTime) {
    sleepTime = cycleTime - activeTime;
  } else {
    sleepTime = 10 * 1000ULL;
  }

  Serial.printf("⏱️ Active time: %.2f sec | Sleeping for %.2f sec to complete "
                "30 min cycle\n",
                activeTime / 1000.0, sleepTime / 1000.0);

  Serial.flush();

  esp_sleep_enable_timer_wakeup(sleepTime * 1000ULL);
  esp_deep_sleep_start();
}

void loop() {}
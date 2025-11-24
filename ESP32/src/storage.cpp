#include "storage.h"
#include "config.h"
#include "globals.h"
#include <SD.h>
#include <SPI.h>

void initSD() {
  // Try initializing SD card
  if (SD.begin(SD_CS)) {
    Serial.println(F("✅ SD card initialized"));
    statusSD = true;
  } else {
    Serial.println(F("⚠️ SD card init failed; will retry later"));
    statusSD = false;
  }
}

void logToSD(const char *filename, float temp, float hum, int pm1, int pm25,
             int pm10, float vin, float battery, struct tm *timeinfo) {
  if (!SD.exists(filename)) {
    File file = SD.open(filename, FILE_WRITE);
    if (!file) {
      Serial.printf("❌ Failed to create file: %s\n", filename);
      statusSD = false;
      return;
    }
    file.println("timestamp,temp,hum,pm1,pm2.5,pm10,battery,vin");
    file.close();
    Serial.printf("✅ Created %s with header.\n", filename);
    statusSD = true;
  }

  File file = SD.open(filename, FILE_APPEND);
  if (!file) {
    Serial.printf("❌ Failed to open %s for append\n", filename);
    statusSD = false;
    return;
  }

  if (timeinfo) {
    char timeStr[30];
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", timeinfo);
    file.print(timeStr);
    Serial.printf("Logging to %s with timestamp: %s\n", filename, timeStr);
  } else {
    uint32_t ms = millis() / 1000;
    file.print(ms);
    Serial.printf("Logging to %s with millis(): %u\n", filename, ms);
  }

  file.print(",");
  file.print(temp);
  file.print(",");
  file.print(hum);
  file.print(",");
  file.print(pm1);
  file.print(",");
  file.print(pm25);
  file.print(",");
  file.println(pm10);
  file.print(",");
  file.println(battery);
  file.print(",");
  file.println(vin);

  file.close();
  Serial.println(F("💾 Data logged to SD successfully."));
  statusSD = true;
}
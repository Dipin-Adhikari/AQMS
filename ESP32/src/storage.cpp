#include "storage.h"
#include "config.h"
#include "globals.h"
#include <SD.h>
#include <SPI.h>
#include "network.h"

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



// 2. Function to process the backlog
void logToBacklog(const char *filename, float temp, float hum, int pm1,
                  int pm25, int pm10, float v1, float v2, struct tm *timeinfo) {
  File file = SD.open(filename, FILE_APPEND);
  if (!file)
    return;

  // Format: timestamp,temp,hum,pm1,pm25,pm10,v1,v2
  char timeStr[30];
  if (timeinfo)
    strftime(timeStr, sizeof(timeStr), "%Y-%m-%d %H:%M:%S", timeinfo);
  else
    strcpy(timeStr, "0");

  file.printf("%s,%.2f,%.2f,%d,%d,%d,%.2f,%.2f\n", timeStr, temp, hum, pm1,
              pm25, pm10, v1, v2);
  file.close();
  Serial.println(F("⚠️ Upload failed/offline. Data saved to backlog."));
}

void processBacklog(const char *backlogFile) {
  if (!SD.exists(backlogFile))
    return;

  Serial.println(F("🔄 Processing offline backlog..."));

  File file = SD.open(backlogFile, FILE_READ);
  File tempFile = SD.open("/temp_backlog.csv", FILE_WRITE);

  if (!file || !tempFile) {
    Serial.println(F("❌ Error opening backlog files"));
    return;
  }

  int processedCount = 0;
  int maxUploadsPerCycle = 5;

  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() == 0)
      continue;

    if (processedCount >= maxUploadsPerCycle) {
      tempFile.println(line);
      continue;
    }

    // --- PARSE DATA ---
    char buffer[128];
    line.toCharArray(buffer, sizeof(buffer));

    // 1. Parse Timestamp String (e.g., "2024-11-24 10:00:00")
    char *token = strtok(buffer, ",");
    String tStamp = String(token);

    // 2. Parse Sensor Values
    float t = atof(strtok(NULL, ","));
    float h = atof(strtok(NULL, ","));
    int p1 = atoi(strtok(NULL, ","));
    int p2 = atoi(strtok(NULL, ","));
    int p10 = atoi(strtok(NULL, ","));
    float v1 = atof(strtok(NULL, ","));
    float v2 = atof(strtok(NULL, ","));

    // 3. Reconstruct 'struct tm' from Timestamp String
    struct tm historicTime = {0};
    int year, month, day, hour, minute, second;

    // sscanf parses the string into integers
    if (sscanf(tStamp.c_str(), "%d-%d-%d %d:%d:%d", &year, &month, &day, &hour,
               &minute, &second) == 6) {
      historicTime.tm_year = year - 1900; // tm_year is years since 1900
      historicTime.tm_mon = month - 1;    // tm_mon is 0-11
      historicTime.tm_mday = day;
      historicTime.tm_hour = hour;
      historicTime.tm_min = minute;
      historicTime.tm_sec = second;
      historicTime.tm_isdst = -1; // Let mktime guess DST
    }

    // --- ATTEMPT UPLOAD ---
    // Pass the historicTime address
    statusRender = false;
    sendToRenderBackend(t, h, p1, p2, p10, v1, v2, &historicTime);

    if (statusRender == true) {
      Serial.printf("✅ Backlog item from %s uploaded!\n", tStamp.c_str());
      processedCount++;
      // Data successfully sent, so we DO NOT write it to tempFile (effectively
      // deleting it)
    } else {
      Serial.println(F("❌ Backlog upload failed, keeping in file."));
      tempFile.println(line); // Write back to temp file to try again later
    }
  }

  file.close();
  tempFile.close();

  // Swap files
  SD.remove(backlogFile);
  SD.rename("/temp_backlog.csv", backlogFile);
}
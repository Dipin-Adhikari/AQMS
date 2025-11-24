#include "globals.h"
#include "rtc.h"


void initRTC() {
  if (!rtc.begin()) {
    Serial.println(F("❌ DS3231 RTC not found!"));
    statusRTC = false;
  } else {
    Serial.println(F("✅ DS3231 RTC initialized"));
    // Check if RTC lost power and needs setting (optional default)
    if (rtc.lostPower()) {
      Serial.println(F("RTC lost power, please sync via WiFi/NTP!"));
      // sets to compile time as a placeholder if needed:
      // rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    statusRTC = true;
  }
}
bool syncTimeAndRTC(struct tm &timeinfo) {
  if (getLocalTime(&timeinfo, 5000)) {
    statusNTP = true;
    Serial.println(F("🌐 NTP time acquired:"));
    Serial.printf("NTP: %04d-%02d-%02d %02d:%02d:%02d\n",
                  timeinfo.tm_year + 1900, timeinfo.tm_mon + 1,
                  timeinfo.tm_mday, timeinfo.tm_hour, timeinfo.tm_min,
                  timeinfo.tm_sec);

    DateTime ntpDT(timeinfo.tm_year + 1900, timeinfo.tm_mon + 1,
                   timeinfo.tm_mday, timeinfo.tm_hour, timeinfo.tm_min,
                   timeinfo.tm_sec);
    DateTime rtcDT = rtc.now();

    long diff = (long)(ntpDT.unixtime() - rtcDT.unixtime());
    if (rtc.lostPower()) {
      Serial.println(F("RTC lost power — updating RTC from NTP"));
      rtc.adjust(ntpDT);
    } else if (abs(diff) > 5) {
      Serial.printf("RTC drift detected (%.0f s). Updating RTC from NTP.\n",
                    (double)diff);
      rtc.adjust(ntpDT);
    } else {
      Serial.println(F("RTC is within 5s of NTP — no update needed."));
    }
    return true;
  }
  return false;
}



void getRTCTime(struct tm &timeinfo) {
  if (statusRTC || rtc.begin()) {
    DateTime now = rtc.now();
    memset(&timeinfo, 0, sizeof(timeinfo));
    timeinfo.tm_year = now.year() - 1900;
    timeinfo.tm_mon = now.month() - 1;
    timeinfo.tm_mday = now.day();
    timeinfo.tm_hour = now.hour();
    timeinfo.tm_min = now.minute();
    timeinfo.tm_sec = now.second();
    Serial.println(F("Using RTC time (Fallback)."));
  } else {
    Serial.println(F("RTC not available for fallback time."));
  }
}
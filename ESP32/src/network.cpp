#include "config.h"
#include "globals.h"
#include "network.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>


void connectWiFi() {
  Serial.print(F("Connecting to WiFi"));
  WiFi.begin(SSID_NAME, WIFI_PASSWORD);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(F("\n✅ WiFi connected"));
    statusWiFi = true;
    configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  } else {
    Serial.println(F("\n⚠️ WiFi not connected — will use RTC if available"));
    statusWiFi = false;
  }
}



void sendToThingSpeak(float temp, float hum, int pm1, int pm25, int pm10, float vin, float battery) {
  if ((WiFi.status() == WL_CONNECTED)) {
    HTTPClient http;
    char url[250];
    snprintf(url, sizeof(url),
             "http://api.thingspeak.com/"
             "update?api_key=%s&field1=%.2f&field2=%.2f&field3=%d&field4=%d&"
             "field5=%d&field6=%f&field7=%f",
             TS_API_KEY, temp, hum, pm1, pm25, pm10, vin, battery);

    http.begin(url);
    int httpCode = http.GET();

    if (httpCode == 200) {
      Serial.println(F("✅ Data uploaded to ThingSpeak"));
      statusThingSpeak = true;
    } else {
      Serial.printf("❌ Upload failed, code: %d\n", httpCode);
      statusThingSpeak = false;
    }
    http.end();
  } else {
    Serial.println(F("❌ WiFi not connected"));
    statusThingSpeak = false;
  }
}

void sendToRenderBackend(float temp, float hum, int pm1, int pm25, int pm10,
                         float vin, float battery, struct tm *timeinfo) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    http.begin(client, RENDER_URL);
    http.addHeader("Content-Type", "application/json");

    JsonDocument jsonDoc;

    jsonDoc["temp"] = temp;
    jsonDoc["hum"] = hum;
    jsonDoc["pm1"] = pm1;
    jsonDoc["pm25"] = pm25;
    jsonDoc["pm10"] = pm10;

    jsonDoc["battery"] = battery;
    jsonDoc["vin"] = vin;

    if (timeinfo) {
      jsonDoc["ts"] = mktime(timeinfo);
    }

    jsonDoc["aht20"] = statusAHT;
    jsonDoc["rtc"] = statusRTC;
    jsonDoc["pms7003"] = statusPMS;
    jsonDoc["wifi"] = statusWiFi;
    jsonDoc["ntp"] = statusNTP;
    jsonDoc["sdcard"] = statusSD;
    jsonDoc["thingspeak"] = statusThingSpeak;

    String body;
    serializeJson(jsonDoc, body);

    int code = http.POST(body);

    // Render wakeup handling
    if (code == 503) {
      Serial.println("⚠️ Render backend waking... retrying in 3s...");
      delay(3000);
      code = http.POST(body);
    }

    if (code == 200 || code == 201) {
      Serial.println("✅ Data uploaded to Render");
      statusRender = true;
    } else {
      Serial.printf("❌ Upload failed, code: %d\n", code);
      Serial.println(body);
      statusRender = false;
    }

    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
    statusRender = false;
  }
}
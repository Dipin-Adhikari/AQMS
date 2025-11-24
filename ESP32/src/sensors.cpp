#include "sensors.h"
#include <Wire.h>
#include<globals.h>


void initSensors(){
  Wire.begin(21, 22); // SDA, SCL

  // PMS Serial
  pmsSerial.begin(9600, SERIAL_8N1, PMS_RX, PMS_TX);
  delay(2000);

  // --- AHT20 ---
  bool ahtInitialized = false;
  if (aht.begin()) {
      ahtInitialized = true;
  }
  
  if (!ahtInitialized) {
    Serial.println(F("❌ AHT20 not found"));
    statusAHT = false;
  } else {
    Serial.println(F("✅ AHT20 initialized"));
    statusAHT = true;
  }
}



void sendPMSCommand(const byte *cmd) {
  pmsSerial.write(cmd, 7);
  pmsSerial.flush();
}

float readRawAverage(int pin, int samples = 30) {
  long s = 0;
  for (int i = 0; i < samples; i++) {
    s += analogRead(pin);
    delay(3);
  }
  return s / (float)samples;
}

float readVoltage(int pin, float Vref_cal) {
  float raw = readRawAverage(pin, 30);
  float Vout = (raw / 4095.0) * Vref_cal;
  float Vin = Vout / VOLTAGE_DIVIDER_RATIO;
  return Vin;
}

void calibrateVref(int pin, float knownVin, float &Vref_cal) {
  Serial.print("Calibrating Vref for pin ");
  Serial.println(pin);
  float raw = readRawAverage(pin, 50);
  float Vout = knownVin * VOLTAGE_DIVIDER_RATIO;
  Vref_cal = (Vout * 4095.0) / raw;
  Serial.print("✔ New calibrated Vref for pin ");
  Serial.print(pin);
  Serial.print(" = ");
  Serial.print(Vref_cal, 6);
  Serial.println(" V");
}

float readTemperature(float &humidityOut) {
  sensors_event_t hum, temp;
  aht.getEvent(&hum, &temp);
  humidityOut = hum.relative_humidity;
  Serial.printf("🌡️ Temp: %.2f °C | 💧 Humidity: %.2f%%\n", temp.temperature,
                humidityOut);
  return temp.temperature;
}

bool readPMData(int &pm1_0, int &pm2_5, int &pm10) {
  sendPMSCommand(CMD_WAKEUP);
  delay(30000); // wait for PMS to stabilize
  sendPMSCommand(CMD_PASSIVE);
  delay(2000);
  while (pmsSerial.available())
    pmsSerial.read();
  sendPMSCommand(CMD_REQUEST);
  delay(1000);

  if (pmsSerial.available() >= 32) {
    uint8_t buf[32];
    pmsSerial.readBytes(buf, 32);
    if (buf[0] == 0x42 && buf[1] == 0x4D) {
      pm1_0 = (buf[10] << 8) | buf[11];
      pm2_5 = (buf[12] << 8) | buf[13];
      pm10 = (buf[14] << 8) | buf[15];
      Serial.printf("🌫️ PM1.0:%d PM2.5:%d PM10:%d\n", pm1_0, pm2_5, pm10);
      statusPMS = true;
      return true;
    }
  }
  Serial.println(F("❌ PM read failed"));
  statusPMS = false;
  return false;
}
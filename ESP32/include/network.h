#ifndef NETWORK_H
#define NETWORK_H

#include "time.h"
#include <Arduino.h>


void connectWiFi();
void sendToThingSpeak(float temp, float hum, int pm1, int pm25, int pm10, float vin, float battery);
void sendToRenderBackend(float temp, float hum, int pm1, int pm25, int pm10,
                         float vin, float battery, struct tm *timeinfo);

#endif
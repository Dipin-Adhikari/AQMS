#ifndef STORAGE_H
#define STORAGE_H

#include "time.h"
#include <Arduino.h>


void initSD();
void logToSD(const char *filename, float temp, float hum, int pm1, int pm25, int pm10, float vin, float battery,
             struct tm *timeinfo);

#endif
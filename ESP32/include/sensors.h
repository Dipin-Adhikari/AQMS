#ifndef SENSORS_H
#define SENSORS_H

#include "config.h"
#include "globals.h"
#include <Arduino.h>


void initSensors();
void sendPMSCommand(const byte *cmd);
float readTemperature(float &humidityOut);
bool readPMData(int &pm1_0, int &pm2_5, int &pm10);
float readVoltage(int pin, float Vref_cal);
void calibrateVref(int pin, float knownVin, float &Vref_cal);

#endif
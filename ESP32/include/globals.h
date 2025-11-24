#ifndef GLOBALS_H
#define GLOBALS_H

#include <Adafruit_AHTX0.h>
#include <Arduino.h>
#include <RTClib.h>


// ----- HARDWARE OBJECTS -----
extern HardwareSerial pmsSerial;
extern Adafruit_AHTX0 aht;
extern RTC_DS3231 rtc;

// ----- CALIBRATION VARIABLES -----
extern float Vref1;
extern float Vref2;

// ----- STATUS FLAGS -----
extern bool statusAHT;
extern bool statusRTC;
extern bool statusPMS;
extern bool statusWiFi;
extern bool statusSD;
extern bool statusThingSpeak;
extern bool statusRender;
extern bool statusNTP;

#endif
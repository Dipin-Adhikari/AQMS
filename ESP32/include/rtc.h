#ifndef RTC_H
#define RTC_H

#include "time.h"
#include <Arduino.h>
#include <RTClib.h>


void initRTC();
bool syncTimeAndRTC(struct tm &timeinfo);
void getRTCTime(struct tm &timeinfo);

#endif
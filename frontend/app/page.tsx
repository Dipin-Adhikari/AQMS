"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Wind, Activity, Bell, Gauge, Sparkles, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

// 1. Type Definition
type Reading = {
  ts: number;
  pm1: number;
  pm25: number;
  pm10: number;
  temp: number;
  hum: number;
  battery: number;
  vin: number;
  vout: number;
};

export default function AQMSLanding() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  // Data States
  const [latestReading, setLatestReading] = useState<Reading | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);

  // Static Features
  const features = [
    {
      icon: <Gauge className="w-6 h-6" />,
      title: "PM2.5 Monitoring",
      description: "Real-time particulate matter tracking",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Live Data",
      description: "Continuous 24/7 air quality updates",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      description: "Instant notifications for air quality",
      color: "from-orange-500 to-red-500"
    }
  ];

  const metrics = [
    { icon: "💨", name: "PM1.0", detail: "Ultra-Fine Particles", status: "Good" },
    { icon: "🌫️", name: "PM2.5", detail: "Fine Particles", status: "Good" },
    { icon: "☁️", name: "PM10", detail: "Coarse Particles", status: "Moderate" },
    { icon: "🌡️", name: "Temp & Humidity", detail: "Environmental Conditions", status: "Normal" }
  ];

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${API_URL}/api/data`);
        const json: Reading[] = await res.json();

        if (json && json.length > 0) {
          const sorted = json.sort((a, b) => a.ts - b.ts);
          setLatestReading(sorted[sorted.length - 1]);
        }
      } catch (error) {
        console.error("Failed to fetch landing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  // 3. Time Ago Logic
  useEffect(() => {
    if (!latestReading) return;

    const updateTimeLabel = () => {
      const now = Date.now();
      const dataTime = latestReading.ts * 1000;
      const diffSeconds = Math.floor((now - dataTime) / 1000);

      if (diffSeconds < 60) {
        setTimeAgo(`${diffSeconds} seconds ago`);
      } else if (diffSeconds < 3600) {
        const mins = Math.floor(diffSeconds / 60);
        setTimeAgo(`${mins} minute${mins > 1 ? 's' : ''} ago`);
      } else {
        const hours = Math.floor(diffSeconds / 3600);
        setTimeAgo(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      }
    };

    updateTimeLabel();
    const timer = setInterval(updateTimeLabel, 1000);
    return () => clearInterval(timer);
  }, [latestReading]);

  // 4. WHO Standards Classification (2021 Guidelines)
  const getWHOStatus = (pm25: number) => {
    // 0 - 15: Good (Meets WHO 24h Guideline)
    if (pm25 <= 15) return { 
      text: "Good", 
      color: "text-emerald-700", 
      valueColor: "text-emerald-800",
      bg: "from-emerald-50 to-teal-50", 
      border: "border-emerald-200",
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />
    };
    // 15 - 25: Moderate (WHO Interim Target 4)
    if (pm25 <= 25) return { 
      text: "Moderate", 
      color: "text-yellow-700", 
      valueColor: "text-yellow-800",
      bg: "from-yellow-50 to-amber-50", 
      border: "border-yellow-200",
      icon: <Activity className="w-4 h-4 text-yellow-600" />
    };
    // 25 - 37.5: Unhealthy for Sensitive Groups (WHO Interim Target 3)
    if (pm25 <= 37.5) return { 
      text: "Sensitive", 
      color: "text-orange-700", 
      valueColor: "text-orange-800",
      bg: "from-orange-50 to-red-50", 
      border: "border-orange-200",
      icon: <AlertTriangle className="w-4 h-4 text-orange-600" />
    };
    // 37.5 - 50: Unhealthy (WHO Interim Target 2)
    if (pm25 <= 50) return { 
      text: "Unhealthy", 
      color: "text-red-700", 
      valueColor: "text-red-800",
      bg: "from-red-50 to-rose-50", 
      border: "border-red-200",
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />
    };
    // > 50: Hazardous (WHO Interim Target 1 & Exceeded)
    return { 
      text: "Hazardous", 
      color: "text-purple-700", 
      valueColor: "text-purple-900",
      bg: "from-purple-50 to-fuchsia-50", 
      border: "border-purple-200",
      icon: <AlertTriangle className="w-4 h-4 text-purple-600" />
    };
  };

  const currentStatus = latestReading ? getWHOStatus(latestReading.pm25) : getWHOStatus(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 shadow-md">
              <Wind className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AQMS</h1>
              <p className="text-xs text-gray-600">Air Quality Monitoring System</p>
            </div>
          </div>
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm"
            onClick={() => router.push("/dashboard")}
          >
            View Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Real-Time • 24/7 Monitoring</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Monitor Your{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Air Quality
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Track PM2.5 levels and air quality parameters in real-time. Get instant alerts based on WHO standards.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              Access Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Activity className="w-4 h-4" />
                <span className="font-semibold text-sm">Live Monitor</span>
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-xs">Active</span>
              </div>
            </div>

            <div className="p-4 space-y-3 h-80 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
              
              {/* Main PM2.5 Card with Dynamic WHO Styling */}
              <div className={`bg-gradient-to-br ${currentStatus.bg} rounded-xl p-4 border ${currentStatus.border} transition-colors duration-500`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {currentStatus.icon}
                    <span className={`text-xs font-bold ${currentStatus.color}`}>Current PM2.5</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 ${currentStatus.color}`}>
                    {loading ? "..." : currentStatus.text}
                  </span>
                </div>
                <div className={`text-4xl font-bold ${currentStatus.valueColor}`}>
                  {loading ? "--" : latestReading?.pm25}
                </div>
                <div className={`text-xs ${currentStatus.color} mt-1 font-medium opacity-80`}>µg/m³</div>
              </div>

              {/* PM1 Card */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">PM1.0</span>
                  <span className="text-sm text-indigo-600 font-bold">
                    {loading ? "--" : latestReading?.pm1} µg/m³
                  </span>
                </div>
              </div>

              {/* PM10 Card */}
              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">PM10</span>
                  <span className="text-sm text-indigo-600 font-bold">
                    {loading ? "--" : latestReading?.pm10} µg/m³
                  </span>
                </div>
              </div>

              {/* Time Ago */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 pl-1">
                <Activity className="w-3 h-3" />
                <span>Updated {timeAgo}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <button
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                onClick={() => router.push("/dashboard")}
              >
                View Full Dashboard
              </button>
            </div>
          </div>
          <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow-lg px-3 py-1.5 border border-indigo-100">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-semibold text-gray-900">Live Data</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredFeature(idx)}
            onMouseLeave={() => setHoveredFeature(null)}
            className={`bg-white rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer ${
              hoveredFeature === idx ? 'border-indigo-300 shadow-lg scale-105' : 'border-gray-200 shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-3`}>
              {feature.icon}
            </div>
            <h4 className="text-base font-bold text-gray-900 mb-1">{feature.title}</h4>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* Metrics */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Monitored Parameters</h3>
          <p className="text-gray-600">Track multiple air quality metrics</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 text-center border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{metric.icon}</div>
              <h5 className="font-bold text-gray-900 text-lg mb-1">{metric.name}</h5>
              <p className="text-sm text-gray-600 mb-2">{metric.detail}</p>
              <p className="text-xs text-indigo-600 font-semibold">Status: {metric.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-10 text-center shadow-xl">
          <h3 className="text-3xl font-bold text-white mb-3">Start Monitoring Today</h3>
          <p className="text-lg text-indigo-50 mb-6">
            Access real-time air quality data and protect your health
          </p>
          <button
            className="bg-white hover:bg-gray-100 text-indigo-600 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
            onClick={() => router.push("/dashboard")}
          >
            View Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-1.5">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AQMS</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600 items-center">
            <a href="#" className="hover:text-indigo-600">About</a>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <button 
              onClick={() => router.push("/contact")} 
              className="hover:text-indigo-600 transition-colors"
            >
              Contact
            </button>
          </div>
          <p className="text-xs text-gray-500">© 2025 AQMS. Real-time monitoring.</p>
        </div>
      </footer>
    </div>
  );
}
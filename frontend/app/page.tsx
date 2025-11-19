"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import { Wind, Activity, TrendingUp, Bell, Gauge, Shield, ArrowRight, CheckCircle, Sparkles, Clock, RefreshCw, Zap } from 'lucide-react';

export default function AQMSLanding() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = React.useState<number | null>(null);

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

  const recentReadings = [
    { time: "2 mins ago", level: "Good", value: "12 µg/m³" },
    { time: "5 mins ago", level: "Good", value: "15 µg/m³" },
    { time: "10 mins ago", level: "Moderate", value: "38 µg/m³" },
    { time: "15 mins ago", level: "Good", value: "22 µg/m³" }
  ];

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
            Track PM2.5 levels and air quality parameters in real-time. Get instant alerts when air quality changes.
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700">Current AQI</span>
                  <span className="text-xs text-green-600">Good</span>
                </div>
                <div className="text-4xl font-bold text-green-700">42</div>
                <div className="text-xs text-green-600 mt-1">Air Quality Index</div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">PM2.5</span>
                  <span className="text-sm text-indigo-600 font-bold">12 µg/m³</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">PM10</span>
                  <span className="text-sm text-indigo-600 font-bold">28 µg/m³</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
                <Activity className="w-3 h-3" />
                <span>Updated 2 seconds ago</span>
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
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600">About</a>
            <a href="#" className="hover:text-indigo-600">Privacy</a>
            <a href="#" className="hover:text-indigo-600">Terms</a>
            <a href="#" className="hover:text-indigo-600">Contact</a>
          </div>
          <p className="text-xs text-gray-500">© 2025 AQMS. Real-time monitoring.</p>
        </div>
      </footer>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { Shield, LogOut, Lock, CheckCircle2, XCircle, Download, Calendar, X, RefreshCcw } from "lucide-react";
import HealthCards from "../../components/admin/HealthCards";

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
  aht20: boolean;
  rtc: boolean;
  pms7003: boolean;
  wifi: boolean;
  ntp: boolean;
  sdcard: boolean;
  thingspeak: boolean;
};

const DEVICE_STATUS_ORDER: { key: keyof Reading; label: string }[] = [
  { key: "aht20", label: "AHT20" },
  { key: "rtc", label: "RTC" },
  { key: "pms7003", label: "PMS7003" },
  { key: "wifi", label: "WiFi" },
  { key: "ntp", label: "NTP" },
  { key: "sdcard", label: "SD Card" },
  { key: "thingspeak", label: "Thingspeak" },
];

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("");
  const [message, setMessage] = useState("Loading...");
  const [error, setError] = useState("");
  const [data, setData] = useState<Reading[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDays, setExportDays] = useState("7");
  const [refreshing, setRefreshing] = useState(false);
  

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const fetchAllData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/data`);
      const json = await res.json();
      setData([...json].reverse()); // Fix order to oldest-to-newest!
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const match = document.cookie.match(/(?:^| )token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) {
      handleNavigation("/login");
      return;
    }
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/admin/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setAdminName(data.admin);
      })
      .catch(() => {
        setError("Session expired. Please login again.");
        handleNavigation("/login");
      });

    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/data")
      .then(res => res.json())
      .then(json => setData([...json].reverse())); // newest last
  }, []);

  const latest = data[data.length - 1];
  const viewData = data;

  // Export CSV for the last "exportDays"
  const handleExportCSV = async () => {
    const match = document.cookie.match(/(?:^| )token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) {
      handleNavigation("/login");
      return;
    }

    const days = parseInt(exportDays);
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/export-csv?days=${days}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Failed to export CSV");
      return;
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `aqms_data_${days}days_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    setShowExportModal(false);
  };

  const renderDeviceStatus = () => {
    if (!latest) return null;
    return (
      <div className="grid grid-cols-7 gap-2">
        {DEVICE_STATUS_ORDER.map(device => {
          const val = latest[device.key];
          return (
            <div
              key={device.key}
              className={`flex flex-col items-center px-2 py-2 rounded-lg border transition ${
                val ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"
              }`}
            >
              {val ? (
                <CheckCircle2 className="text-green-500 w-4 h-4 mb-1" />
              ) : (
                <XCircle className="text-red-500 w-4 h-4 mb-1" />
              )}
              <span className="text-xs font-medium text-gray-700 text-center">{device.label}</span>
              <span className={`text-xs font-semibold ${val ? "text-green-600" : "text-red-600"}`}>
                {val ? "ON" : "OFF"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Compact Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <p className="text-xs text-gray-600">
                Welcome, <span className="font-semibold">{adminName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow hover:scale-105 transition text-sm"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow hover:scale-105 transition text-sm"
              onClick={() => handleNavigation("/admin/change-password")}
            >
              <Lock className="w-4 h-4" /> Password
            </button>
            <button
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow hover:scale-105 transition text-sm"
              onClick={() => {
                document.cookie = "token=; Max-Age=0; path=/;";
                handleNavigation("/login");
              }}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Device Status Card WITH Last Updated on the right */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Device Status Monitor</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">Live</span>
              </div>
              <div className="ml-2 flex items-center bg-white/70 px-2 py-1 rounded-full border border-gray-200 shadow hover:bg-gray-100 transition">
                <button
                  onClick={fetchAllData}
                  className="p-0.5"
                  title="Refresh now"
                  disabled={refreshing}
                  style={{
                    opacity: refreshing ? 0.5 : 1,
                    cursor: refreshing ? "not-allowed" : "pointer"
                  }}
                >
                  <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              {/* Last Updated - right side, not bold */}
              {latest && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Last Updated:
                  <span className="ml-1">
                    {new Date(latest.ts * 1000).toLocaleString("en-US", {
                      timeZone: "Asia/Kathmandu",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </span>
              )}
            </div>
          </div>
          {renderDeviceStatus()}
        </div>

        {/* Health Cards */}
        <div className="w-full">
          <HealthCards latest={latest} healthData={viewData} />
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-3">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Export Data</h3>
              <p className="text-sm text-gray-600">Select the time range for your CSV export</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Days
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "7", "30", "90"].map(days => (
                    <button
                      key={days}
                      onClick={() => setExportDays(days)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                        exportDays === days
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Or enter custom days
                </label>
                <input
                  type="number"
                  value={exportDays}
                  onChange={(e) => setExportDays(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm"
                  placeholder="Enter number of days"
                  min="1"
                />
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600 mt-0.5" />
                  <div className="text-xs text-indigo-700">
                    <span className="font-semibold">Export Range:</span> Last {exportDays} day{parseInt(exportDays) !== 1 ? 's' : ''} of data
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Footer */}
      <footer className="py-6 text-center text-xs text-gray-500 mt-8">
        © {new Date().getFullYear()} AQMS Admin Portal • Real-time Monitoring
      </footer>
    </div>
  );
}

"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Shield, LogOut, Lock, CheckCircle2, XCircle, Download, Calendar, RefreshCw, Server, Activity } from "lucide-react";
import HealthCards from "../../components/admin/HealthCards"; // Ensure path matches your project

type Reading = {
  ts: number;
  pm1: number;
  pm25: number;
  pm10: number;
  temp: number;
  hum: number;
  battery: number;
  vin: number;
  aht20: boolean;
  rtc: boolean;
  pms7003: boolean;
  wifi: boolean;
  ntp: boolean;
  sdcard: boolean;
  thingspeak: boolean;
};

const DEVICE_STATUS_ORDER: { key: keyof Reading; label: string }[] = [
  { key: "aht20", label: "AHT20 Sensor" },
  { key: "rtc", label: "RTC Module" },
  { key: "pms7003", label: "PMS7003" },
  { key: "wifi", label: "WiFi Conn." },
  { key: "ntp", label: "NTP Sync" },
  { key: "sdcard", label: "SD Storage" },
  { key: "thingspeak", label: "Cloud Sync" },
];

export default function AdminDashboardPage() {
  const [adminName, setAdminName] = useState("");
  const [data, setData] = useState<Reading[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDays, setExportDays] = useState("7");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Memoized fetch function
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/data`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      // Ensure we sort oldest to newest for charts
      const sortedData = Array.isArray(json) ? [...json].sort((a, b) => a.ts - b.ts) : [];
      setData(sortedData);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [API_URL]);

  // Auth Check and Initial Load
  useEffect(() => {
    const checkAuth = async () => {
      const match = document.cookie.match(/(?:^| )token=([^;]+)/);
      const token = match ? match[1] : null;

      if (!token) {
        handleNavigation("/login");
        return;
      }

      try {
        const res = await fetch(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 401 || res.status === 403) {
            handleNavigation("/login");
            return;
        }

        const userData = await res.json();
        // Fallback if 'admin' key is missing or empty
        setAdminName(userData.admin || userData.username || userData.name || "Administrator");
        
        // Fetch sensor data after auth succeeds
        await fetchAllData();
      } catch (err) {
        console.error("Auth check failed", err);
        // Optional: Don't redirect immediately on network error, just show error state
      }
    };

    checkAuth();
  }, [API_URL, fetchAllData]);

  const latest = data[data.length - 1];

  // Export Logic
  const handleExportCSV = async () => {
    const match = document.cookie.match(/(?:^| )token=([^;]+)/);
    const token = match ? match[1] : null;
    if (!token) return handleNavigation("/login");

    try {
      const days = parseInt(exportDays) || 7;
      const url = `${API_URL}/admin/export-csv?days=${days}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `aqms_export_${days}d_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowExportModal(false);
    } catch (error) {
      alert("Failed to export CSV. Please try again.");
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; Max-Age=0; path=/;";
    handleNavigation("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">Admin Portal</h1>
                <p className="text-xs text-gray-500">AQMS</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right mr-2">
                <p className="text-sm font-medium text-gray-900">{adminName}</p>
                <p className="text-xs text-gray-500">Logged in</p>
              </div>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
              <button 
                 onClick={() => handleNavigation("/admin/change-password")}
                 className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition" 
                 title="Change Password"
              >
                <Lock className="w-5 h-5" />
              </button>
              <button 
                 onClick={handleLogout}
                 className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition" 
                 title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
           <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                 <Server className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                 <h2 className="text-sm font-bold text-gray-900">System Overview</h2>
                 <p className="text-xs text-gray-500">
                    {loading ? "Syncing..." : `Last Sync: ${latest ? new Date(latest.ts * 1000).toLocaleTimeString() : "N/A"}`}
                 </p>
              </div>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={fetchAllData} 
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
           </div>
        </div>

        {/* Device Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {/* Status Panel */}
           <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Hardware Status
                 </h3>
                 {latest && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                       System Online
                    </span>
                 )}
              </div>
              
              <div className="p-6">
                 {!latest ? (
                    <div className="text-center py-8 text-gray-500">Loading device telemetry...</div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                       {DEVICE_STATUS_ORDER.map((device) => {
                          const isActive = latest[device.key];
                          return (
                             <div key={device.key} className={`
                                relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200
                                ${isActive ? 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-300' : 'bg-red-50/50 border-red-100 hover:border-red-300'}
                             `}>
                                <div className={`mb-2 p-2 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                   {isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-medium text-gray-600 text-center mb-1">{device.label}</span>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                                   {isActive ? "Active" : "Offline"}
                                </span>
                             </div>
                          );
                       })}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Health Cards Section */}
        <div className="w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Power & Diagnostics</h3>
            <HealthCards latest={latest} healthData={data} />
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-6 text-center border-t border-gray-200 mt-auto">
         <p className="text-sm text-gray-500">AQMS Admin Dashboard © {new Date().getFullYear()}</p>
      </footer>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
               <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" /> Export Data
               </h3>
               <button onClick={() => setShowExportModal(false)} className="text-white/80 hover:text-white">
                  <XCircle className="w-6 h-6" />
               </button>
            </div>
            
            <div className="p-6 space-y-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preset Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                     {["1", "7", "30", "90"].map((d) => (
                        <button
                           key={d}
                           onClick={() => setExportDays(d)}
                           className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                              exportDays === d 
                                 ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' 
                                 : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                           }`}
                        >
                           {d} Days
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Days</label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                     <input 
                        type="number" 
                        value={exportDays}
                        onChange={(e) => setExportDays(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                     />
                  </div>
               </div>

               <button 
                  onClick={handleExportCSV}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-xl transition transform active:scale-[0.98]"
               >
                  Download CSV
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
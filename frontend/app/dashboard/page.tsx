"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import LiveCards from "../../components/dashboard/LiveCards";
import TrendCharts from "../../components/dashboard/TrendCharts";
import DashboardControls from "../../components/dashboard/DashboardControls";
import { Wind, Clock, RefreshCcw, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

// Combined Reading type
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

function formatTime(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Reading[]>([]);
  // Changed default to match standard range options
  const [range, setRange] = useState<"24h" | "7d" | "30d">("24h");
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // 1. Fetch Data
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/data`);
      const json = await res.json();
      // Ensure data is sorted by timestamp (Oldest -> Newest) for charts
      const sortedData = Array.isArray(json) ? [...json].sort((a, b) => a.ts - b.ts) : [];
      setData(sortedData);
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAllData();
    let interval: any;
    if (live) {
      interval = setInterval(fetchAllData, 6000); // Poll every 6 seconds
    }
    return () => interval && clearInterval(interval);
  }, [live, fetchAllData]);

  // 2. Fix: Time-based filtering instead of array slicing
  // This ensures "24h" is actually 24 hours of data, regardless of update frequency
  const viewData = useMemo(() => {
    if (!data.length) return [];
    
    const nowSeconds = Math.floor(Date.now() / 1000);
    let secondsToSubtract = 0;

    switch (range) {
      case "24h":
        secondsToSubtract = 24 * 60 * 60;
        break;
      case "7d":
        secondsToSubtract = 7 * 24 * 60 * 60;
        break;
      case "30d": // Changed '1mo' to '30d' for clarity
        secondsToSubtract = 30 * 24 * 60 * 60;
        break;
      default:
        secondsToSubtract = 24 * 60 * 60;
    }

    const cutoffTimestamp = nowSeconds - secondsToSubtract;
    return data.filter((reading) => reading.ts >= cutoffTimestamp);
  }, [data, range]);

  const latest = data[data.length - 1];

  // 3. Calculate Stats
  const stats = useMemo(() => {
    if (!latest || !viewData.length) return null;
    const arr = viewData;
    const compute = (key: keyof Reading) => {
      const vals = arr.map((d) => d[key] as number);
      const avg = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
      const min = Math.min(...vals).toFixed(1);
      const max = Math.max(...vals).toFixed(1);
      return { avg, min, max };
    };
    return {
      pm1: compute("pm1"),
      pm25: compute("pm25"),
      pm10: compute("pm10"),
      temp: compute("temp"),
      hum: compute("hum"),
      battery: compute("battery"),
      vin: compute("vin"),
      vout: compute("vout"),
    };
  }, [viewData, latest]);

  const tooltipFormatter = (value: any, name: string) => {
    if (name.toLowerCase().includes("pm")) return [`${value} µg/m³`, name];
    if (name.toLowerCase().includes("temp")) return [`${value} °C`, name];
    if (name.toLowerCase().includes("hum")) return [`${value} %`, name];
    return [value, name];
  };

  const getLastUpdatedDisplay = () => {
    if (!latest?.ts) return "Loading...";
    const date = new Date(latest.ts * 1000);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section - Aligned */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          
          {/* Branding */}
          <div className="flex items-center gap-4">
            <div
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 shadow-lg cursor-pointer hover:scale-105 transition-transform"
              onClick={() => router.push("/")}
            >
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                Air Quality Dashboard
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                Real-time environmental monitoring
              </p>
            </div>
          </div>

          {/* Controls & Status - Aligned in one row */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            
            {/* Live Pulse */}
            <div className="flex items-center gap-2 border-r border-gray-200 pr-3 mr-1">
                <div className={`w-2.5 h-2.5 rounded-full ${live ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {live ? "Live" : "Paused"}
                </span>
            </div>

            {/* Last Updated */}
            <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Last Update</span>
                <span className="text-xs font-mono font-semibold text-gray-700">
                    {getLastUpdatedDisplay()}
                </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live Stat Cards */}
        <LiveCards latest={latest} stats={stats} />

        {/* Range Controls & Charts */}
        {/* Ensure DashboardControls accepts 'range' and 'setRange' props correctly */}
        <DashboardControls
          range={range}
          setRange={setRange}
          setData={setData}
          setLive={setLive}
          live={live}
          lastUpdated={latest?.ts ? latest.ts * 1000 : null}
        />

        <TrendCharts
          viewData={viewData}
          latest={latest}
          stats={stats}
          formatTime={formatTime}
          tooltipFormatter={tooltipFormatter}
        />
        
        <div className="py-10" />
      </div>
    </div>
  );
}
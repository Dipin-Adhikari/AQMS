"use client";
import React, { useEffect, useMemo, useState } from "react";
import LiveCards from "../../components/dashboard/LiveCards";
import TrendCharts from "../../components/dashboard/TrendCharts";
import DashboardControls from "../../components/dashboard/DashboardControls";
import { Wind, Clock, RefreshCcw } from "lucide-react";
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
  const d = new Date(ts * 1000); // Convert Unix timestamp (seconds) to ms
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Reading[]>([]);
  const [range, setRange] = useState<"1h" | "24h" | "7d">("24h");
  const [live, setLive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch AQ & health data, reverse so oldest-to-newest!
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
    fetchAllData();
    let interval: any;
    if (live) {
      interval = setInterval(fetchAllData, 6000);
    }
    return () => interval && clearInterval(interval);
  }, [live]);

  // Slice correct range (no need to reverse again)
  const viewData = useMemo(() => {
    if (!data.length) return [];
    if (range === "24h") return data.slice(-48);  // 48 records/day
    if (range === "7d") return data.slice(-336); // 7 * 48 records/day
    return data.slice(-1440); // 30 days * 48 records/day
  }, [data, range]);

  // Get actual latest entry (should be final element now!)
  const latest = data[data.length - 1];

  // Stats from the range
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

  // Tooltip formatter (unchanged)
  const tooltipFormatter = (value: any, name: string) => {
    if (name.toLowerCase().includes("pm")) return [`${value} µg/m³`, name];
    if (name.toLowerCase().includes("temp")) return [`${value} °C`, name];
    if (name.toLowerCase().includes("hum")) return [`${value} %`, name];
    if (name.toLowerCase().includes("battery")) return [`${value} V`, name];
    if (name.toLowerCase().includes("vin") || name.toLowerCase().includes("vout")) return [`${value} V`, name];
    return [value, name];
  };

  // Format last updated timestamp from 'latest'
  const getLastUpdatedDisplay = () => {
    if (!latest?.ts) return "Loading...";
    const date = new Date(latest.ts * 1000);
    return date.toLocaleString("en-US", {
      timeZone: "Asia/Kathmandu",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div
              className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-2 shadow-md"
              onClick={() => router.push("/")}
              title="Go Home"
            >
              <Wind className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Air Quality Dashboard
              </h2>
              <p className="text-sm text-gray-600">
                Real-time readings and trends
              </p>
            </div>
            {/* Live Indicator, stays in its own box */}
            <div className="ml-4 inline-flex items-center gap-2 bg-white/60 px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-700">Live</span>
            </div>
            {/* Separate Refresh Button box JUST TO THE RIGHT */}
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
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last Updated: {getLastUpdatedDisplay()}</span>
            </div>
          </div>
        </div>
        {/* Live Stat Cards */}
        <LiveCards latest={latest} stats={stats} />
        {/* Range Controls */}
        <DashboardControls
          range={range}
          setRange={setRange}
          setData={setData}
          setLive={setLive}
          live={live}
          lastUpdated={latest?.ts ? latest.ts * 1000 : null}
        />
        {/* Charts */}
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

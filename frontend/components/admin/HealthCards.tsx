import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

// Date/time formatters
function formatDateTime(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleString("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function formatTime(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function HealthCards({ latest, healthData }: any) {
  const [range, setRange] = useState<"24h" | "7d" | "1mo">("1mo");

  // Calculate range filter cutoff
  const now = Math.floor(Date.now() / 1000);
  let fromTs = 0;
  switch (range) {
    case "24h": fromTs = now - 24 * 3600; break;
    case "7d": fromTs = now - 7 * 24 * 3600; break;
    case "1mo":
    default: fromTs = 0; break;
  }

  // Filter/chart data for selected time range
  const chartData = (healthData || [])
    .filter((d: any) => d.ts >= fromTs)
    .map((d: any) => ({
      ...d,
      name: formatTime(d.ts),
      fullLabel: formatDateTime(d.ts),
      ts: d.ts, // use ts for key if needed
    }));

  const tooltipLabel = (label: string, payload: any) =>
    payload && payload[0]?.payload?.fullLabel
      ? payload[0].payload.fullLabel
      : label;

  return (
    <div>
      {/* Range toggle buttons (top-left) */}
      <div className="mb-4 flex justify-start gap-2">
        {["24h", "7d", "1mo"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as any)}
            className={`px-3 py-1 rounded font-medium ${
              range === r
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Battery Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700">Battery Level</div>
            <div className="text-3xl font-bold text-green-600 mt-1">
              {latest?.battery?.toFixed(0) ?? "--"}%
            </div>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  interval={0} 
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="battery" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={false} 
                  activeDot={{ r: 5, fill: '#10b981' }}
                />
                <Tooltip labelFormatter={tooltipLabel} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 text-center mt-2">
              Showing {chartData.length} data points
            </div>
          </div>
        </div>
        {/* Input Voltage Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700">Input Voltage</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">
              {latest?.vin?.toFixed(2) ?? "--"}V
            </div>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  interval={0}
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="vin" 
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false} 
                  activeDot={{ r: 5, fill: '#3b82f6' }}
                />
                <Tooltip labelFormatter={tooltipLabel} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 text-center mt-2">
              Showing {chartData.length} data points
            </div>
          </div>
        </div>
        {/* Output Voltage Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-700">Output Voltage</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">
              {latest?.vout?.toFixed(2) ?? "--"}V
            </div>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  interval={0} 
                  tick={{ fontSize: 10, fill: "#6B7280" }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="vout" 
                  stroke="#9333ea"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#9333ea' }}
                />
                <Tooltip labelFormatter={tooltipLabel} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-gray-500 text-center mt-2">
              Showing {chartData.length} data points
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

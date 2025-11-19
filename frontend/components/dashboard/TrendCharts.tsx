import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import ThermIcon from "./ThermIcon";

// Show full date and time for tooltip
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
// Show only hour/min for axis
function formatTime(ts: number) {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TrendCharts({ viewData, latest, stats, tooltipFormatter }: any) {
  // Pre-format data for all charts
  const chartData = viewData.map((d: any) => ({
    // Short label for X axis, full label for tooltip
    name: formatTime(d.ts),
    fullLabel: formatDateTime(d.ts),
    pm25: d.pm25, pm1: d.pm1, pm10: d.pm10,
    temp: d.temp, hum: d.hum,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PM2.5 Trend */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">PM2.5 Trend</div>
            <div className="text-xl font-bold text-gray-900">{latest ? `${latest.pm25} µg/m³` : "--"}</div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Avg {stats?.pm25?.avg ?? "--"}</div>
            <div>Max {stats?.pm25?.max ?? "--"}</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(
                  label,
                  payload
                ) =>
                  payload && payload[0]?.payload?.fullLabel
                    ? payload[0].payload.fullLabel
                    : label
                }
              />
              <Legend />
              <Line type="monotone" dataKey="pm25" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{r:6}} />
              <Line type="monotone" dataKey="pm10" stroke="#10b981" strokeWidth={1.5} dot={false}/>
              <Line type="monotone" dataKey="pm1" stroke="#06b6d4" strokeWidth={1.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Temp & Humidity */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">Temperature & Humidity</div>
            <div className="text-xl font-bold text-gray-900">{latest ? `${latest.temp} °C • ${latest.hum} %` : "--"}</div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>Avg {stats?.temp?.avg ?? "--"}</div>
            <div>Avg Hum {stats?.hum?.avg ?? "--"}</div>
          </div>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(
                  label,
                  payload
                ) =>
                  payload && payload[0]?.payload?.fullLabel
                    ? payload[0].payload.fullLabel
                    : label
                }
              />
              <Area yAxisId="left" type="monotone" dataKey="temp" stroke="#fb923c" fillOpacity={0.15} fill="#fb923c" />
              <Area yAxisId="right" type="monotone" dataKey="hum" stroke="#0ea5e9" fillOpacity={0.12} fill="#0ea5e9" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* PM1 Quick Chart */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">PM1.0 Quick</div>
            <div className="text-lg font-bold text-gray-900">{latest ? `${latest.pm1} µg/m³` : "--"}</div>
          </div>
          <div className="text-sm text-gray-500">Avg {stats?.pm1?.avg ?? "--"}</div>
        </div>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(
                  label,
                  payload
                ) =>
                  payload && payload[0]?.payload?.fullLabel
                    ? payload[0].payload.fullLabel
                    : label
                }
              />
              <Line type="monotone" dataKey="pm1" stroke="#06b6d4" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* PM10 Quick Chart */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm text-gray-500">PM10 Quick</div>
            <div className="text-lg font-bold text-gray-900">{latest ? `${latest.pm10} µg/m³` : "--"}</div>
          </div>
          <div className="text-sm text-gray-500">Avg {stats?.pm10?.avg ?? "--"}</div>
        </div>
        <div style={{ width: "100%", height: 140 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Tooltip
                formatter={tooltipFormatter}
                labelFormatter={(
                  label,
                  payload
                ) =>
                  payload && payload[0]?.payload?.fullLabel
                    ? payload[0].payload.fullLabel
                    : label
                }
              />
              <Line type="monotone" dataKey="pm10" stroke="#10b981" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

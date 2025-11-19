import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from "recharts";

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
  // Add x-axis `name` (time) and `fullLabel` (tooltip) to chart data
  const chartData = healthData?.map((d: any) => ({
    ...d,
    name: formatTime(d.ts),
    fullLabel: formatDateTime(d.ts),
  })) || [];

  const tooltipLabel = (label: string, payload: any) =>
    payload && payload[0]?.payload?.fullLabel
      ? payload[0].payload.fullLabel
      : label;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Battery Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="text-lg font-semibold">Battery</div>
        <div className="text-3xl font-bold mt-1">{latest?.battery?.toFixed(0) ?? "--"}%</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="battery" strokeWidth={2} dot={false} />
            <Tooltip labelFormatter={tooltipLabel} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Input Voltage Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="text-lg font-semibold">Input Voltage</div>
        <div className="text-3xl font-bold mt-1">{latest?.vin?.toFixed(2) ?? "--"}V</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="vin" strokeWidth={2} dot={false} />
            <Tooltip labelFormatter={tooltipLabel} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Output Voltage Card */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="text-lg font-semibold">Output Voltage</div>
        <div className="text-3xl font-bold mt-1">{latest?.vout?.toFixed(2) ?? "--"}V</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis dataKey="name" interval={0} tick={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="vout" strokeWidth={2} dot={false} />
            <Tooltip labelFormatter={tooltipLabel} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import { Zap, Battery, Activity } from "lucide-react";

// Helper to format tooltips strictly
const formatTooltipDate = (ts: number) => {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });
};

// Helper for X-Axis ticks (shorter)
const formatAxisDate = (ts: number, range: string) => {
  const date = new Date(ts * 1000);
  if (range === "24h") return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
};

export default function HealthCards({ latest, healthData }: any) {
  const [range, setRange] = useState<"24h" | "7d" | "1mo">("24h");

  // Memoize filtered data to prevent re-renders
  const chartData = useMemo(() => {
    if (!healthData || healthData.length === 0) return [];
    
    const now = Math.floor(Date.now() / 1000);
    let fromTs = 0;
    
    switch (range) {
      case "24h": fromTs = now - 24 * 3600; break;
      case "7d": fromTs = now - 7 * 24 * 3600; break;
      case "1mo": fromTs = now - 30 * 24 * 3600; break;
    }

    return healthData
      .filter((d: any) => d.ts >= fromTs)
      .map((d: any) => ({
        ...d,
        ts: d.ts, // Keep raw timestamp for X-axis math
      }));
  }, [healthData, range]);

  const Card = ({ title, value, unit, dataKey, color, icon: Icon }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div>
           <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
           <h4 className={`text-2xl font-bold ${color.text}`}>
             {value !== undefined ? value.toFixed(1) : "--"}<span className="text-sm text-gray-400 ml-1">{unit}</span>
           </h4>
        </div>
        <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
           <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div className="flex-1 p-4 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`grad${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color.hex} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color.hex} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="ts" 
              type="number" 
              domain={['dataMin', 'dataMax']} 
              tickFormatter={(ts) => formatAxisDate(ts, range)}
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              minTickGap={40} // Prevents overlap!
            />
            <YAxis 
              domain={['auto', 'auto']} 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip 
              labelFormatter={formatTooltipDate}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color.hex} 
              fillOpacity={1} 
              fill={`url(#grad${dataKey})`} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Range Filters */}
      <div className="flex items-center gap-2 bg-white p-1 w-fit rounded-lg border border-gray-200 shadow-sm">
        {["24h", "7d", "1mo"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r as any)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              range === r
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {r === "1mo" ? "30 Days" : r === "7d" ? "7 Days" : "24 Hours"}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          title="Battery Level" 
          value={latest?.battery} 
          unit="%" 
          dataKey="battery" 
          icon={Battery}
          color={{ text: "text-emerald-600", bg: "bg-emerald-100", hex: "#059669" }} 
        />
        <Card 
          title="Input Voltage" 
          value={latest?.vin} 
          unit="V" 
          dataKey="vin" 
          icon={Zap}
          color={{ text: "text-blue-600", bg: "bg-blue-100", hex: "#2563eb" }} 
        />

      </div>
    </div>
  );
}
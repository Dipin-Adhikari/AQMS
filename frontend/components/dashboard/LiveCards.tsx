import { Gauge, Activity, Wind, Bell } from "lucide-react";
import ThermIcon from "./ThermIcon";

export default function LiveCards({ latest, stats }: any) {
  const cards = [
    {
      label: "PM1.0",
      value: latest?.pm1,
      icon: <Gauge className="w-5 h-5" />,
      gradient: "from-indigo-600 to-purple-600",
      status: "Good",
      stats: stats?.pm1,
    },
    {
      label: "PM2.5",
      value: latest?.pm25,
      icon: <Activity className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-500",
      status: "Good",
      stats: stats?.pm25,
    },
    {
      label: "PM10",
      value: latest?.pm10,
      icon: <Wind className="w-5 h-5" />,
      gradient: "from-emerald-400 to-green-500",
      status: "Moderate",
      stats: stats?.pm10,
    },
    {
      label: "Temp",
      value: latest?.temp,
      icon: <ThermIcon />,
      gradient: "from-orange-400 to-red-400",
      status: "Normal",
      stats: stats?.temp,
      suffix: "°C",
      comfort: "Comfort"
    },
    {
      label: "Humidity",
      value: latest?.hum,
      icon: <Bell className="w-5 h-5" />,
      gradient: "from-indigo-500 to-cyan-500",
      status: "Normal",
      stats: stats?.hum,
      suffix: "%",
      comfort: "Comfort"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow`}>
                {card.icon}
              </div>
              <div>
                <div className="text-xs text-gray-500">{card.label}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {card.value !== undefined ? `${card.value}${card.suffix ? ` ${card.suffix}` : " µg/m³"}` : "--"}
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-xs text-gray-500">{card.comfort || "Status"}</div>
              <div className={`text-sm font-semibold ${card.status === "Moderate" ? "text-amber-600" : "text-indigo-600"}`}>{card.status}</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Avg {card.stats?.avg ?? "--"} • min {card.stats?.min ?? "--"} • max {card.stats?.max ?? "--"}
          </div>
        </div>
      ))}
    </div>
  );
}

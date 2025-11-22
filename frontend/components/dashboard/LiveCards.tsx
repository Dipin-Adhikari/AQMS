import { Gauge, Activity, Wind, Bell } from "lucide-react";
import ThermIcon from "./ThermIcon";

function getAQIStatus(value: number, type: "pm1" | "pm25" | "pm10") {
  if (value === undefined || value === null) return "—";

  if (type === "pm25") {
    if (value <= 12) return "Good";
    if (value <= 35.4) return "Moderate";
    if (value <= 55.4) return "Unhealthy (SG)";
    if (value <= 150.4) return "Unhealthy";
    if (value <= 250.4) return "Very Unhealthy";
    return "Hazardous";
  }

  if (type === "pm10") {
    if (value <= 54) return "Good";
    if (value <= 154) return "Moderate";
    if (value <= 254) return "Unhealthy (SG)";
    if (value <= 354) return "Unhealthy";
    if (value <= 424) return "Very Unhealthy";
    return "Hazardous";
  }

  // PM1 (unofficial thresholds)
  if (type === "pm1") {
    if (value <= 12) return "Good";
    if (value <= 35) return "Moderate";
    if (value <= 55) return "Unhealthy (SG)";
    if (value <= 150) return "Unhealthy";
    return "Hazardous";
  }

  return "—";
}

function formatValue(val: any) {
  if (val === undefined || val === null) return "--";
  return Number(val).toFixed(2);
}

export default function LiveCards({ latest, stats }: any) {
  const cards = [
    {
      label: "PM1.0",
      value: latest?.pm1,
      icon: <Gauge className="w-5 h-5" />,
      gradient: "from-indigo-600 to-purple-600",
      status: getAQIStatus(latest?.pm1, "pm1"),
      stats: stats?.pm1,
    },
    {
      label: "PM2.5",
      value: latest?.pm25,
      icon: <Activity className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-500",
      status: getAQIStatus(latest?.pm25, "pm25"),
      stats: stats?.pm25,
    },
    {
      label: "PM10",
      value: latest?.pm10,
      icon: <Wind className="w-5 h-5" />,
      gradient: "from-emerald-400 to-green-500",
      status: getAQIStatus(latest?.pm10, "pm10"),
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
      comfort: "Comfort",
    },
    {
      label: "Humidity",
      value: latest?.hum,
      icon: <Bell className="w-5 h-5" />,
      gradient: "from-indigo-500 to-cyan-500",
      status: "Normal",
      stats: stats?.hum,
      suffix: "%",
      comfort: "Comfort",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow`}
              >
                {card.icon}
              </div>
              <div>
                <div className="text-xs text-gray-500">{card.label}</div>

                {/* Rounded to 2 digits */}
                <div className="text-2xl font-bold text-gray-900">
                  {card.value !== undefined
                    ? `${formatValue(card.value)}${
                        card.suffix ? ` ${card.suffix}` : " µg/m³"
                      }`
                    : "--"}
                </div>
              </div>
            </div>

            <div className="text-right text-sm">
              <div className="text-xs text-gray-500">
                {card.comfort || "Status"}
              </div>

              <div
                className={`text-sm font-semibold ${
                  card.status.includes("Moderate")
                    ? "text-amber-600"
                    : card.status.includes("Unhealthy")
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {card.status}
              </div>
            </div>
          </div>

          {/* Stats section also 2 decimal places */}
          <div className="mt-3 text-xs text-gray-500">
            Avg {formatValue(card.stats?.avg)} • min {formatValue(card.stats?.min)} • max{" "}
            {formatValue(card.stats?.max)}
          </div>
        </div>
      ))}
    </div>
  );
}

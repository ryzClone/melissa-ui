import { useMemo, useState } from "react";
import "./RevenueChart.css";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const chartData = {
  daily: {
    subtitle: "Bugungi ko‘rsatkichlar",
    data: [
      { day: "00:00", value: 8 },
      { day: "04:00", value: 15 },
      { day: "08:00", value: 28 },
      { day: "12:00", value: 52 },
      { day: "16:00", value: 38 },
      { day: "20:00", value: 64 },
      { day: "23:00", value: 42 },
    ],
  },
  weekly: {
    subtitle: "Oxirgi 7 kunlik ko‘rsatkichlar",
    data: [
      { day: "DUSH", value: 12 },
      { day: "SESH", value: 35 },
      { day: "CHOR", value: 61 },
      { day: "PAY", value: 24 },
      { day: "JUM", value: 78 },
      { day: "SHAN", value: 16 },
      { day: "YAK", value: 46 },
    ],
  },
  monthly: {
    subtitle: "Oxirgi 30 kunlik ko‘rsatkichlar",
    data: [
      { day: "1-hafta", value: 48 },
      { day: "2-hafta", value: 72 },
      { day: "3-hafta", value: 39 },
      { day: "4-hafta", value: 86 },
    ],
  },
};

export default function RevenueChart() {
  const [range, setRange] = useState("weekly");

  const currentChart = useMemo(() => chartData[range], [range]);

  return (
    <div className="sales-chart-card">
      <div className="sales-chart-header">
        <div>
          <h3>Savdo statistikasi</h3>
          <p>{currentChart.subtitle}</p>
        </div>

        <div className="sales-chart-switch">
          <button
            className={range === "daily" ? "active" : ""}
            onClick={() => setRange("daily")}
            type="button"
          >
            Kunlik
          </button>

          <button
            className={range === "weekly" ? "active" : ""}
            onClick={() => setRange("weekly")}
            type="button"
          >
            Haftalik
          </button>

          <button
            className={range === "monthly" ? "active" : ""}
            onClick={() => setRange("monthly")}
            type="button"
          >
            Oylik
          </button>
        </div>
      </div>

      <div className="sales-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentChart.data}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9b6bff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#9b6bff" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              tick={{ fill: "rgba(255,255,255,0.38)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "#1b1225",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8f63ff"
              strokeWidth={6}
              fill="url(#salesFill)"
              dot={false}
              activeDot={{
                r: 10,
                fill: "#8f63ff",
                stroke: "rgba(143,99,255,0.25)",
                strokeWidth: 10,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
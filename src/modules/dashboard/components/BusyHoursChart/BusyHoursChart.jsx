import "./BusyHoursChart.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function BusyHoursChart() {
  const data = [
    { time: "9:00", value: 48 },
    { time: "12:00", value: 42 },
    { time: "13:00", value: 38 },
    { time: "18:00", value: 65 },
    { time: "19:00", value: 39 },
    { time: "20:00", value: 63 },
    { time: "21:00", value: 47 },
  ];

  return (
    <div className="dashboard-busy-card">
      <div className="dashboard-busy-header">
        <h3>Eng bandlik soatlari</h3>
        <p>Buyurtmalar soni bo‘yicha</p>
      </div>

      <div className="dashboard-busy-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.15)"
              vertical={true}
            />

            <XAxis
              dataKey="time"
              stroke="#E5E7EB"
              tick={{ fill: "#E5E7EB", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#E5E7EB"
              tick={{ fill: "#E5E7EB", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Bar
              dataKey="value"
              fill="#7C83FD"
              radius={[6, 6, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

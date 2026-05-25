import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine} from "recharts";
import { format } from "date-fns";

const COLORS = {
  temperature: "#2d9960",
  humidity:    "#3b82f6",
  weight:      "#8b5cf6",
};

const UNITS = {
  temperature: "°C",
  humidity:    "%",
  weight:      "g",
};

function CustomTooltip({ active, payload, label, type }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-card px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-gray-800">
        {payload[0]?.value?.toFixed(1)}{UNITS[type]}
      </p>
    </div>
  );
}

export default function SensorChart({ data = [], type = "temperature", targetLine }) {
  const color = COLORS[type];
  const unit  = UNITS[type];

  const formatted = data.map((d) => ({
    ...d,
    time: format(new Date(d.x), "HH:mm"),
    value: d.y,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}${unit}`}
        />
        <Tooltip content={<CustomTooltip type={type} />} />
        {targetLine && (
          <ReferenceLine y={targetLine} stroke={color} strokeDasharray="4 4" strokeOpacity={0.5} />
        )}
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function VitalHistoryChart({ vitals = [] }) {
  const points = [...vitals]
    .filter((v) => v.type === "heart_rate" || v.type === "spo2")
    .slice(0, 24)
    .reverse()
    .map((v) => ({
      time: new Date(v.created_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      heart_rate: v.type === "heart_rate" ? v.value : null,
      spo2: v.type === "spo2" ? v.value : null,
    }));

  if (points.length === 0) {
    return (
      <div className="h-48 grid place-items-center text-sm text-white/40">
        No heart rate or SpO2 readings yet. Log one below.
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#737373", fontSize: 10 }} stroke="#333" />
          <YAxis tick={{ fill: "#737373", fontSize: 10 }} stroke="#333" />
          <Tooltip contentStyle={{ background: "#171717", border: "1px solid #333", borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls name="Heart rate" />
          <Line type="monotone" dataKey="spo2" stroke="#418E66" strokeWidth={2} dot={false} connectNulls name="SpO2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function StatCard({ icon: Icon, label, value, unit, color = "green", sub }) {
  const colors = {
    green:  { bg: "bg-green-100",  icon: "text-green-600",  accent: "bg-green-600" },
    blue:   { bg: "bg-blue-100",   icon: "text-blue-600",   accent: "bg-blue-600" },
    orange: { bg: "bg-orange-100", icon: "text-orange-600", accent: "bg-orange-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600", accent: "bg-purple-600" },
  };
  const c = colors[color] || colors.green;

  return (
    <div className="stat-card card-hover animate-slide-up">
      <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={c.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            {value ?? <span className="text-gray-300 text-lg">—</span>}
          </span>
          {unit && <span className="text-sm text-gray-400 font-medium">{unit}</span>}
        </div>
        {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

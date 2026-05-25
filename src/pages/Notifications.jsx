import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, Zap, Thermometer, Droplets } from "lucide-react";
import { getAlerts, markAlertRead, markAllRead, clearAlerts } from "../utils/api";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow, format } from "date-fns";

const ALERT_ICONS = {
  DRYING_COMPLETE:    { icon: CheckCheck, color: "bg-blue-100 text-blue-600" },
  HIGH_TEMPERATURE:   { icon: Thermometer, color: "bg-red-100 text-red-600" },
  LOW_HUMIDITY:       { icon: Droplets, color: "bg-yellow-100 text-yellow-600" },
  HIGH_HUMIDITY:      { icon: Droplets, color: "bg-orange-100 text-orange-600" },
  DRYER_STARTED:      { icon: Zap, color: "bg-green-100 text-green-600" },
  DRYER_STOPPED:      { icon: Zap, color: "bg-gray-100 text-gray-500" },
  BATCH_STARTED:      { icon: Info, color: "bg-green-100 text-green-600" },
  TARGET_TEMP_REACHED:{ icon: Thermometer, color: "bg-green-100 text-green-600" },
  SENSOR_ERROR:       { icon: AlertTriangle, color: "bg-red-100 text-red-600" },
};

const SEVERITY_BADGE = {
  info:     "bg-blue-100 text-blue-600",
  warning:  "bg-yellow-100 text-yellow-700",
  critical: "bg-red-100 text-red-600",
};

export default function Notifications() {
  const [alerts, setAlerts]         = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const { latestAlert }             = useSocket();

  const fetchAlerts = async () => {
    try {
      const params = filter === "unread" ? { unreadOnly: true, limit: 100 } : { limit: 100 };
      const res = await getAlerts(params);
      setAlerts(res.data.data);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [filter, latestAlert]);

  const handleMarkRead = async (id) => {
    await markAlertRead(id);
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    setUnreadCount(0);
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all alerts?")) return;
    await clearAlerts();
    setAlerts([]);
    setUnreadCount(0);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1">
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f ? "bg-green-600 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f} {f === "unread" && unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-secondary text-sm flex items-center gap-1.5">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {alerts.length > 0 && (
            <button onClick={handleClear} className="btn-danger text-sm flex items-center gap-1.5">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No alerts</p>
            <p className="text-sm">Alerts will appear here as your dryer operates</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alerts.map((alert) => {
              const cfg = ALERT_ICONS[alert.type] || { icon: Info, color: "bg-gray-100 text-gray-500" };
              const Icon = cfg.icon;

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${
                    !alert.read ? "bg-green-50/40" : "hover:bg-gray-50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.color}`}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SEVERITY_BADGE[alert.severity] || SEVERITY_BADGE.info}`}>
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">{alert.type.replace(/_/g, " ")}</span>
                      {!alert.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-medium leading-snug">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                      {" · "}
                      {format(new Date(alert.createdAt), "HH:mm:ss")}
                    </p>
                  </div>

                  {!alert.read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="text-xs text-green-600 hover:text-green-700 font-medium flex-shrink-0 mt-1"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

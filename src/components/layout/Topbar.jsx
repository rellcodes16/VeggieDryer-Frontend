import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { getAlerts } from "../../utils/api";
import { useSocket } from "../../context/SocketContext";
import { format } from "date-fns";

const pageTitles = {
  "/":               { title: "Dashboard",      sub: "Live overview of your dryer" },
  "/control":        { title: "Control Panel",  sub: "Manage dryer settings & operation" },
  "/batches":        { title: "Batches",        sub: "All drying sessions" },
  "/notifications":  { title: "Notifications",  sub: "Alerts & system events" },
  "/settings":       { title: "Settings",       sub: "Configure thresholds & preferences" },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { latestAlert } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);
  const page = pageTitles[pathname] || { title: "VeggieDryer", sub: "" };

  useEffect(() => {
    getAlerts({ unreadOnly: true, limit: 1 })
      .then((r) => setUnreadCount(r.data.unreadCount || 0))
      .catch(() => {});
  }, [latestAlert]);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 leading-tight">{page.title}</h2>
        <p className="text-xs text-gray-400">{page.sub}</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-400">{format(new Date(), "EEE, MMM d yyyy")}</span>

        <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-green-50 transition-colors">
          <Bell size={20} className="text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">
          VD
        </div>
      </div>
    </header>
  );
}

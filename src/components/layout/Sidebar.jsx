// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {LayoutDashboard, Thermometer, Package, Bell, Settings, Leaf, Wifi, WifiOff,} from "lucide-react";
import { useSocket } from "../../context/SocketContext";

const navItems = [
  { to: "/",            icon: LayoutDashboard, label: "Dashboard" },
  { to: "/control",     icon: Thermometer,     label: "Control Panel" },
  { to: "/batches",     icon: Package,         label: "Batches" },
  { to: "/notifications", icon: Bell,          label: "Notifications" },
  { to: "/settings",    icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const { connected } = useSocket();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-glow">
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg text-gray-900 leading-tight">VeggieDryer</h1>
            <p className="text-xs text-gray-400 font-medium">Smart Drying System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-green-600 text-white shadow-glow"
                  : "text-gray-500 hover:bg-green-50 hover:text-green-700"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Connection status */}
      <div className="px-6 py-5 border-t border-gray-100">
        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium ${
          connected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-500"
        }`}>
          {connected
            ? <><Wifi size={14} /><span>Live — Connected</span><span className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" /></>
            : <><WifiOff size={14} /><span>Disconnected</span></>
          }
        </div>
      </div>
    </aside>
  );
}

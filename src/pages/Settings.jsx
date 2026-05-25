import { useEffect, useState } from "react";
import { Thermometer, Clock, AlertTriangle, Save, CheckCircle } from "lucide-react";
import { getDryerStatus, updateSettings } from "../utils/api";

export default function Settings() {
  const [form, setForm]     = useState({ targetTemperature: 55, dryingTimeMinutes: 120 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    getDryerStatus().then((r) => {
      const d = r.data.data;
      setForm({ targetTemperature: d.targetTemperature, dryingTimeMinutes: d.dryingTimeMinutes });
    }).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ targetTemperature: parseFloat(form.targetTemperature), dryingTimeMinutes: parseInt(form.dryingTimeMinutes) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">

      {saved && (
        <div className="bg-green-600 text-white rounded-xl px-5 py-3 flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} /> Settings saved successfully
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Thermometer size={18} className="text-green-600" /> Drying Configuration
        </h3>
        <p className="text-sm text-gray-400 mb-5">Default settings applied to each new batch</p>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Target Temperature
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="20" max="90" step="1"
                value={form.targetTemperature}
                onChange={(e) => set("targetTemperature", e.target.value)}
                className="flex-1 accent-green-600"
              />
              <div className="w-20">
                <input
                  type="number" min="20" max="90"
                  value={form.targetTemperature}
                  onChange={(e) => set("targetTemperature", e.target.value)}
                  className="input text-center font-bold text-green-600"
                />
              </div>
              <span className="text-sm text-gray-500 w-5">°C</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>20°C min</span>
              <span>90°C max</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Default Drying Time
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="30" max="1440" step="30"
                value={form.dryingTimeMinutes}
                onChange={(e) => set("dryingTimeMinutes", e.target.value)}
                className="flex-1 accent-green-600"
              />
              <div className="w-20">
                <input
                  type="number" min="1" max="2880"
                  value={form.dryingTimeMinutes}
                  onChange={(e) => set("dryingTimeMinutes", e.target.value)}
                  className="input text-center font-bold text-green-600"
                />
              </div>
              <span className="text-sm text-gray-500 w-5">min</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>30 min</span>
              <span>{Math.round(form.dryingTimeMinutes / 60 * 10) / 10} hours</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" /> Alert Thresholds
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          These are configured in your backend <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> file
        </p>
        <div className="space-y-3">
          {[
            { label: "Max Temperature Alert", key: "MAX_TEMPERATURE",  value: "75°C",  color: "text-red-500" },
            { label: "Min Humidity Alert",    key: "MIN_HUMIDITY",     value: "10%",   color: "text-yellow-600" },
            { label: "Max Humidity Alert",    key: "MAX_HUMIDITY",     value: "95%",   color: "text-orange-500" },
          ].map(({ label, key, value, color }) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 font-mono">{key}</p>
              </div>
              <span className={`text-sm font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 bg-gray-50 rounded-xl p-3">
          To change alert thresholds, edit your <code>.env</code> file and restart the server.
        </p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">About</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: "System",   value: "VeggieDryer v1.0.0" },
            { label: "Hardware", value: "ESP32 + DHT22 + HX711" },
            { label: "Backend",  value: "Node.js + Express + Socket.IO" },
            { label: "Frontend", value: "React + Tailwind CSS" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-700">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3"
      >
        {saving ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
        ) : (
          <><Save size={16} /> Save Settings</>
        )}
      </button>
    </div>
  );
}

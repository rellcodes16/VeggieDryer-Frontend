import { useEffect, useState } from "react";
import { Power, Thermometer, Clock, Scale, Leaf, StopCircle, CheckCircle, AlertTriangle } from "lucide-react";
import Toggle from "../components/ui/Toggle";
import { useSocket } from "../context/SocketContext";
import {
  getDryerStatus, turnDryerOn, turnDryerOff, updateSettings,
  startBatch, completeBatch, abortBatch, getActiveBatch,
} from "../utils/api";
import { formatDistanceToNow } from "date-fns";

export default function ControlPanel() {
  const { dryerStatus: socketStatus, sensorData } = useSocket();
  const [status, setStatus]         = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);

  const [targetTemp, setTargetTemp]     = useState(55);
  const [dryingTime, setDryingTime]     = useState(120);

  const [vegName, setVegName]           = useState("");
  const [initialWeight, setInitialWeight] = useState("");
  const [batchNotes, setBatchNotes]     = useState("");

  const [finalWeight, setFinalWeight]   = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

const fetchStatus = async () => {
  try {
    const [statusRes, batchRes] = await Promise.all([getDryerStatus(), getActiveBatch()]);
    setStatus(statusRes.data.data);
    setIsDryerOn(statusRes.data.data.dryerOn); 
    setActiveBatch(batchRes.data.data);
    setTargetTemp(statusRes.data.data.targetTemperature);
    setDryingTime(statusRes.data.data.dryingTimeMinutes);
  } catch (e) {
    showToast("Failed to load status", "error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchStatus(); }, []);

  const [isDryerOn, setIsDryerOn] = useState(false);
  const isDrying   = activeBatch !== null;
  const live       = sensorData || status?.latestSensor;
  const elapsed    = activeBatch ? Math.round((Date.now() - new Date(activeBatch.startTime)) / 60000) : 0;

const handleToggleDryer = async () => {
  const newState = !isDryerOn;
  setIsDryerOn(newState);
  try {
    if (newState) {
      await turnDryerOn();
      showToast("Dryer turned on");
    } else {
      await turnDryerOff();
      showToast("Dryer turned off");
    }
    fetchStatus();
  } catch {
    setIsDryerOn(!newState);
    showToast("Failed to toggle dryer", "error");
  }
};

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings({ targetTemperature: parseFloat(targetTemp), dryingTimeMinutes: parseInt(dryingTime) });
      showToast("Settings saved ✓");
      fetchStatus();
    } catch { showToast("Failed to save settings", "error"); }
    setSaving(false);
  };

  const handleStartBatch = async () => {
    if (!vegName || !initialWeight) return showToast("Please fill all required fields", "error");
    try {
      await startBatch({ vegetableName: vegName, initialWeight: parseFloat(initialWeight), notes: batchNotes, targetTemperature: parseFloat(targetTemp), dryingTimeMinutes: parseInt(dryingTime) });
      showToast(`Batch started for ${vegName} 🌿`);
      setVegName(""); setInitialWeight(""); setBatchNotes("");
      fetchStatus();
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to start batch", "error");
    }
  };

  const handleCompleteBatch = async () => {
    if (!finalWeight) return showToast("Enter final weight", "error");
    try {
      await completeBatch(activeBatch.id, { finalWeight: parseFloat(finalWeight) });
      showToast("Batch completed! 🎉");
      setFinalWeight("");
      fetchStatus();
    } catch { showToast("Failed to complete batch", "error"); }
  };

  const handleAbortBatch = async () => {
    if (!window.confirm("Abort this drying session?")) return;
    try {
      await abortBatch(activeBatch.id);
      showToast("Batch aborted", "error");
      fetchStatus();
    } catch { showToast("Failed to abort batch", "error"); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-card-hover text-sm font-medium flex items-center gap-2 animate-slide-up ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-600 text-white"
        }`}>
          {toast.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDryerOn ? "bg-green-100" : "bg-gray-100"}`}>
                  <Power size={26} className={isDryerOn ? "text-green-600" : "text-gray-400"} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dryer Power</h3>
                  <p className="text-sm text-gray-400">
                    {isDryerOn ? "Heating element is active" : "Dryer is off"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-semibold ${isDryerOn ? "text-green-600" : "text-gray-400"}`}>
                  {isDryerOn ? "ON" : "OFF"}
                </span>
                <Toggle checked={isDryerOn} onChange={handleToggleDryer} />
              </div>
            </div>

            {live && (
              <div className="mt-5 grid grid-cols-3 gap-3 pt-5 border-t border-gray-50">
                {[
                  { label: "Temperature", value: live.temperature?.toFixed(1), unit: "°C", color: "text-orange-500" },
                  { label: "Humidity",    value: live.humidity?.toFixed(1),    unit: "%",  color: "text-blue-500" },
                  { label: "Weight",      value: live.weight?.toFixed(1),      unit: "g",  color: "text-purple-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color} tabular-nums`}>
                      {s.value ?? "—"}<span className="text-sm font-medium text-gray-400 ml-0.5">{s.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <Thermometer size={18} className="text-green-600" /> Drying Settings
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Target Temperature (°C)</label>
                <input
                  type="number" min="20" max="90"
                  value={targetTemp}
                  onChange={(e) => setTargetTemp(e.target.value)}
                  className="input"
                  placeholder="e.g. 55"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Drying Time (minutes)</label>
                <input
                  type="number" min="1" max="2880"
                  value={dryingTime}
                  onChange={(e) => setDryingTime(e.target.value)}
                  className="input"
                  placeholder="e.g. 120"
                />
              </div>
            </div>
            <button onClick={handleSaveSettings} disabled={saving} className="btn-primary w-full">
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {!isDrying && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <Leaf size={18} className="text-green-600" /> Start New Batch
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Vegetable Name *</label>
                    <input
                      type="text"
                      value={vegName}
                      onChange={(e) => setVegName(e.target.value)}
                      className="input"
                      placeholder="e.g. Tomatoes"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Initial Weight (g) *</label>
                    <input
                      type="number"
                      value={initialWeight}
                      onChange={(e) => setInitialWeight(e.target.value)}
                      className="input"
                      placeholder="e.g. 850"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    className="input"
                    placeholder="e.g. Sliced 5mm thin"
                  />
                </div>
                <button onClick={handleStartBatch} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Leaf size={16} /> Start Drying Batch
                </button>
              </div>
            </div>
          )}

          {isDrying && (
            <div className="card border-2 border-green-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <h3 className="font-semibold text-gray-900">Active Batch — #{activeBatch.batchNumber}</h3>
                <span className="badge-drying ml-auto">Drying</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Vegetable",  value: activeBatch.vegetableName },
                  { label: "Start Weight", value: `${activeBatch.initialWeight}g` },
                  { label: "Elapsed",    value: `${elapsed} min` },
                ].map((s) => (
                  <div key={s.label} className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Final Weight (g)</label>
                <input
                  type="number"
                  value={finalWeight}
                  onChange={(e) => setFinalWeight(e.target.value)}
                  className="input"
                  placeholder="Weigh the dried vegetables"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCompleteBatch} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Complete Batch
                </button>
                <button onClick={handleAbortBatch} className="btn-danger flex items-center justify-center gap-2 px-4">
                  <StopCircle size={16} /> Abort
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="card">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Current Settings</h4>
            <div className="space-y-3">
              {[
                { label: "Target Temperature", value: `${status?.targetTemperature ?? 55}°C`, icon: Thermometer },
                { label: "Drying Time",         value: `${status?.dryingTimeMinutes ?? 120} min`, icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Icon size={14} className="text-green-500" />
                    {label}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {activeBatch && (
            <div className="card bg-green-600 text-white">
              <h4 className="text-sm font-semibold text-green-100 mb-3">Active Batch</h4>
              <p className="text-2xl font-bold mb-1">{activeBatch.vegetableName}</p>
              <p className="text-green-200 text-sm">
                Started {formatDistanceToNow(new Date(activeBatch.startTime), { addSuffix: true })}
              </p>
              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-green-200 text-xs">Initial Weight</p>
                  <p className="font-bold">{activeBatch.initialWeight}g</p>
                </div>
                <div>
                  <p className="text-green-200 text-xs">Target Temp</p>
                  <p className="font-bold">{activeBatch.targetTemperature}°C</p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Guide</h4>
            <div className="space-y-2.5 text-xs text-gray-500">
              {[
                "Set your target temperature & time",
                "Enter vegetable name & initial weight",
                "Click Start Batch to begin",
                "Monitor live data on Dashboard",
                "Enter final weight to complete batch",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

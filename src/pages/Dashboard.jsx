import { useEffect, useState, useCallback } from "react";
import { Thermometer, Droplets, Weight, Activity, Clock, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import SensorChart from "../components/charts/SensorChart";
import { useSocket } from "../context/SocketContext";
import { getDryerStatus, getSensorHistory, getActiveBatch } from "../utils/api";
import { format, formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { sensorData, dryerStatus } = useSocket();
  const [status, setStatus]         = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [charts, setCharts]         = useState({ temperature: [], humidity: [], weight: [] });
  const [loading, setLoading]       = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statusRes, batchRes] = await Promise.all([
        getDryerStatus(),
        getActiveBatch(),
      ]);
      setStatus(statusRes.data.data);
      setActiveBatch(batchRes.data.data);

      const batchId = batchRes.data.data?.id;
      const params  = batchId ? { batchId, limit: 100 } : { limit: 100 };
      const histRes = await getSensorHistory(params);
      setCharts(histRes.data.data || { temperature: [], humidity: [], weight: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const live = sensorData || status?.latestSensor;
  const batch = activeBatch || status?.activeBatch;
  const isDrying = dryerStatus?.dryingStatus === "drying" || batch;

  const elapsed = batch
    ? Math.round((Date.now() - new Date(batch.startTime)) / 60000)
    : 0;
  const remaining = batch
    ? Math.max(0, (batch.dryingTimeMinutes || 0) - elapsed)
    : 0;
  const progress = batch
    ? Math.min(100, (elapsed / (batch.dryingTimeMinutes || 1)) * 100)
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {batch && (
        <div className="bg-green-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-glow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{batch.vegetableName}</span>
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Batch #{batch.batchNumber}
                </span>
              </div>
              <p className="text-green-100 text-sm">
                Started {formatDistanceToNow(new Date(batch.startTime), { addSuffix: true })}
                {" · "}Target: {batch.targetTemperature}°C
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums">{remaining}<span className="text-lg font-medium text-green-200">m</span></p>
            <p className="text-green-200 text-xs">remaining</p>
          </div>
        </div>
      )}
      {!batch && (
        <div className="bg-white rounded-2xl p-5 border border-dashed border-gray-200 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-700">No active drying session</p>
            <p className="text-sm text-gray-400">Start a batch to begin monitoring</p>
          </div>
          <Link to="/control" className="btn-primary text-sm">
            Start Batch
          </Link>
        </div>
      )}
      {batch && (
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">Drying Progress</span>
            <span className="text-sm font-bold text-green-600">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{elapsed} min elapsed</span>
            <span>{batch.dryingTimeMinutes} min total</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Status"
          value={isDrying ? "Drying" : "Idle"}
          color={isDrying ? "green" : "blue"}
          sub={isDrying ? `Batch #${batch?.batchNumber}` : "No active batch"}
        />
        <StatCard
          icon={Thermometer}
          label="Temperature"
          value={live?.temperature?.toFixed(1) ?? "—"}
          unit="°C"
          color="orange"
          sub={`Target: ${status?.targetTemperature ?? 55}°C`}
        />
        <StatCard
          icon={Droplets}
          label="Humidity"
          value={live?.humidity?.toFixed(1) ?? "—"}
          unit="%"
          color="blue"
          sub="Relative humidity"
        />
        <StatCard
          icon={Weight}
          label="Weight"
          value={live?.weight?.toFixed(1) ?? "—"}
          unit="g"
          color="purple"
          sub={batch ? `Initial: ${batch.initialWeight}g` : "Load cell"}
        />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Temperature</h3>
              <p className="text-xs text-gray-400">vs Time</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
              {live?.temperature?.toFixed(1) ?? "—"}°C
            </span>
          </div>
          <SensorChart data={charts.temperature} type="temperature" targetLine={status?.targetTemperature} />
        </div>
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Humidity</h3>
              <p className="text-xs text-gray-400">vs Time</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              {live?.humidity?.toFixed(1) ?? "—"}%
            </span>
          </div>
          <SensorChart data={charts.humidity} type="humidity" />
        </div>
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Weight</h3>
              <p className="text-xs text-gray-400">vs Time</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">
              {live?.weight?.toFixed(1) ?? "—"}g
            </span>
          </div>
          <SensorChart data={charts.weight} type="weight" />
        </div>
      </div>
      {live?.timestamp && (
        <p className="text-xs text-gray-400 text-center">
          Last updated: {format(new Date(live.timestamp), "HH:mm:ss")}
        </p>
      )}
    </div>
  );
}

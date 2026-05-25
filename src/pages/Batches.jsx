import { useEffect, useState } from "react";
import { Package, TrendingDown, Clock, ChevronRight, Leaf, X } from "lucide-react";
import { getAllBatches, getBatchById, getSensorHistory } from "../utils/api";
import SensorChart from "../components/charts/SensorChart";
import { format, formatDistanceToNow } from "date-fns";

function StatusBadge({ status }) {
  const map = {
    drying:   <span className="badge-drying"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Drying</span>,
    complete: <span className="badge-complete">Complete</span>,
    aborted:  <span className="badge-aborted">Aborted</span>,
  };
  return map[status] || <span className="badge-idle">{status}</span>;
}

function BatchModal({ batch, onClose }) {
  const [charts, setCharts] = useState({ temperature: [], humidity: [], weight: [] });

  useEffect(() => {
    getSensorHistory({ batchId: batch.id, limit: 200 })
      .then((r) => setCharts(r.data.data || { temperature: [], humidity: [], weight: [] }))
      .catch(() => {});
  }, [batch.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-card-hover w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Batch #{batch.batchNumber} — {batch.vegetableName}
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {format(new Date(batch.startTime), "MMM d, yyyy · HH:mm")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={batch.status} />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Initial Weight", value: `${batch.initialWeight}g` },
              { label: "Final Weight",   value: batch.finalWeight ? `${batch.finalWeight}g` : "—" },
              { label: "Weight Loss",    value: batch.weightLossPercent ? `${batch.weightLossPercent}%` : "—" },
              { label: "Duration",       value: batch.durationMinutes ? `${batch.durationMinutes} min` : "—" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className="text-xl font-bold text-gray-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Sensor Graphs</h4>
            <div className="space-y-4">
              {["temperature", "humidity", "weight"].map((type) => (
                <div key={type} className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-3 capitalize">{type} vs Time</p>
                  <SensorChart data={charts[type]} type={type} targetLine={type === "temperature" ? batch.targetTemperature : undefined} />
                </div>
              ))}
            </div>
          </div>

          {batch.notes && (
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-green-700 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{batch.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected]     = useState(null);

  const fetchBatches = async (p = 1) => {
    try {
      const res = await getAllBatches({ page: p, limit: 10 });
      setBatches(res.data.data);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  const openBatch = async (id) => {
    const res = await getBatchById(id);
    setSelected(res.data.data);
  };

  useEffect(() => { fetchBatches(page); }, [page]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {selected && <BatchModal batch={selected} onClose={() => setSelected(null)} />}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Batches",    value: pagination.total ?? batches.length, icon: Package,      color: "bg-green-100 text-green-600" },
          { label: "Completed",        value: batches.filter(b => b.status === "complete").length, icon: TrendingDown, color: "bg-blue-100 text-blue-600" },
          { label: "Currently Drying", value: batches.filter(b => b.status === "drying").length,   icon: Leaf,         color: "bg-orange-100 text-orange-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Batch list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">All Batches</h3>
        </div>

        {batches.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No batches yet</p>
            <p className="text-sm">Start your first drying session from the Control Panel</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {batches.map((batch) => {
              const elapsed = batch.durationMinutes
                ? `${batch.durationMinutes} min`
                : batch.status === "drying"
                ? `${Math.round((Date.now() - new Date(batch.startTime)) / 60000)} min`
                : "—";

              return (
                <button
                  key={batch.id}
                  onClick={() => openBatch(batch.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 text-sm font-bold">#{batch.batchNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm truncate">{batch.vegetableName}</p>
                      <StatusBadge status={batch.status} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {format(new Date(batch.startTime), "MMM d, yyyy · HH:mm")}
                      {batch.status !== "drying" && ` · ${elapsed}`}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm text-right flex-shrink-0">
                    <div>
                      <p className="text-xs text-gray-400">Initial</p>
                      <p className="font-semibold text-gray-700">{batch.initialWeight}g</p>
                    </div>
                    {batch.finalWeight && (
                      <div>
                        <p className="text-xs text-gray-400">Final</p>
                        <p className="font-semibold text-gray-700">{batch.finalWeight}g</p>
                      </div>
                    )}
                    {batch.weightLossPercent && (
                      <div>
                        <p className="text-xs text-gray-400">Loss</p>
                        <p className="font-semibold text-green-600">{batch.weightLossPercent}%</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

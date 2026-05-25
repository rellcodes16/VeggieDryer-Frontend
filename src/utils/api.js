import axios from "axios";

const api = axios.create({
  baseURL: `https://veggiedryer-backend.onrender.com/api`,
  timeout: 10000,
});

export default api;

export const getDryerStatus  = () => api.get("/dryer/status");
export const turnDryerOn     = () => api.post("/dryer/on");
export const turnDryerOff    = () => api.post("/dryer/off");
export const updateSettings  = (data) => api.put("/dryer/settings", data);

export const getLatestReading  = () => api.get("/sensor/latest");
export const getSensorHistory  = (params) => api.get("/sensor/history", { params });

export const getAllBatches   = (params) => api.get("/batches", { params });
export const getBatchById    = (id) => api.get(`/batches/${id}`);
export const getActiveBatch  = () => api.get("/batches/active");
export const startBatch      = (data) => api.post("/batches/start", data);
export const completeBatch   = (id, data) => api.patch(`/batches/${id}/complete`, data);
export const abortBatch      = (id) => api.patch(`/batches/${id}/abort`);

export const getAlerts        = (params) => api.get("/alerts", { params });
export const markAlertRead    = (id) => api.patch(`/alerts/${id}/read`);
export const markAllRead      = () => api.patch("/alerts/read-all");
export const clearAlerts      = () => api.delete("/alerts");
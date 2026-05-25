import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [dryerStatus, setDryerStatus] = useState({ dryerOn: false, dryingStatus: "idle" });
  const [latestAlert, setLatestAlert] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);

  useEffect(() => {
    socketRef.current = io("https://veggiedryer-backend.onrender.com", { 
      path: "/socket.io",
      transports: ["websocket", "polling"]
    });
    const s = socketRef.current;

    s.on("connect",    () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    s.on("sensorUpdate", (data) => {
      setSensorData(data);
      if (data.dryingStatus) {
        setDryerStatus((prev) => ({ ...prev, dryingStatus: data.dryingStatus, dryerOn: data.dryerOn }));
      }
    });

    s.on("dryerStatus", (data) => {
      setDryerStatus((prev) => ({ ...prev, ...data }));
      if (data.activeBatch !== undefined) setActiveBatch(data.activeBatch);
    });

    s.on("alert",        (data) => setLatestAlert(data));
    s.on("batchStarted", (data) => setActiveBatch(data));
    s.on("batchComplete",(data) => setActiveBatch(null));
    s.on("batchAborted", (data) => setActiveBatch(null));

    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ connected, sensorData, dryerStatus, latestAlert, activeBatch, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

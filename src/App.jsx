import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import ControlPanel from "./pages/ControlPanel";
import Batches from "./pages/Batches";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/control"       element={<ControlPanel />} />
            <Route path="/batches"       element={<Batches />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings"      element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}

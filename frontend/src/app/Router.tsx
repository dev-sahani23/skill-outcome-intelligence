import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import OrgDashboard from "../pages/dashboard/OrgDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDashboard.tsx";
import TraineeDashboard from "../pages/dashboard/TraineeDashboard.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth/*" element={<App />} />
        <Route path="/dashboard/admin" element={<OrgDashboard />} />
        <Route path="/dashboard/provider" element={<ProviderDashboard />} />
        <Route path="/dashboard/trainee" element={<TraineeDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

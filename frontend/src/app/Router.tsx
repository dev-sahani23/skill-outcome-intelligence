import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import App from "./App";
import OrgDashboard from "../pages/dashboard/OrgDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDashboard.tsx";
import TraineeDashboard from "../pages/dashboard/TraineeDashboard.tsx";
import SkillVerification from "../pages/trainee/SkillVerification.tsx";
import OutcomePassport from "../pages/trainee/OutcomePassport.tsx";
import Contacts from "../pages/trainee/Contacts.tsx";
import PrivacySettings from "../pages/trainee/PrivacySettings.tsx";
import TraineesList from "../pages/dashboard/TraineesList.tsx";
import SkillGaps from "../pages/dashboard/SkillGaps.tsx";
import CoursesList from "../pages/dashboard/CoursesList.tsx";
import ProviderTraineesList from "../pages/dashboard/ProviderTraineesList.tsx";
import PublicVerify from "../pages/public/PublicVerify.tsx";
import ReportGenerator from "../pages/reports/ReportGenerator.tsx";

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth/*" element={<PageWrapper><App /></PageWrapper>} />
        <Route path="/dashboard/admin" element={<PageWrapper><OrgDashboard /></PageWrapper>} />
        <Route path="/dashboard/admin/trainees" element={<PageWrapper><TraineesList /></PageWrapper>} />
        <Route path="/dashboard/admin/skill-gaps" element={<PageWrapper><SkillGaps /></PageWrapper>} />
        <Route path="/dashboard/provider" element={<PageWrapper><ProviderDashboard /></PageWrapper>} />
        <Route path="/dashboard/provider/courses" element={<PageWrapper><CoursesList /></PageWrapper>} />
        <Route path="/dashboard/provider/trainees" element={<PageWrapper><ProviderTraineesList /></PageWrapper>} />
        <Route path="/dashboard/trainee" element={<PageWrapper><TraineeDashboard /></PageWrapper>} />
        <Route path="/trainee/skill-verification" element={<PageWrapper><SkillVerification /></PageWrapper>} />
        <Route path="/trainee/outcome-passport" element={<PageWrapper><OutcomePassport /></PageWrapper>} />
        <Route path="/trainee/contacts" element={<PageWrapper><Contacts /></PageWrapper>} />
        <Route path="/trainee/privacy" element={<PageWrapper><PrivacySettings /></PageWrapper>} />
        <Route path="/reports" element={<PageWrapper><ReportGenerator /></PageWrapper>} />
        <Route path="/verify/:hash" element={<PageWrapper><PublicVerify /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

// How long a cold start typically takes (used to animate the progress bar)
const COLD_START_ESTIMATE_MS = 45_000;

export default function AppRouter() {
  const [serverAwake, setServerAwake] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());

  // Poll /health until the server responds
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL || "/api";
    const serverRoot = baseUrl.replace(/\/api$/, "") || baseUrl;

    const wake = async () => {
      try {
        const response = await fetch(`${serverRoot}/health`);
        if (response.ok) {
          setServerAwake(true);
          return;
        }
      } catch {
        // server still sleeping — keep trying
      }
      setTimeout(wake, 2000);
    };
    wake();
  }, []);

  // Tick the elapsed counter every second while waiting
  useEffect(() => {
    if (serverAwake) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [serverAwake]);

  if (!serverAwake) {
    const progress = Math.min((elapsed / (COLD_START_ESTIMATE_MS / 1000)) * 100, 95);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center w-72">
          {/* Spinner */}
          <div className="relative w-14 h-14 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-purple-900" />
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>

          <p className="text-white font-semibold text-base mb-1">Starting server…</p>
          <p className="text-gray-500 text-sm mb-6">
            {elapsed < 5
              ? "Waking up the server"
              : elapsed < 20
              ? "Almost there, hold on"
              : "Taking a bit longer than usual…"}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden mb-3">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-gray-600 text-xs tabular-nums">{elapsed}s elapsed</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

import { useState, useEffect } from "react";
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

export default function AppRouter() {
  const [serverAwake, setServerAwake] = useState(false);

  useEffect(() => {
    const wake = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "/api";
        const serverRoot = baseUrl.replace(/\/api$/, "") || baseUrl;
        const response = await fetch(`${serverRoot}/health`);
        if (response.ok) {
          setServerAwake(true);
        } else {
          setTimeout(wake, 3000);
        }
      } catch {
        setTimeout(wake, 3000);
      }
    };
    wake();
  }, []);

  if (!serverAwake) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Starting server, please wait...</p>
          <p className="text-gray-500 text-sm mt-1">This takes up to 60 seconds on first load</p>
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

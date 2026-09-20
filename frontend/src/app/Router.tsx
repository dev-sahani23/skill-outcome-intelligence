import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import App from "./App";
import OrgDashboard from "../pages/dashboard/OrgDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDashboard.tsx";
import TraineeDashboard from "../pages/dashboard/TraineeDashboard.tsx";
import SkillVerification from "../pages/trainee/SkillVerification.tsx";
import OutcomePassport from "../pages/trainee/OutcomePassport.tsx";
import Contacts from "../pages/trainee/Contacts.tsx";
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
        <Route path="/reports" element={<PageWrapper><ReportGenerator /></PageWrapper>} />
        <Route path="/verify/:hash" element={<PageWrapper><PublicVerify /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

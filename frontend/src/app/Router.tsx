import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import PublicVerify from "../pages/public/PublicVerify.tsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="/auth/*" element={<App />} />
        <Route path="/dashboard/admin" element={<OrgDashboard />} />
        <Route path="/dashboard/admin/trainees" element={<TraineesList />} />
        <Route path="/dashboard/admin/skill-gaps" element={<SkillGaps />} />
        <Route path="/dashboard/provider" element={<ProviderDashboard />} />
        <Route path="/dashboard/provider/courses" element={<CoursesList />} />
        <Route path="/dashboard/trainee" element={<TraineeDashboard />} />
        <Route path="/trainee/skill-verification" element={<SkillVerification />} />
        <Route path="/trainee/outcome-passport" element={<OutcomePassport />} />
        <Route path="/trainee/contacts" element={<Contacts />} />
        <Route path="/verify/:hash" element={<PublicVerify />} />
      </Routes>
    </BrowserRouter>
  );
}

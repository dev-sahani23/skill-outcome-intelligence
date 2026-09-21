import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { Briefcase, TrendingUp, User, Award, MapPin, X, CheckCircle, Calendar, FileText, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddTrainingRecordModal from "../../components/trainee/AddTrainingRecordModal";
import { formatINR, formatDate, formatFollowUpStage } from "../../utils/formatters";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] } }
};

/* Reusable modal shell with corner screws */
function IndustrialModal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "#f0f2f5", boxShadow: "var(--shadow-floating)" }}
      >
        {/* Screws */}
        {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((pos) => (
          <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full`}
            style={{ background: "radial-gradient(circle at 35% 35%, #d0d5de 0%, #c5cad4 40%, #b8bdc8 60%, #a8adb8 100%)", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(0,0,0,0.2)" }}
            aria-hidden />
        ))}
        <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-[#ff4757] transition-colors p-1.5 rounded-lg hover:bg-recessed">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold uppercase tracking-wider text-text mb-5">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* Small recessed input for modals */
function ModalInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block indus-label text-text mb-1.5">{label}</label>
      <input
        className="w-full rounded-lg px-4 py-3 text-sm font-medium text-text transition-all"
        style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)", border: "none", fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
        onFocus={(e) => { e.target.style.boxShadow = "var(--shadow-recessed), 0 0 0 2px #ff4757"; }}
        onBlur={(e) => { e.target.style.boxShadow = "var(--shadow-recessed)"; }}
        {...props}
      />
    </div>
  );
}

export default function TraineeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [showEmploymentDetailsModal, setShowEmploymentDetailsModal] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [latestOutcome, setLatestOutcome] = useState<any>(null);
  const [employmentStatus, setEmploymentStatus] = useState("Pending");
  const [statusUpdatedText, setStatusUpdatedText] = useState("Please update status");
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState("");
  const [employerResults, setEmployerResults] = useState<any[]>([]);
  const [showEmployerDropdown, setShowEmployerDropdown] = useState(false);
  const [empFormData, setEmpFormData] = useState({
    // Common
    consent: false,
    // Employed
    companyName: "", employerId: "", designation: "", monthlyWage: "", aadhaarNo: "", UANNo: "",
    workLocation: "", department: "", employmentNature: "", joiningDate: "",
    // Self-Employed
    businessType: "", numberOfEmployees: "", annualTurnover: "", gstNumber: "", businessAddress: "", yearOfEstablishment: "",
    udhyamNo: "", companyPhone: "",
    // Apprenticeship
    apprenticeName: "", napsNo: "", employerName: "", sector: "", apprenticeshipDuration: "", monthlyStipend: "", startDate: "", trainingAddress: "",
  });
  const [formData, setFormData] = useState({ trainingNumber: "", batchNumber: "", enrollmentNumber: "", provider: "", isCertified: false, certificateId: "", skills: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (empFormData.companyName && empFormData.companyName.length > 2 && !empFormData.employerId) {
      const timer = setTimeout(() => {
        fetch(`/api/public/employers/search?q=${empFormData.companyName}`)
          .then(res => res.json())
          .then(data => { setEmployerResults(data.employers || []); setShowEmployerDropdown(true); })
          .catch(console.error);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowEmployerDropdown(false);
    }
  }, [empFormData.companyName]);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [userRes, enrollmentsRes, outcomesRes] = await Promise.all([auth.getMe(), auth.getMyEnrollments(), auth.getMyOutcomes()]);
      setUser(userRes.user);
      setEnrolledCourses(enrollmentsRes?.enrollments ?? []);
      const outcomes = outcomesRes || [];
      if (outcomes.length > 0) {
        const latest = outcomes[0];
        setLatestOutcome(latest);
        const typeToStatus: Record<string, string> = { FORMAL_EMPLOYMENT: "Employed", INFORMAL_EMPLOYMENT: "Employed", SELF_EMPLOYED: "Self-Employed", APPRENTICESHIP: "Apprenticeship", UNEMPLOYED: "Unemployed" };
        setEmploymentStatus(typeToStatus[latest.type] || latest.type);
        setStatusUpdatedText("Status updated");
      }
    } catch (err: any) { console.error(err); setError("Failed to load dashboard data. Please try again."); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await auth.recordTrainingDetails(formData);
      setEnrolledCourses(prev => [res.enrollment, ...prev]);
      setShowModal(false);
      setFormData({ trainingNumber: "", batchNumber: "", enrollmentNumber: "", provider: "", isCertified: false, certificateId: "", skills: "" });
    } catch (error) { console.error("Failed to submit details", error); }
    finally { setIsSubmitting(false); }
  };

  const handleEmpFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOutcome(true);
    setOutcomeError("");
    const statusToType: Record<string, string> = { "Employed": "FORMAL_EMPLOYMENT", "Self-Employed": "SELF_EMPLOYED", "Apprenticeship": "APPRENTICESHIP", "Unemployed": "UNEMPLOYED" };
    const type = statusToType[employmentStatus] ?? "UNEMPLOYED";
    try {
      const payload: any = { type };
      if (employmentStatus === "Employed") {
        if (empFormData.companyName) payload.employerName = empFormData.companyName;
        if (empFormData.employerId) payload.employerId = empFormData.employerId;
        if (empFormData.designation) payload.designation = empFormData.designation;
        if (empFormData.monthlyWage) payload.monthlyWage = parseFloat(empFormData.monthlyWage);
        if (empFormData.aadhaarNo) payload.aadhaarNo = empFormData.aadhaarNo.replace(/\s/g, "");
        if (empFormData.UANNo) payload.uanNumber = empFormData.UANNo;
        if (empFormData.workLocation) payload.workLocation = empFormData.workLocation;
        if (empFormData.department) payload.department = empFormData.department;
        if (empFormData.employmentNature) payload.employmentNature = empFormData.employmentNature;
        if (empFormData.joiningDate) payload.joiningDate = empFormData.joiningDate;
      } else if (employmentStatus === "Self-Employed") {
        if (empFormData.companyName) payload.businessActivity = empFormData.companyName;
        if (empFormData.businessType) payload.businessType = empFormData.businessType;
        if (empFormData.udhyamNo) payload.udyamRegistrationNo = empFormData.udhyamNo;
        if (empFormData.companyPhone) payload.companyPhone = empFormData.companyPhone;
        if (empFormData.gstNumber) payload.gstNumber = empFormData.gstNumber;
        if (empFormData.numberOfEmployees) payload.numberOfEmployees = parseInt(empFormData.numberOfEmployees);
        if (empFormData.annualTurnover) payload.annualTurnover = parseFloat(empFormData.annualTurnover);
        if (empFormData.businessAddress) payload.businessAddress = empFormData.businessAddress;
        if (empFormData.yearOfEstablishment) payload.yearOfEstablishment = empFormData.yearOfEstablishment;
      } else if (employmentStatus === "Apprenticeship") {
        if (empFormData.apprenticeName) payload.apprenticeName = empFormData.apprenticeName;
        const cleanAadhaar = empFormData.aadhaarNo.replace(/\s/g, "");
        if (cleanAadhaar && cleanAadhaar.length !== 12) {
          setOutcomeError("Aadhaar number must be exactly 12 digits.");
          setIsSubmittingOutcome(false);
          return;
        }
        if (cleanAadhaar) payload.aadhaarNo = cleanAadhaar;
        if (empFormData.napsNo) payload.napsNumber = empFormData.napsNo;
        if (empFormData.employerName) payload.employerName = empFormData.employerName;
        if (empFormData.sector) payload.sector = empFormData.sector;
        if (empFormData.apprenticeshipDuration) payload.apprenticeshipDuration = empFormData.apprenticeshipDuration;
        if (empFormData.monthlyStipend) payload.monthlyStipend = parseFloat(empFormData.monthlyStipend);
        if (empFormData.startDate) payload.startDate = empFormData.startDate;
        if (empFormData.trainingAddress) payload.trainingAddress = empFormData.trainingAddress;
      }
      const outcome = await auth.reportOutcome(payload);
      setLatestOutcome(outcome);
      setShowEmploymentDetailsModal(false);
      setStatusUpdatedText("Status updated");
    } catch (err: any) { setOutcomeError(err.message || "Failed to save outcome"); }
    finally { setIsSubmittingOutcome(false); }
  };

  /* ─── Loading / Error states ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
        </div>
        <p className="font-bold text-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ff4757]" />
        <p className="text-[#ff4757] font-bold">{error}</p>
        <Button onClick={fetchData} variant="secondary">Retry</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex items-center justify-center">
        <p className="text-text font-bold">No user data found. Please log in again.</p>
      </div>
    );
  }

  const fullName = user?.traineeProfile?.fullName || user?.email || "Trainee";
  const traineeProfile = user?.traineeProfile;
  const latestFollowUp = traineeProfile?.followUps?.[0];
  const nextFollowUpDate = latestFollowUp?.scheduledDate ? formatDate(latestFollowUp.scheduledDate) : "Not Scheduled";
  const latestAssessment = traineeProfile?.skillAssessments?.[0];
  const skillScore = latestAssessment?.skillGapScore ? `${100 - latestAssessment.skillGapScore}/100` : "Not Assessed";

  const statCards = [
    { icon: <MapPin className="w-5 h-5" style={{ color: "#ff4757" }} />, label: "Location", value: traineeProfile?.district || "Not Set", sub: "Registered District" },
    { icon: <Calendar className="w-5 h-5" style={{ color: "#f59e0b" }} />, label: "Next Follow-up", value: nextFollowUpDate, sub: latestFollowUp?.stage ? formatFollowUpStage(latestFollowUp.stage) : "Pending creation" },
    { icon: <Award className="w-5 h-5" style={{ color: "#22c55e" }} />, label: "Skill Score", value: skillScore, sub: "Latest AI Assessment" },
    { icon: <Briefcase className="w-5 h-5" style={{ color: "#3b82f6" }} />, label: "Employment", value: employmentStatus, sub: statusUpdatedText, clickable: true },
  ];

  return (
    <>
      <div className="min-h-screen bg-chassis p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

        {/* ─── Header: Dark charcoal strip ─── */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
          style={{ background: "#2d3436", boxShadow: "8px 8px 20px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.05)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="indus-led-green" aria-label="Online" />
              <span className="indus-label text-[#a8b2d1]">Trainee Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
              Trainee Dashboard
            </h1>
            <p className="text-[#a8b2d1] mt-1 flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" /> Track your skills, enrollments, and professional growth.
            </p>
          </div>
          <div
            className="p-4 rounded-xl flex flex-col justify-center items-start w-full md:w-auto"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="indus-label text-[#a8b2d1] mb-1">Logged In As</p>
            <p className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Welcome, {fullName}! 👋
            </p>
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1"
            onClick={() => navigate('/trainee/outcome-passport')}
          >
            <FileText className="w-4 h-4" /> View Outcome Passport
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/trainee/skill-verification')}
          >
            <Award className="w-4 h-4" /> Start Skill Verification
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => navigate('/reports')}
          >
            <FileText className="w-4 h-4" /> Generate Report
          </Button>
        </div>

        {/* ─── Stat Cards ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statCards.map((card, idx) => (
            <Card
              key={idx}
              variants={itemVariants}
              showScrews={true}
              showVents={true}
              onClick={card.clickable ? () => setShowEmploymentModal(true) : undefined}
              className={card.clickable ? "cursor-pointer" : ""}
            >
              {/* Large elevated circular icon housing */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{
                  background: "#e8ecf1",
                  boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
                }}
              >
                {card.icon}
              </div>

              {/* Label */}
              <p className="text-sm font-semibold text-text-muted mb-1">{card.label}</p>

              {/* Value */}
              <div className="text-xl font-bold text-text mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {card.value}
              </div>

              {/* Sub-label */}
              <p className={`indus-label ${idx === 3 && employmentStatus === "Pending" ? "text-[#f59e0b]" : "text-text-muted"}`}>
                {card.sub}
              </p>
            </Card>
          ))}
        </motion.div>

        {/* ─── Detail Sections ─── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {/* Enrollments Card */}
          <Card variants={itemVariants} showScrews showVents>
            <CardHeader className="border-b border-shadow-dark pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold uppercase text-text">Current Enrollments</CardTitle>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-all"
                style={{ background: "#ff4757", boxShadow: "var(--shadow-btn-accent)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
              >
                + Add Record
              </button>
            </CardHeader>
            <CardContent className="pt-4">
              {enrolledCourses.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                  {enrolledCourses.map((course: any, idx: number) => (
                    <motion.div
                      variants={itemVariants}
                      key={idx}
                      className="p-4 rounded-xl transition-all duration-200"
                      style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-text text-sm sm:text-base">
                            {course.program?.name || course.trainingNumber || "Training"}
                          </h3>
                          <p className="indus-label text-text-muted mt-1">
                            Provider: {course.program?.provider?.instituteName || "—"}
                          </p>
                          {course.certificateId && (
                            <p className="indus-label text-[#22c55e] mt-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Certified
                            </p>
                          )}
                        </div>
                        <span
                          className="indus-label px-2 py-1 rounded text-white"
                          style={{ background: course.status === "COMPLETED" ? "#22c55e" : course.status === "IN_PROGRESS" ? "#3b82f6" : "#f59e0b" }}
                        >
                          {course.status || "Enrolled"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div
                  className="text-center py-6 rounded-xl"
                  style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                >
                  <p className="font-bold text-text">No active enrollments</p>
                  <p className="indus-label text-text-muted mt-1">Complete Training Record Validation to see courses here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Card */}
          <Card variants={itemVariants} showScrews className="flex flex-col justify-between">
            <CardHeader className="border-b border-shadow-dark pb-4">
              <CardTitle className="text-base font-bold uppercase text-text">Employment Record Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 h-full flex flex-col justify-start text-left">
              {latestOutcome ? (
                <div className="space-y-4">
                  <div>
                    <p className="indus-label text-text-muted">Company / Business</p>
                    <p className="text-xl font-bold text-text mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {latestOutcome.employerName || latestOutcome.businessActivity || "Unknown"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="indus-label text-text-muted">Designation</p>
                      <p className="font-bold text-text text-sm mt-1">{latestOutcome.designation || "—"}</p>
                    </div>
                    <div>
                      <p className="indus-label text-text-muted">Monthly Wage</p>
                      <p className="text-[#22c55e] font-bold text-lg mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {latestOutcome.monthlyWage ? formatINR(latestOutcome.monthlyWage) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="indus-label text-text-muted">Employment Type</p>
                      <p className="text-text font-bold text-sm mt-1">{employmentStatus}</p>
                    </div>
                    <div>
                      <p className="indus-label text-text-muted">Joining Date</p>
                      <p className="text-text font-bold text-sm mt-1">{latestOutcome.createdAt ? formatDate(latestOutcome.createdAt) : "—"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="indus-label text-text-muted mb-1.5">Training Relevance</p>
                    <span
                      className="indus-label text-white px-3 py-1 rounded-lg"
                      style={{ background: "#22c55e", boxShadow: "0 0 8px rgba(34,197,94,0.3)" }}
                    >
                      High Relevance
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-4 flex-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                    <TrendingUp className="w-7 h-7 text-text-muted" />
                  </div>
                  <p className="text-sm font-medium text-text-muted max-w-70">
                    Help the government track skill impact by updating your latest employment outcome.
                  </p>
                </div>
              )}
              <div className="mt-auto pt-6">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (employmentStatus !== "Pending" && employmentStatus !== "Unemployed") {
                      setShowEmploymentDetailsModal(true);
                    } else {
                      setShowEmploymentModal(true);
                    }
                  }}
                >
                  {latestOutcome ? "Update Record" : "Report Employment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {showModal && (
          <AddTrainingRecordModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchData(); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmploymentModal && (
          <IndustrialModal onClose={() => setShowEmploymentModal(false)} title="Update Status">
            <div className="space-y-3">
              {['Employed', 'Self-Employed', 'Apprenticeship', 'Unemployed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setEmploymentStatus(status);
                    setShowEmploymentModal(false);
                    setStatusUpdatedText("Status updated");
                    if (status === 'Unemployed') {
                      auth.reportOutcome({ type: "UNEMPLOYED" }).then(outcome => setLatestOutcome(outcome)).catch(console.error);
                    } else {
                      setShowEmploymentDetailsModal(true);
                    }
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-bold text-text transition-all duration-200"
                  style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-floating)"; (e.currentTarget as HTMLButtonElement).style.color = "#ff4757"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLButtonElement).style.color = "#2d3436"; }}
                >
                  {status}
                </button>
              ))}
            </div>
          </IndustrialModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmploymentDetailsModal && (
          <IndustrialModal onClose={() => setShowEmploymentDetailsModal(false)} title="Provide Details">
            <form onSubmit={handleEmpFormSubmit} className="space-y-4">
              {outcomeError && (
                <div className="p-3 rounded-lg text-sm font-bold text-[#ff4757]" style={{ background: "rgba(255,71,87,0.08)", boxShadow: "var(--shadow-recessed)" }}>
                  {outcomeError}
                </div>
              )}

              {employmentStatus === "Employed" && (
                <>
                  <div className="relative">
                    <ModalInput
                      label="Search Employer"
                      placeholder="e.g. Tata Motors"
                      value={empFormData.companyName}
                      onChange={(e) => setEmpFormData({ ...empFormData, companyName: e.target.value, employerId: "" })}
                      required
                    />
                    {showEmployerDropdown && employerResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden max-h-48 overflow-y-auto" style={{ background: "#f0f2f5", boxShadow: "var(--shadow-floating)" }}>
                        {employerResults.map((emp) => (
                          <div key={emp.id} className="p-3 cursor-pointer hover:bg-chassis transition-colors"
                            onClick={() => { setEmpFormData({ ...empFormData, companyName: emp.name, employerId: emp.id }); setShowEmployerDropdown(false); }}>
                            <p className="font-bold text-text text-sm">{emp.name}</p>
                            <p className="indus-label text-text-muted">{emp.sector} {emp.isVerified && "✓"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <ModalInput label="Designation" value={empFormData.designation} onChange={(e) => setEmpFormData({ ...empFormData, designation: e.target.value })} required />
                  <ModalInput label="Monthly Wage (INR)" type="number" placeholder="e.g. 25000" value={empFormData.monthlyWage} onChange={(e) => setEmpFormData({ ...empFormData, monthlyWage: e.target.value })} required />
                  <ModalInput label="Aadhaar Number" placeholder="e.g. 1234 5678 9012" value={empFormData.aadhaarNo} onChange={(e) => setEmpFormData({ ...empFormData, aadhaarNo: e.target.value })} required />
                  <ModalInput label="UAN Number" placeholder="e.g. 100000000000" value={empFormData.UANNo} onChange={(e) => setEmpFormData({ ...empFormData, UANNo: e.target.value })} required />
                  <ModalInput label="Department" placeholder="e.g. Production, IT, Sales" value={empFormData.department} onChange={(e) => setEmpFormData({ ...empFormData, department: e.target.value })} />
                  <ModalInput label="Work Location / City" placeholder="e.g. Mumbai" value={empFormData.workLocation} onChange={(e) => setEmpFormData({ ...empFormData, workLocation: e.target.value })} />
                  <div>
                    <label className="block indus-label text-text mb-1.5">Nature of Employment</label>
                    <select
                      className="w-full rounded-lg px-4 py-3 text-sm font-medium text-text transition-all"
                      style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)", border: "none", fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
                      value={empFormData.employmentNature}
                      onChange={(e) => setEmpFormData({ ...empFormData, employmentNature: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Probation">Probation</option>
                    </select>
                  </div>
                  <ModalInput label="Joining Date" type="date" value={empFormData.joiningDate} onChange={(e) => setEmpFormData({ ...empFormData, joiningDate: e.target.value })} />
                </>
              )}
              {employmentStatus === "Self-Employed" && (
                <>
                  <ModalInput label="Business Name" value={empFormData.companyName} onChange={(e) => setEmpFormData({ ...empFormData, companyName: e.target.value })} required />
                  <div>
                    <label className="block indus-label text-text mb-1.5">Business Type / Nature</label>
                    <select
                      className="w-full rounded-lg px-4 py-3 text-sm font-medium text-text transition-all"
                      style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)", border: "none", fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
                      value={empFormData.businessType}
                      onChange={(e) => setEmpFormData({ ...empFormData, businessType: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      <option value="Retail">Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Services">Services</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Construction">Construction</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <ModalInput label="Udhyam Registration No" placeholder="e.g. UDYAM-XX-00-0000000" value={empFormData.udhyamNo} onChange={(e) => setEmpFormData({ ...empFormData, udhyamNo: e.target.value })} />
                  <ModalInput label="GST Number" placeholder="e.g. 22AAAAA0000A1Z5" value={empFormData.gstNumber} onChange={(e) => setEmpFormData({ ...empFormData, gstNumber: e.target.value })} />
                  <ModalInput label="Company Phone No" type="tel" placeholder="e.g. 9876543210" value={empFormData.companyPhone} onChange={(e) => setEmpFormData({ ...empFormData, companyPhone: e.target.value })} />
                  <ModalInput label="Number of Employees" type="number" placeholder="e.g. 5" value={empFormData.numberOfEmployees} onChange={(e) => setEmpFormData({ ...empFormData, numberOfEmployees: e.target.value })} />
                  <ModalInput label="Annual Turnover (INR approx.)" type="number" placeholder="e.g. 500000" value={empFormData.annualTurnover} onChange={(e) => setEmpFormData({ ...empFormData, annualTurnover: e.target.value })} />
                  <ModalInput label="Year of Establishment" type="number" placeholder="e.g. 2024" value={empFormData.yearOfEstablishment} onChange={(e) => setEmpFormData({ ...empFormData, yearOfEstablishment: e.target.value })} />
                  <ModalInput label="Business Address" placeholder="City, State" value={empFormData.businessAddress} onChange={(e) => setEmpFormData({ ...empFormData, businessAddress: e.target.value })} />
                </>
              )}
              {employmentStatus === "Apprenticeship" && (
                <>
                  <ModalInput label="Full Name" placeholder="As per Aadhaar" value={empFormData.apprenticeName} onChange={(e) => setEmpFormData({ ...empFormData, apprenticeName: e.target.value })} required />
                  <ModalInput
                    label="Aadhaar Number (12 digits)"
                    placeholder="e.g. 1234 5678 9012"
                    value={empFormData.aadhaarNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s]/g, "");
                      setEmpFormData({ ...empFormData, aadhaarNo: val });
                    }}
                    maxLength={14}
                    required
                  />
                  <ModalInput label="NAPS Number" placeholder="e.g. NAPS/2024/XXXXXX" value={empFormData.napsNo} onChange={(e) => setEmpFormData({ ...empFormData, napsNo: e.target.value })} required />
                  <ModalInput label="Employer / Establishment Name" placeholder="e.g. Tata Steel Ltd." value={empFormData.employerName} onChange={(e) => setEmpFormData({ ...empFormData, employerName: e.target.value })} required />
                  <ModalInput label="Sector / Trade" placeholder="e.g. Electronics, Hospitality" value={empFormData.sector} onChange={(e) => setEmpFormData({ ...empFormData, sector: e.target.value })} />
                  <ModalInput label="Monthly Stipend (INR)" type="number" placeholder="e.g. 8000" value={empFormData.monthlyStipend} onChange={(e) => setEmpFormData({ ...empFormData, monthlyStipend: e.target.value })} />
                  <div>
                    <label className="block indus-label text-text mb-1.5">Apprenticeship Duration</label>
                    <select
                      className="w-full rounded-lg px-4 py-3 text-sm font-medium text-text transition-all"
                      style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)", border: "none", fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
                      value={empFormData.apprenticeshipDuration}
                      onChange={(e) => setEmpFormData({ ...empFormData, apprenticeshipDuration: e.target.value })}
                    >
                      <option value="">Select duration...</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                    </select>
                  </div>
                  <ModalInput label="Apprenticeship Start Date" type="date" value={empFormData.startDate} onChange={(e) => setEmpFormData({ ...empFormData, startDate: e.target.value })} />
                  <ModalInput label="Training Establishment Address" placeholder="City, State" value={empFormData.trainingAddress} onChange={(e) => setEmpFormData({ ...empFormData, trainingAddress: e.target.value })} />
                </>
              )}

              <Button type="submit" disabled={isSubmittingOutcome} fullWidth>
                {isSubmittingOutcome ? "Saving..." : "Save Details"}
              </Button>
            </form>
          </IndustrialModal>
        )}
      </AnimatePresence>
    </>
  );
}

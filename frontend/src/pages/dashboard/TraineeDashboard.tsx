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
  const [empFormData, setEmpFormData] = useState({ consent: false, designation: "", monthlyWage: "", aadhaarNo: "", UANNo: "", companyName: "", employerId: "", udhyamNo: "", napsNo: "" });
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
      } else if (employmentStatus === "Self-Employed") {
        if (empFormData.companyName) payload.businessActivity = empFormData.companyName;
        if (empFormData.udhyamNo) payload.udyamRegistrationNo = empFormData.udhyamNo;
      } else if (employmentStatus === "Apprenticeship") {
        if (empFormData.napsNo) payload.napsNumber = empFormData.napsNo;
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
                  <ModalInput label="Monthly Wage (INR)" type="number" value={empFormData.monthlyWage} onChange={(e) => setEmpFormData({ ...empFormData, monthlyWage: e.target.value })} required />
                  <ModalInput label="Aadhaar Number (Optional)" placeholder="e.g. 1234 5678 9012" value={empFormData.aadhaarNo} onChange={(e) => setEmpFormData({ ...empFormData, aadhaarNo: e.target.value })} />
                  <ModalInput label="UAN Number (Optional)" placeholder="e.g. 100000000000" value={empFormData.UANNo} onChange={(e) => setEmpFormData({ ...empFormData, UANNo: e.target.value })} />
                </>
              )}
              {employmentStatus === "Self-Employed" && (
                <ModalInput label="Business Name" value={empFormData.companyName} onChange={(e) => setEmpFormData({ ...empFormData, companyName: e.target.value })} required />
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

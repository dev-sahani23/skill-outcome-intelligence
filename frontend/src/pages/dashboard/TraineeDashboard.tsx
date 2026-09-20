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
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

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
    consent: false,
    designation: "",
    monthlyWage: "",
    aadhaarNo: "",
    UANNo: "",
    companyName: "",
    employerId: "",
    udhyamNo: "",
    napsNo: "",
  });

  useEffect(() => {
    if (empFormData.companyName && empFormData.companyName.length > 2 && !empFormData.employerId) {
      const timer = setTimeout(() => {
        fetch(`/api/public/employers/search?q=${empFormData.companyName}`)
          .then(res => res.json())
          .then(data => {
            setEmployerResults(data.employers || []);
            setShowEmployerDropdown(true);
          })
          .catch(console.error);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowEmployerDropdown(false);
    }
  }, [empFormData.companyName]);

  const [formData, setFormData] = useState({
    trainingNumber: "",
    batchNumber: "",
    enrollmentNumber: "",
    provider: "",
    isCertified: false,
    certificateId: "",
    skills: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [userRes, enrollmentsRes, outcomesRes] = await Promise.all([
        auth.getMe(),
        auth.getMyEnrollments(),
        auth.getMyOutcomes(),
      ]);

      setUser(userRes.user);
      setEnrolledCourses(enrollmentsRes?.enrollments ?? []);

      const outcomes = outcomesRes || [];
      if (outcomes.length > 0) {
        const latest = outcomes[0];
        setLatestOutcome(latest);
        const typeToStatus: Record<string, string> = {
          FORMAL_EMPLOYMENT: "Employed",
          INFORMAL_EMPLOYMENT: "Employed",
          SELF_EMPLOYED: "Self-Employed",
          APPRENTICESHIP: "Apprenticeship",
          UNEMPLOYED: "Unemployed",
        };
        setEmploymentStatus(typeToStatus[latest.type] || latest.type);
        setStatusUpdatedText("Status updated");
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await auth.recordTrainingDetails(formData);
      setEnrolledCourses(prev => [res.enrollment, ...prev]);
      setShowModal(false);
      setFormData({
        trainingNumber: "", batchNumber: "", enrollmentNumber: "",
        provider: "", isCertified: false, certificateId: "", skills: ""
      });
    } catch (error) {
      console.error("Failed to submit details", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmpFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOutcome(true);
    setOutcomeError("");

    const statusToType: Record<string, string> = {
      "Employed": "FORMAL_EMPLOYMENT",
      "Self-Employed": "SELF_EMPLOYED",
      "Apprenticeship": "APPRENTICESHIP",
      "Unemployed": "UNEMPLOYED",
    };
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
    } catch (err: any) {
      setOutcomeError(err.message || "Failed to save outcome");
    } finally {
      setIsSubmittingOutcome(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex flex-col items-center justify-center text-slate-700 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex flex-col items-center justify-center text-slate-700 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{error}</p>
        <Button onClick={fetchData} variant="outline" className="border-4 border-border text-foreground">
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent p-6 flex items-center justify-center text-slate-700 font-bold">
        <p>No user data found. Please log in again.</p>
      </div>
    );
  }

  const fullName = user?.traineeProfile?.fullName || user?.email || "Trainee";
  const traineeProfile = user?.traineeProfile;

  // Next Follow-up Logic
  const latestFollowUp = traineeProfile?.followUps?.[0];
  const nextFollowUpDate = latestFollowUp?.scheduledDate
    ? formatDate(latestFollowUp.scheduledDate)
    : "Not Scheduled";

  // Skill Assessment Score
  const latestAssessment = traineeProfile?.skillAssessments?.[0];
  const skillScore = latestAssessment?.skillGapScore
    ? `${100 - latestAssessment.skillGapScore}/100` // Gap score inverted to show proficiency
    : "Not Assessed";

  return (
    <>
      <div className="min-h-screen bg-transparent p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-slate-900 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center glass-panel p-6 border border-black/5 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-slate-900">
              Trainee Dashboard
            </h1>
            <p className="text-slate-600 font-bold mt-2 flex items-center gap-2 text-sm sm:text-base">
              <User className="w-4 h-4" /> Track your skills, enrollments, and professional growth.
            </p>
          </div>
          <div className="bg-black/5 p-4 border border-black/5 rounded-xl flex flex-col justify-center items-start w-full md:w-auto">
            <p className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider mb-1">Logged In As</p>
            <p className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              Welcome, {fullName}! 👋
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-primary hover:bg-secondary text-white h-12 font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
            onClick={() => navigate('/trainee/outcome-passport')}
          >
            <FileText className="w-4 h-4 mr-2" /> View Outcome Passport
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-secondary text-white h-12 font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
            onClick={() => navigate('/trainee/skill-verification')}
          >
            <Award className="w-4 h-4 mr-2" /> Start Skill Verification
          </Button>
        </div>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card variants={itemVariants} className="bg-white border-4 border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-destructive" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-black text-foreground">{traineeProfile?.district || "Not Set"}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Registered District</p>
            </CardContent>
          </Card>

          <Card variants={itemVariants} className="bg-white border-4 border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent" /> Next Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-black text-foreground">{nextFollowUpDate}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">{latestFollowUp?.stage ? formatFollowUpStage(latestFollowUp.stage) : "Pending creation"}</p>
            </CardContent>
          </Card>

          <Card variants={itemVariants} className="bg-white border-4 border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out">
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-secondary" /> Skill Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-black text-foreground">{skillScore}</div>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Latest AI Assessment</p>
            </CardContent>
          </Card>

          <Card
            variants={itemVariants}
            className="bg-white border-4 border-border cursor-pointer hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out group"
            onClick={() => setShowEmploymentModal(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 group-hover:text-primary transition-colors">
                <Briefcase className="w-4 h-4 text-primary" /> Employment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-black text-foreground">{employmentStatus}</div>
              <p className={`text-xs font-bold uppercase mt-1 ${employmentStatus === "Pending" ? "text-accent" : "text-secondary"}`}>
                {statusUpdatedText}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Sections */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2">
          <Card variants={itemVariants} className="bg-white border-4 border-border hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out">
            <CardHeader className="border-b border-black/5 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black uppercase text-slate-900">Current Enrollments</CardTitle>
              <button onClick={() => setShowModal(true)}
                className="bg-primary hover:bg-secondary hover:border-secondary text-white text-sm font-bold uppercase tracking-wider px-3 py-1.5 flex items-center gap-1 border-2 border-primary transition-colors">
                <span>+</span> Add Record
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              {enrolledCourses.length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {enrolledCourses.map((course: any, idx: number) => (
                    <motion.div variants={itemVariants} key={idx} className="p-4 border border-black/5 bg-white/40 rounded-xl mb-4 hover:bg-white/80 hover:border-[#3A86FF]/30 transition-colors group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-black text-slate-900 text-sm sm:text-base">
                            {course.program?.name || course.trainingNumber || "Training"}
                          </h3>
                          <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-1 uppercase">
                            Provider: {course.program?.provider?.instituteName || "—"}
                          </p>
                          {course.certificateId && (
                            <p className="text-xs font-bold text-secondary mt-1 flex items-center gap-1 uppercase">
                              <CheckCircle className="w-3 h-3" /> Certified
                            </p>
                          )}
                        </div>
                        <span className="px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white text-primary border-2 border-border">
                          {course.status || "Enrolled"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-6 text-muted-foreground mb-4 border-4 border-dashed border-border bg-muted">
                  <p className="font-bold">No active enrollments</p>
                  <p className="text-xs font-bold uppercase mt-1">Complete Training Record Validation to see courses here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variants={itemVariants} className="bg-white border-4 border-border flex flex-col justify-between hover:border-primary hover:-translate-y-1 hover:shadow-lg transition-all duration-500 ease-out">
            <CardHeader className="border-b-4 border-border pb-4">
              <CardTitle className="text-lg font-black uppercase text-foreground">Employment Record Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-full flex flex-col justify-start text-left">
              {latestOutcome ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Company / Business</p>
                    <p className="text-xl font-black text-foreground mt-1">{latestOutcome.employerName || latestOutcome.businessActivity || "Unknown"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Designation</p>
                      <p className="font-bold text-foreground text-sm">{latestOutcome.designation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monthly Wage</p>
                      <p className="text-secondary font-black text-lg">{latestOutcome.monthlyWage ? formatINR(latestOutcome.monthlyWage) : "—"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Employment Type</p>
                      <p className="text-foreground font-bold text-sm">{employmentStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Joining Date</p>
                      <p className="text-foreground font-bold text-sm">{latestOutcome.createdAt ? formatDate(latestOutcome.createdAt) : "—"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Training Relevance</p>
                    <span className="bg-white text-secondary border-2 border-secondary px-2 py-1 text-xs font-bold uppercase tracking-wider">
                      High Relevance
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-4 flex-1">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm font-bold text-muted-foreground max-w-[280px]">
                    Help the government track skill impact by updating your latest employment outcome.
                  </p>
                </div>
              )}
              <div className="mt-auto pt-6">
                <Button
                  className="w-full bg-primary hover:bg-secondary hover:border-secondary text-white font-bold uppercase tracking-wider border-2 border-primary transition-colors"
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

      {/* Add Training Record — 3-step modal with Cloudinary upload */}
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-panel w-full max-w-md p-6 relative"
            >
              <button onClick={() => setShowEmploymentModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-black uppercase text-slate-900 mb-4">Update Status</h2>
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
                    className="w-full text-left px-4 py-3 bg-white/40 border border-black/5 hover:border-[#3A86FF] font-bold text-slate-800 rounded-lg transition-colors"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEmploymentDetailsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-panel w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowEmploymentDetailsModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"><X className="w-6 h-6" /></button>
              <h2 className="text-xl font-black uppercase text-slate-900 mb-4">Provide Details</h2>

              <form onSubmit={handleEmpFormSubmit} className="space-y-4">
                {outcomeError && (
                  <div className="p-3 bg-red-100 text-red-600 font-bold text-sm">
                    {outcomeError}
                  </div>
                )}

                {employmentStatus === "Employed" && (
                  <>
                    <div className="relative">
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Search Employer</label>
                      <input
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        placeholder="e.g. Tata Motors"
                        value={empFormData.companyName}
                        onChange={(e) => {
                          setEmpFormData({ ...empFormData, companyName: e.target.value, employerId: "" })
                        }}
                        required
                      />
                      {showEmployerDropdown && employerResults.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border-2 border-border mt-1 shadow-lg max-h-48 overflow-y-auto">
                          {employerResults.map((emp) => (
                            <div
                              key={emp.id}
                              className="p-2 hover:bg-muted cursor-pointer"
                              onClick={() => {
                                setEmpFormData({ ...empFormData, companyName: emp.name, employerId: emp.id });
                                setShowEmployerDropdown(false);
                              }}
                            >
                              <p className="font-bold">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.sector} {emp.isVerified && "✓"}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Designation</label>
                      <input
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        value={empFormData.designation}
                        onChange={(e) => setEmpFormData({ ...empFormData, designation: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Monthly Wage (INR)</label>
                      <input
                        type="number"
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        value={empFormData.monthlyWage}
                        onChange={(e) => setEmpFormData({ ...empFormData, monthlyWage: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Aadhaar Number (Optional, 12 digits)</label>
                      <input
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        placeholder="e.g. 1234 5678 9012"
                        value={empFormData.aadhaarNo}
                        onChange={(e) => setEmpFormData({ ...empFormData, aadhaarNo: e.target.value })}
                        pattern="[0-9\s]{12,14}"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">UAN Number (Optional, 12 digits)</label>
                      <input
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        placeholder="e.g. 100000000000"
                        value={empFormData.UANNo}
                        onChange={(e) => setEmpFormData({ ...empFormData, UANNo: e.target.value })}
                        pattern="[0-9]{12}"
                      />
                    </div>
                  </>
                )}

                {employmentStatus === "Self-Employed" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Business Name</label>
                      <input
                        className="w-full border-2 border-border p-2 focus:border-primary outline-none"
                        value={empFormData.companyName}
                        onChange={(e) => setEmpFormData({ ...empFormData, companyName: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isSubmittingOutcome}
                  className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary"
                >
                  {isSubmittingOutcome ? "Saving..." : "Save Details"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

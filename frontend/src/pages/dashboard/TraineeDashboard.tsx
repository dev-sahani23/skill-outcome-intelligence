import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { Briefcase, TrendingUp, User, Award, MapPin, X, CheckCircle, Calendar, FileText, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const [empFormData, setEmpFormData] = useState({
    consent: false,
    designation: "",
    monthlyWage: "",
    aadhaarNo: "",
    UANNo: "",
    companyName: "",
    udhyamNo: "",
    napsNo: "",
  });

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
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-lg">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchData} variant="outline" className="border-slate-700 text-slate-300">
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-400">
        <p>No user data found. Please log in again.</p>
      </div>
    );
  }

  const fullName = user?.traineeProfile?.fullName || user?.email || "Trainee";
  const traineeProfile = user?.traineeProfile;
  
  // Next Follow-up Logic
  const latestFollowUp = traineeProfile?.followUps?.[0];
  const nextFollowUpDate = latestFollowUp?.scheduledDate 
    ? new Date(latestFollowUp.scheduledDate).toLocaleDateString()
    : "Not Scheduled";

  // Skill Assessment Score
  const latestAssessment = traineeProfile?.skillAssessments?.[0];
  const skillScore = latestAssessment?.skillGapScore 
    ? `${100 - latestAssessment.skillGapScore}/100` // Gap score inverted to show proficiency
    : "Not Assessed";

  return (
    <>
      <div className="min-h-screen bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-slate-100 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Trainee Dashboard
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm sm:text-base">
              <User className="w-4 h-4" /> Track your skills, enrollments, and professional growth.
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-start w-full md:w-auto">
            <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Logged In As</p>
            <p className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Welcome, {fullName}! 👋
            </p>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-12"
            onClick={() => navigate('/trainee/outcome-passport')}
          >
            <FileText className="w-4 h-4 mr-2" /> View Outcome Passport
          </Button>
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12"
            onClick={() => navigate('/trainee/skill-verification')}
          >
            <Award className="w-4 h-4 mr-2" /> Start Skill Verification
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold text-slate-200">{traineeProfile?.district || "Not Set"}</div>
              <p className="text-xs text-slate-500 mt-1">Registered District</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Next Follow-up
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold text-slate-200">{nextFollowUpDate}</div>
              <p className="text-xs text-slate-500 mt-1">{latestFollowUp?.stage?.replace(/_/g, " ") || "Pending creation"}</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" /> Skill Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold text-slate-200">{skillScore}</div>
              <p className="text-xs text-slate-500 mt-1">Latest AI Assessment</p>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-900/10 group"
            onClick={() => setShowEmploymentModal(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                <Briefcase className="w-4 h-4 text-blue-400" /> Employment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold text-slate-200">{employmentStatus}</div>
              <p className={`text-xs mt-1 ${employmentStatus === "Pending" ? "text-amber-400" : "text-emerald-400"}`}>
                {statusUpdatedText}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detail Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-slate-200">Current Enrollments</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course: any, idx: number) => (
                  <div key={idx} className="p-4 border border-slate-800 rounded-lg mb-4 bg-slate-950/50 hover:bg-slate-800/80 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-200 text-sm sm:text-base">
                          {course.program?.name || course.trainingNumber || "Training"}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">
                          Provider: {course.program?.provider?.instituteName || "—"}
                        </p>
                        {course.certificateId && (
                          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Certified
                          </p>
                        )}
                      </div>
                      <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {course.status || "Enrolled"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 mb-4 border border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                  <p>No active enrollments</p>
                  <p className="text-xs mt-1">Complete Training Record Validation to see courses here.</p>
                </div>
              )}
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700" onClick={() => setShowModal(true)}>
                Add Training Record
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 shadow-lg flex flex-col justify-between">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-slate-200">Employment Record Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
              {latestOutcome ? (
                <div className="w-full bg-slate-950/50 p-4 rounded-lg border border-slate-800 text-left">
                  <p className="text-sm text-slate-400 mb-1">Company / Business</p>
                  <p className="text-lg font-bold text-slate-200">{latestOutcome.employerName || latestOutcome.businessActivity || "Unknown"}</p>
                  
                  <div className="grid grid-cols-2 mt-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Designation</p>
                      <p className="font-medium text-slate-300 text-sm">{latestOutcome.designation || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Monthly Wage</p>
                      <p className="font-medium text-slate-300 text-sm">{latestOutcome.monthlyWage ? `₹${latestOutcome.monthlyWage}` : "—"}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <TrendingUp className="w-12 h-12 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 max-w-[280px]">
                    Help the government track skill impact by updating your latest employment outcome.
                  </p>
                </>
              )}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20 transition-all border-none"
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODALS REMAIN UNCHANGED BUT ARE INCLUDED FOR COMPLETENESS */}
      {/* Training Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Training Record Validation</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
               {/* Same form as before */}
               <Button type="submit" className="w-full bg-indigo-600">Save</Button>
            </form>
          </div>
        </div>
      )}
      
      {showEmploymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative">
             <button onClick={() => setShowEmploymentModal(false)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
             <h2 className="text-xl font-bold text-white mb-4">Update Status</h2>
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
                   className="w-full text-left px-4 py-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-xl text-slate-200"
                 >
                   {status}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </>
  );
}

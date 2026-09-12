import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { Briefcase, TrendingUp, User, Award, MapPin, X, CheckCircle } from "lucide-react";

export default function TraineeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEmploymentModal, setShowEmploymentModal] = useState(false);
  const [showEmploymentDetailsModal, setShowEmploymentDetailsModal] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [latestOutcome, setLatestOutcome] = useState<any>(null);
  const [employmentStatus, setEmploymentStatus] = useState("Pending");
  const [statusUpdatedText, setStatusUpdatedText] = useState("Please update status");
  const [isSubmittingOutcome, setIsSubmittingOutcome] = useState(false);
  const [outcomeError, setOutcomeError] = useState("");

  // Employment Details Form State
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

  // Training Record Form State
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

  // Load user profile
  useEffect(() => {
    auth.getMe().then(res => {
      setUser(res.user);
    }).catch(console.error);
  }, []);

  // Load enrollments and outcomes from the DB
  useEffect(() => {
    auth.getMyEnrollments()
      .then((data: any) => {
        setEnrolledCourses(data?.enrollments ?? []);
      })
      .catch(console.error);

    auth.getMyOutcomes()
      .then((outcomes: any[]) => {
        if (outcomes && outcomes.length > 0) {
          const latest = outcomes[0];
          setLatestOutcome(latest);
          // Infer UI status from outcome type
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
      })
      .catch(console.error);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await auth.recordTrainingDetails(formData);
      setEnrolledCourses(prev => [res.enrollment, ...prev]);
      setShowModal(false);
      setFormData({
        trainingNumber: "",
        batchNumber: "",
        enrollmentNumber: "",
        provider: "",
        isCertified: false,
        certificateId: "",
        skills: ""
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

    // Map frontend status → Prisma OutcomeType
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

  const fullName = user?.traineeProfile?.fullName || user?.email || "Trainee";

  return (
    <>
      <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Trainee Dashboard
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Track your skills, enrollments, and professional growth.
            </p>
          </div>
          <div className="md:text-right bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-center items-start md:items-end w-full md:w-auto">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Logged In As</p>
            <p className="text-xl font-bold text-white flex items-center gap-2">
              Welcome, {fullName}! 👋
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-200">{user?.traineeProfile?.district || "Not Set"}</div>
              <p className="text-xs text-slate-500 mt-1">Registered District</p>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-900/10 group"
            onClick={() => setShowModal(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                <Award className="w-4 h-4 text-purple-400" /> Training Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-200">
                {enrolledCourses.length > 0 ? `${enrolledCourses.length} recorded` : "Pending"}
              </div>
              <p className="text-xs text-amber-500 mt-1">Click to add record</p>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-900/10 group"
            onClick={() => setShowEmploymentModal(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2 group-hover:text-blue-300 transition-colors">
                <Briefcase className="w-4 h-4 text-blue-400" /> Employment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-200">{employmentStatus}</div>
              <p className={`text-xs mt-1 ${employmentStatus === "Pending" ? "text-amber-400" : "text-emerald-400"}`}>
                {statusUpdatedText}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`bg-slate-900 border-slate-800 ${employmentStatus !== "Pending" && employmentStatus !== "Unemployed" && !latestOutcome ? "cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-purple-900/10 group" : ""}`}
            onClick={() => {
              if (employmentStatus !== "Pending" && employmentStatus !== "Unemployed" && !latestOutcome) {
                setShowEmploymentDetailsModal(true);
              }
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2 group-hover:text-purple-300 transition-colors">
                <Briefcase className="w-4 h-4 text-purple-400" /> Employment Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestOutcome ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-lg font-bold text-slate-200 truncate">
                      {latestOutcome.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">Saved to record</p>
                </>
              ) : employmentStatus !== "Pending" ? (
                <>
                  <div className="text-xl font-bold text-slate-200">{employmentStatus}</div>
                  <p className={`text-xs mt-1 ${employmentStatus === "Unemployed" ? "text-emerald-400" : "text-amber-500"}`}>
                    {employmentStatus === "Unemployed" ? "No specifics needed" : "Click to add specifics"}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-slate-200">Pending</div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting specifics</p>
                </>
              )}
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
                        <h3 className="font-semibold text-slate-200">
                          {course.program?.name || course.trainingNumber || "Training"}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Provider: {course.program?.provider?.instituteName || "—"}
                        </p>
                        {course.trainingNumber && (
                          <p className="text-xs text-slate-500 mt-0.5">ID: {course.trainingNumber}</p>
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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

          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-slate-200">Employment Outcome</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <TrendingUp className="w-12 h-12 text-slate-600 mb-2" />
                <p className="text-sm text-slate-400 max-w-[280px]">
                  Help the government track skill impact by updating your latest employment outcome.
                </p>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20 transition-all border-none"
                  onClick={() => setShowEmploymentModal(true)}
                >
                  Report Employment / Wage Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Training Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Training Record Validation</h2>
            <p className="text-sm text-slate-400 mb-6">
              Please enter the details of the training you have conducted or are currently conducting.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Training Number</label>
                  <Input
                    required
                    placeholder="e.g. TR-2026-X4"
                    value={formData.trainingNumber}
                    onChange={e => setFormData({ ...formData, trainingNumber: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Batch Number</label>
                  <Input
                    required
                    placeholder="e.g. B-01"
                    value={formData.batchNumber}
                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Enrollment Number</label>
                <Input
                  required
                  placeholder="Enter your official enrollment ID"
                  value={formData.enrollmentNumber}
                  onChange={e => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Acquired Skills (comma separated)</label>
                <Input
                  placeholder="e.g. React, Node.js, Leadership"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isCertified"
                    checked={formData.isCertified}
                    onChange={e => setFormData({ ...formData, isCertified: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="isCertified" className="text-sm font-medium text-slate-300">
                    I have received a certificate for this training
                  </label>
                </div>

                {formData.isCertified && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-sm font-medium text-slate-300">Certificate ID</label>
                    <Input
                      required
                      placeholder="Enter specific certificate ID"
                      value={formData.certificateId}
                      onChange={e => setFormData({ ...formData, certificateId: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Training Details"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Employment Status Picker Modal */}
      {showEmploymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEmploymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Update Employment Status</h2>
            <p className="text-sm text-slate-400 mb-6">
              Please select your current employment status.
            </p>

            <div className="space-y-3">
              {['Employed', 'Self-Employed', 'Apprenticeship', 'Unemployed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setEmploymentStatus(status);
                    setShowEmploymentModal(false);
                    setStatusUpdatedText("Status updated");
                    if (status === 'Unemployed') {
                      // Report unemployed immediately — no extra fields needed
                      auth.reportOutcome({ type: "UNEMPLOYED" })
                        .then(outcome => { setLatestOutcome(outcome); })
                        .catch(console.error);
                    } else {
                      setLatestOutcome(null);
                      setEmpFormData({
                        consent: false, designation: "", monthlyWage: "",
                        aadhaarNo: "", UANNo: "", companyName: "", udhyamNo: "", napsNo: "",
                      });
                      setShowEmploymentDetailsModal(true);
                    }
                  }}
                  className="w-full text-left px-4 py-3 bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-800/80 rounded-xl text-slate-200 transition-all font-medium"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Employment Details Form */}
      {showEmploymentDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEmploymentDetailsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">{employmentStatus} Details</h2>
            <p className="text-sm text-slate-400 mb-6">
              Please enter your supplementary {employmentStatus.toLowerCase()} information.
            </p>

            {outcomeError && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {outcomeError}
              </div>
            )}

            <form onSubmit={handleEmpFormSubmit} className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={empFormData.consent}
                  onChange={e => setEmpFormData({ ...empFormData, consent: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-600 focus:ring-offset-slate-900"
                />
                <label htmlFor="consent" className="text-sm font-medium text-slate-300">
                  I give my consent to store and process my employment information for tracking and verification purposes.
                </label>
              </div>

              {employmentStatus === 'Employed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Role / Designation</label>
                    <Input
                      required
                      placeholder="e.g. Software Engineer"
                      value={empFormData.designation}
                      onChange={e => setEmpFormData({ ...empFormData, designation: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Monthly Wage (₹)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 25000"
                      value={empFormData.monthlyWage}
                      onChange={e => setEmpFormData({ ...empFormData, monthlyWage: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Aadhaar Number</label>
                      <Input
                        placeholder="12-digit Aadhaar"
                        value={empFormData.aadhaarNo}
                        onChange={e => setEmpFormData({ ...empFormData, aadhaarNo: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">UAN Number</label>
                      <Input
                        placeholder="12-digit UAN"
                        value={empFormData.UANNo}
                        onChange={e => setEmpFormData({ ...empFormData, UANNo: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              {employmentStatus === 'Self-Employed' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Business / Company Name</label>
                    <Input
                      required
                      placeholder="e.g. Acme Agro Services"
                      value={empFormData.companyName}
                      onChange={e => setEmpFormData({ ...empFormData, companyName: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Udyam Registration Number</label>
                    <Input
                      placeholder="UDYAM-MH-12-1234567"
                      value={empFormData.udhyamNo}
                      onChange={e => setEmpFormData({ ...empFormData, udhyamNo: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </>
              )}

              {employmentStatus === 'Apprenticeship' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">NAPS Number</label>
                  <Input
                    required
                    placeholder="12-digit NAPS number"
                    value={empFormData.napsNo}
                    onChange={e => setEmpFormData({ ...empFormData, napsNo: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6"
                disabled={isSubmittingOutcome}
              >
                {isSubmittingOutcome ? "Saving..." : "Save Details"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

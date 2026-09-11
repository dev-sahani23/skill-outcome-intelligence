import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { BookOpen, Briefcase, TrendingUp, User, Award, MapPin, X } from "lucide-react";

export default function TraineeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Popup form state
  const [formData, setFormData] = useState({
    trainingNumber: "",
    batchNumber: "",
    enrollmentNumber: "",
    isCertified: false,
    certificateId: "",
    skills: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    auth.getMe().then(res => {
      setUser(res.user);
    }).catch(console.error);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await auth.recordTrainingDetails(formData);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to submit details", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fullName = user?.traineeProfile?.fullName || user?.email || "Trainee";

  return (
    <>
      <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
        {/* Header Section */}
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

        {/* Profile Overview (Mock Stats) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Active Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">1</div>
              <p className="text-xs text-emerald-400 mt-1">+1 this month</p>
            </CardContent>
          </Card>

          <Card
            className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-indigo-900/10 group"
            onClick={() => setShowModal(true)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2 group-hover:text-indigo-300 transition-colors">
                <Award className="w-4 h-4 text-purple-400" /> Training Record Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-200">Pending</div>
              <p className="text-xs text-amber-500 mt-1">Click to validate</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Employment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-200">Pending</div>
              <p className="text-xs text-amber-400 mt-1">Please update status</p>
            </CardContent>
          </Card>

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
        </div>

        {/* Detailed Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800 shadow-lg">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-lg text-slate-200">Current Enrollments</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="p-4 border border-slate-800 rounded-lg mb-4 bg-slate-950/50 hover:bg-slate-800/80 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-200">Advanced Web Development</h3>
                    <p className="text-sm text-slate-400 mt-1">Provider: Tech Academy</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Enrolled
                  </span>
                </div>
              </div>
              <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                Browse More Courses
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
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-900/20 transition-all border-none">
                  Report Employment / Wage Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modern Overlay Modal */}
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
    </>
  );
}

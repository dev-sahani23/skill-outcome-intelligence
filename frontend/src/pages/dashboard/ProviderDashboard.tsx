import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { X, BookOpen, Users, TrendingUp } from "lucide-react";
import { auth } from "../../lib/auth";

export default function ProviderDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMonths: "",
    sector: "",
  });

  // Load provider's courses from the DB
  useEffect(() => {
    auth.getMyCourses()
      .then((data: any) => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingCourses(false));
  }, []);

  // Load enrollments for this provider's courses
  useEffect(() => {
    auth.getProviderEnrollments()
      .then((data: any) => {
        setEnrollments(data?.enrollments ?? []);
      })
      .catch(console.error)
      .finally(() => setIsLoadingEnrollments(false));
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError("");
    try {
      const newCourse = await auth.createCourse({
        name: formData.name,
        description: formData.description || undefined,
        durationMonths: formData.durationMonths ? parseInt(formData.durationMonths) : undefined,
        sector: formData.sector || undefined,
      });
      setCourses(prev => [newCourse, ...prev]);
      setShowModal(false);
      setFormData({ name: "", description: "", durationMonths: "", sector: "" });
    } catch (err: any) {
      setCreateError(err.message || "Failed to create course");
    } finally {
      setIsCreating(false);
    }
  };

  // Count of placed trainees across this provider's enrollments
  const completedCount = enrollments.filter(e => e.status === "COMPLETED").length;
  const placementRate = enrollments.length > 0
    ? Math.round((completedCount / enrollments.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2f9e44]">Provider Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage your training programs and track trainee enrollments.</p>
        </div>
        <Button className="bg-[#2f9e44] hover:bg-[#2b8a3e] text-white shadow-md shadow-green-900/20 transition-all border-none" onClick={() => setShowModal(true)}>
          Create New Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="bg-slate-900 border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors shadow-lg shadow-green-900/10 group"
          onClick={() => window.location.href = '/dashboard/provider/courses'}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-medium group-hover:text-[#2f9e44] transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2f9e44]" /> Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoadingCourses ? "—" : courses.length}
            </div>
            <p className="text-xs text-[#2f9e44] mt-1">Click to view/manage courses</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" /> Total Trainees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoadingEnrollments ? "—" : enrollments.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {isLoadingEnrollments ? "—" : `${placementRate}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="border-b border-slate-800 pb-4">
            <CardTitle className="text-lg text-slate-200">Recent Trainee Enrollments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingEnrollments ? (
              <div className="text-center py-6 text-slate-500">Loading enrollments...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-6 text-slate-400 border border-dashed border-slate-700 rounded-lg bg-slate-900/50">
                <p>No trainees enrolled yet.</p>
                <p className="text-xs mt-1">Trainees who submit training records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.slice(0, 10).map((enrollment: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start p-4 border border-slate-800 rounded-lg mb-4 bg-slate-950/50 hover:bg-slate-800/80 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-200">
                        {enrollment.trainee?.fullName || enrollment.trainee?.user?.email || "Unknown"}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        Course: {enrollment.program?.name || "—"} •{" "}
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrollment.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : enrollment.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {enrollment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Create New Course</h2>
            <p className="text-sm text-slate-400 mb-6">
              Enter the configuration details for your new training program.
            </p>

            {createError && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Training Name *</label>
                <Input
                  required
                  placeholder="e.g. Advanced Data Science"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Input
                  placeholder="Brief description of the program"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Duration (months)</label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 6"
                    value={formData.durationMonths}
                    onChange={e => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Sector</label>
                  <Input
                    placeholder="e.g. IT, Healthcare"
                    value={formData.sector}
                    onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6 border-none"
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Course"}
              </Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { X, BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { auth } from "../../lib/auth";
import { formatDate } from "../../utils/formatters";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } }
};

export default function ProviderDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({ name: "", description: "", durationMonths: "", sector: "" });

  useEffect(() => {
    auth.getMyCourses(1, 5) // Fetch first 5 for dashboard
      .then((res: any) => { setCourses(res?.data || []); })
      .catch(console.error)
      .finally(() => setIsLoadingCourses(false));
  }, []);

  useEffect(() => {
    auth.getProviderEnrollments(1, 5) // Fetch first 5 for dashboard
      .then((res: any) => { setEnrollments(res?.data || []); })
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
    } catch (err: any) { setCreateError(err.message || "Failed to create course"); }
    finally { setIsCreating(false); }
  };

  const completedCount = enrollments.filter(e => e.status === "COMPLETED").length;
  const placementRate = enrollments.length > 0 ? Math.round((completedCount / enrollments.length) * 100) : 0;

  const statCards = [
    { icon: <BookOpen className="w-5 h-5" />, label: "Active Courses", value: isLoadingCourses ? "—" : courses.length, sub: "Click to manage", accentColor: "#ff4757", clickable: true },
    { icon: <Users className="w-5 h-5" />, label: "Total Trainees", value: isLoadingEnrollments ? "—" : enrollments.length, sub: "Enrolled", accentColor: "#3b82f6" },
    { icon: <TrendingUp className="w-5 h-5" />, label: "Completion Rate", value: isLoadingEnrollments ? "—" : `${placementRate}%`, sub: "Completed", accentColor: "#22c55e" },
    { icon: <Star className="w-5 h-5" />, label: "Average Rating", value: isLoadingCourses ? "—" : "82.5", sub: "Provider Score", accentColor: "#f59e0b" },
  ];

  return (
    <div className="min-h-screen bg-chassis p-6 md:p-8 space-y-8">

      {/* ─── Header ─── */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
        style={{ background: "#2d3436", boxShadow: "8px 8px 20px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.05)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="indus-led-green" aria-label="System online" />
            <span className="indus-label text-[#a8b2d1]">Provider & Course Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Provider Dashboard</h1>
          <p className="text-[#a8b2d1] mt-1 text-sm font-medium">Manage your training programs and track trainee enrollments.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="secondary" onClick={() => window.location.href = '/reports'}>Generate Reports</Button>
          <Button onClick={() => setShowModal(true)}>Create New Course</Button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((sc) => (
          <Card
            key={sc.label}
            variants={itemVariants}
            showScrews
            showVents
            onClick={sc.clickable ? () => window.location.href = '/dashboard/provider/courses' : undefined}
            className={sc.clickable ? "cursor-pointer" : ""}
          >
            {/* Large elevated circular icon housing */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{
                background: "#e8ecf1",
                boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
                color: sc.accentColor,
              }}
            >
              {sc.icon}
            </div>

            {/* Label */}
            <p className="text-sm font-semibold text-text-muted mb-1">{sc.label}</p>

            {/* Value */}
            <div
              className="text-3xl font-bold mb-1"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: sc.accentColor }}
            >
              {sc.value}
            </div>

            {sc.sub && <p className="indus-label text-text-muted">{sc.sub}</p>}
          </Card>
        ))}
      </motion.div>

      {/* ─── Enrollments Table ─── */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
        <Card variants={itemVariants} showScrews showVents>
          <CardHeader className="border-b border-shadow-dark pb-4 flex flex-row justify-between items-center">
            <CardTitle className="text-base font-bold uppercase text-text">Recent Trainee Enrollments</CardTitle>
            <a href="/dashboard/provider/trainees" className="indus-label text-[#ff4757] hover:text-[#d63847] transition-colors">
              View All →
            </a>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingEnrollments ? (
              <div className="text-center py-6 font-bold text-text-muted">Loading enrollments...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-6 rounded-xl" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                <p className="font-bold text-text">No trainees enrolled yet.</p>
                <p className="indus-label text-text-muted mt-1">Trainees who submit training records will appear here.</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                {enrollments.slice(0, 10).map((enrollment: any, idx: number) => (
                  <motion.div
                    variants={itemVariants}
                    key={idx}
                    className="flex justify-between items-start p-4 rounded-xl transition-all duration-200"
                    style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                  >
                    <div>
                      <h3 className="font-bold text-text">
                        {enrollment.trainee?.fullName || enrollment.trainee?.user?.email || "Unknown"}
                      </h3>
                      <p className="indus-label text-text-muted mt-1 flex items-center gap-2">
                        <span>Course: {enrollment.program?.name || "—"}</span>
                        <span>•</span>
                        <span>{enrollment.trainee?.district || "Unknown District"}</span>
                        <span>•</span>
                        <span>{formatDate(enrollment.enrolledAt)}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span
                        className="indus-label px-2 py-1 rounded text-white"
                        style={{ background: enrollment.status === 'COMPLETED' ? '#22c55e' : enrollment.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b' }}
                      >
                        {enrollment.status}
                      </span>
                      <a 
                        href={`/reports`}
                        onClick={(e) => {
                          e.preventDefault();
                          // Pass query params for the ReportGenerator to pick up (we will implement this in ReportGenerator)
                          // Or simply use window.location.href since it's a regular navigation
                          window.location.href = `/reports?level=trainee&subjectId=${enrollment.traineeId}`;
                        }}
                        className="text-xs font-semibold text-muted-foreground hover:text-[#ff4757] transition-colors uppercase tracking-widest"
                      >
                        View Report →
                      </a>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Create Course Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
              className="relative w-full max-w-lg rounded-2xl p-6"
              style={{ background: "#f0f2f5", boxShadow: "var(--shadow-floating)" }}
            >
              {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((pos) => (
                <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full`}
                  style={{ background: "radial-gradient(circle at 35% 35%, #d0d5de 0%, #c5cad4 40%, #b8bdc8 60%, #a8adb8 100%)", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(0,0,0,0.2)" }} aria-hidden />
              ))}
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-text-muted hover:text-[#ff4757] transition-colors p-1.5 rounded-lg hover:bg-recessed">
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold uppercase tracking-wider text-text mb-1">Create New Course</h2>
              <p className="text-sm font-medium text-text-muted mb-6">Enter the configuration details for your new training program.</p>

              {createError && (
                <div className="mb-4 p-3 rounded-lg text-sm font-bold text-[#ff4757]" style={{ background: "rgba(255,71,87,0.08)", boxShadow: "var(--shadow-recessed)" }}>
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="block indus-label text-text">Training Name *</label>
                  <Input required placeholder="e.g. Advanced Data Science" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block indus-label text-text">Description</label>
                  <Input placeholder="Brief description of the program" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block indus-label text-text">Duration (months)</label>
                    <Input type="number" min="1" placeholder="e.g. 6" value={formData.durationMonths} onChange={e => setFormData({ ...formData, durationMonths: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="block indus-label text-text">Sector</label>
                    <Input placeholder="e.g. IT, Healthcare" value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} />
                  </div>
                </div>
                <Button type="submit" fullWidth disabled={isCreating} className="mt-6">
                  {isCreating ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

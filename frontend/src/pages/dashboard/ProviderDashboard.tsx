import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useEffect, useState } from "react";
import { X, BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { auth } from "../../lib/auth";
import { formatDate } from "../../utils/formatters";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-8 text-foreground relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-foreground">Provider Dashboard</h1>
          <p className="text-muted-foreground font-bold mt-2">Manage your training programs and track trainee enrollments.</p>
        </div>
        <Button className="bg-primary hover:bg-secondary hover:border-secondary text-white font-bold uppercase tracking-wider border-2 border-primary transition-colors" onClick={() => setShowModal(true)}>
          Create New Course
        </Button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          variants={itemVariants}
          className="bg-white border-4 border-border cursor-pointer hover:bg-primary/5 hover:border-primary transition-colors group"
          onClick={() => window.location.href = '/dashboard/provider/courses'}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoadingCourses ? "—" : courses.length}
            </div>
            <p className="text-xs font-bold text-primary mt-1 uppercase">Click to view/manage courses</p>
          </CardContent>
        </Card>

        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" /> Total Trainees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoadingEnrollments ? "—" : enrollments.length}
            </div>
          </CardContent>
        </Card>

        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoadingEnrollments ? "—" : `${placementRate}%`}
            </div>
          </CardContent>
        </Card>

        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-destructive" /> Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoadingCourses ? "—" : "82.5"}
            </div>
            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">Provider Score</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-8">
        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="border-b-4 border-border pb-4 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-black uppercase text-foreground">Recent Trainee Enrollments</CardTitle>
            <a href="/dashboard/provider/trainees" className="text-sm font-bold text-primary hover:text-blue-600 uppercase tracking-wider">View All &rarr;</a>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingEnrollments ? (
              <div className="text-center py-6 text-muted-foreground font-bold">Loading enrollments...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-4 border-dashed border-border bg-muted">
                <p className="font-bold">No trainees enrolled yet.</p>
                <p className="text-xs font-bold uppercase mt-1">Trainees who submit training records will appear here.</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                {enrollments.slice(0, 10).map((enrollment: any, idx: number) => (
                  <motion.div variants={itemVariants} key={idx} className="flex justify-between items-start p-4 border-4 border-border bg-muted hover:bg-accent hover:border-accent hover:text-black transition-colors group">
                    <div>
                      <h3 className="font-black text-foreground">
                        {enrollment.trainee?.fullName || enrollment.trainee?.user?.email || "Unknown"}
                      </h3>
                      <p className="text-sm font-bold text-muted-foreground mt-1 flex items-center gap-2 uppercase">
                        <span>Course: {enrollment.program?.name || "—"}</span>
                        <span>•</span>
                        <span>{enrollment.trainee?.district || "Unknown District"}</span>
                        <span>•</span>
                        <span>{formatDate(enrollment.enrolledAt)}</span>
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-white border-2 border-border ${
                      enrollment.status === 'COMPLETED'
                        ? 'text-secondary'
                        : enrollment.status === 'IN_PROGRESS'
                        ? 'text-primary'
                        : 'text-accent'
                    }`}>
                      {enrollment.status}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Creation Modal */}
      <AnimatePresence>
        {showModal && (
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
              className="bg-white border-4 border-border w-full max-w-lg p-6 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black uppercase text-foreground mb-2">Create New Course</h2>
              <p className="text-sm font-bold text-muted-foreground mb-6">
                Enter the configuration details for your new training program.
              </p>

              {createError && (
                <div className="mb-4 p-3 border-4 border-destructive text-destructive font-bold text-sm bg-red-50">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Training Name *</label>
                  <Input
                    required
                    placeholder="e.g. Advanced Data Science"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">Description</label>
                  <Input
                    placeholder="Brief description of the program"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Duration (months)</label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 6"
                      value={formData.durationMonths}
                      onChange={e => setFormData({ ...formData, durationMonths: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Sector</label>
                    <Input
                      placeholder="e.g. IT, Healthcare"
                      value={formData.sector}
                      onChange={e => setFormData({ ...formData, sector: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary hover:border-secondary text-white font-bold uppercase tracking-wider border-2 border-primary transition-colors mt-6"
                  disabled={isCreating}
                >
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

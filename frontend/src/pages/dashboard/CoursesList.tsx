import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, BookOpen, Plus, ArrowLeft, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } }
};

export default function CoursesList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", description: "", durationMonths: "", sector: "IT" });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), search: debouncedSearch });
      const res: any = await api.get(`/courses/my-courses?${params.toString()}`);
      setCourses(res.data || res || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load courses.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [page, limit, debouncedSearch]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newCourse, durationMonths: parseInt(newCourse.durationMonths) || 1 };
      const res = await api.post("/courses", payload);
      setCourses(prev => [res, ...prev]);
      setIsAdding(false);
      setNewCourse({ name: "", description: "", durationMonths: "", sector: "IT" });
    } catch (err: any) {
      console.error(err);
      setError("Failed to create course.");
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
        </div>
        <p className="font-bold text-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ff4757]" />
        <p className="text-[#ff4757] font-bold">{error}</p>
        <Button onClick={fetchCourses} variant="secondary">Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chassis p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/provider')}
          className="flex items-center gap-1 text-text-muted hover:text-[#ff4757] transition-colors indus-label"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Header */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
          style={{ background: "#2d3436", boxShadow: "8px 8px 20px rgba(0,0,0,0.3)" }}
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="indus-led-green" />
              <span className="indus-label text-[#a8b2d1]">Provider Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Your Courses</h1>
            <p className="text-[#a8b2d1] mt-1 text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Manage and track your training programs.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-64">
              <search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsAdding(true)} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> New Course
            </Button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)", color: "#4a5568" }}>
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold uppercase text-text mb-2">No Courses Found</h2>
            <p className="text-text-muted font-medium">You haven't created any training programs yet.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card variants={itemVariants} key={course.id} showScrews className="flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-shadow-dark">
                  <CardTitle className="text-base font-bold text-text">{course.name}</CardTitle>
                  <span
                    className="indus-label text-white px-2 py-0.5 rounded w-max mt-1"
                    style={{ background: "#ff4757" }}
                  >
                    {course.sector}
                  </span>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1">
                  <p className="text-sm font-medium text-text-muted line-clamp-2">
                    {course.description || "No description provided."}
                  </p>
                  <div
                    className="flex justify-between items-center rounded-lg px-3 py-2"
                    style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                  >
                    <span className="indus-label text-text-muted">Duration</span>
                    <span className="font-bold text-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {course.durationMonths} months
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center rounded-lg px-3 py-2"
                    style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                  >
                    <span className="indus-label text-text-muted">Course ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {course.id.substring(0, 8)}...
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(course.id);
                        }}
                        className="text-text-muted hover:text-[#ff4757] transition-colors p-1"
                        title="Copy full ID"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 no-print">
            <Button 
              variant="secondary" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-text font-medium text-sm">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="secondary" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Add Course Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
                className="relative w-full max-w-md rounded-2xl p-6"
                style={{ background: "#f0f2f5", boxShadow: "var(--shadow-floating)" }}
              >
                {/* Screws */}
                {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((pos) => (
                  <div key={pos} className={`absolute ${pos} w-3 h-3 rounded-full`}
                    style={{ background: "radial-gradient(circle at 35% 35%, #d0d5de 0%, #c5cad4 40%, #b8bdc8 60%, #a8adb8 100%)", boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(0,0,0,0.2)" }}
                    aria-hidden />
                ))}
                <button onClick={() => setIsAdding(false)} className="absolute top-4 right-4 text-text-muted hover:text-[#ff4757] text-xl leading-none">✕</button>
                <h2 className="text-lg font-bold uppercase tracking-wider text-text mb-5">Create New Course</h2>

                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block indus-label text-text">Course Name</label>
                    <Input required placeholder="e.g. Full Stack Web Development" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block indus-label text-text">Sector</label>
                    <Input required placeholder="e.g. IT, Healthcare" value={newCourse.sector} onChange={(e) => setNewCourse({...newCourse, sector: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block indus-label text-text">Duration (Months)</label>
                    <Input required type="number" min="1" placeholder="e.g. 6" value={newCourse.durationMonths} onChange={(e) => setNewCourse({...newCourse, durationMonths: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block indus-label text-text">Description</label>
                    <textarea
                      className="w-full h-24 rounded-lg p-3 text-sm font-medium resize-none transition-all"
                      style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)", border: "none", fontFamily: "'JetBrains Mono', monospace", color: "#2d3436", outline: "none" }}
                      onFocus={(e) => { e.target.style.boxShadow = "var(--shadow-recessed), 0 0 0 2px #ff4757"; }}
                      onBlur={(e) => { e.target.style.boxShadow = "var(--shadow-recessed)"; }}
                      placeholder="Brief description of the course"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} fullWidth>
                    {isSubmitting ? "Creating..." : "Create Course"}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

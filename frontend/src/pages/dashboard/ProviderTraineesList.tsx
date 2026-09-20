import React, { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Users, Search, ArrowLeft, GraduationCap } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatters";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } }
};

export default function ProviderTraineesList() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTrainees = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res: any = await auth.getProviderEnrollments(page, limit, debouncedSearch);
      setEnrollments(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load trainees.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTrainees(); }, [page, limit, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
        </div>
        <p className="font-bold text-text" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Loading trainees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-chassis p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ff4757]" />
        <p className="text-[#ff4757] font-bold">{error}</p>
        <Button onClick={fetchTrainees} variant="secondary">Retry</Button>
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
              <span className="indus-label text-[#a8b2d1]">Trainee Roster</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Your Enrolled Trainees</h1>
            <p className="text-[#a8b2d1] mt-1 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> View and monitor trainees enrolled in your courses.
            </p>
          </div>
          {/* Search input — recessed */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted z-10" />
            <Input
              placeholder="Search by name, email, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Trainees List */}
        {enrollments.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)", color: "#4a5568" }}>
              <Users className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold uppercase text-text mb-2">No Trainees Found</h2>
            <p className="text-text-muted font-medium">You don't have any trainees enrolled yet.</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted font-medium">No trainees match your search.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Card variants={itemVariants} key={enrollment.id} showScrews className="flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-shadow-dark">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold text-text">
                      {enrollment.trainee?.fullName || "Unknown"}
                    </CardTitle>
                    <span
                      className="indus-label px-2 py-0.5 rounded text-white text-[10px]"
                      style={{ background: enrollment.status === 'COMPLETED' ? '#22c55e' : enrollment.status === 'IN_PROGRESS' ? '#3b82f6' : '#f59e0b' }}
                    >
                      {enrollment.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-text-muted mt-1">{enrollment.trainee?.user?.email}</p>
                </CardHeader>
                
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-text">{enrollment.program?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <span className="font-mono text-xs bg-recessed px-2 py-1 rounded">Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => { window.location.href = `/reports?level=trainee&subjectId=${enrollment.traineeId}`; }}
                  >
                    View Report & Analytics
                  </Button>
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
      </div>
    </div>
  );
}

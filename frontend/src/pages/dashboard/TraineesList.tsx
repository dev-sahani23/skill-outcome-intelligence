import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Users, Search, ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } }
};

export default function TraineesList() {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchTrainees = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/trainees");
      setTrainees(res.trainees || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load trainees.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTrainees(); }, []);

  const filteredTrainees = trainees.filter(t =>
    t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
        </div>
        <p className="font-bold text-[#2d3436]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Loading trainees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ff4757]" />
        <p className="text-[#ff4757] font-bold">{error}</p>
        <Button onClick={fetchTrainees} variant="secondary">Retry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center gap-1 text-[#4a5568] hover:text-[#ff4757] transition-colors indus-label"
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
              <span className="indus-label text-[#a8b2d1]">Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">All Trainees</h1>
            <p className="text-[#a8b2d1] mt-1 text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> View and monitor trainee progress across all providers.
            </p>
          </div>
          {/* Search input — recessed */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#4a5568] z-10" />
            <Input
              placeholder="Search trainees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredTrainees.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
              <Users className="w-7 h-7 text-[#4a5568]" />
            </div>
            <p className="font-bold text-[#2d3436]">No trainees found.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainees.map((trainee) => (
              <Card variants={itemVariants} key={trainee.id} showScrews className="flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-[#babecc]">
                  <CardTitle className="text-base font-bold text-[#2d3436]">{trainee.fullName || "Unnamed Trainee"}</CardTitle>
                  <p className="indus-label text-[#4a5568]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{trainee.user?.email}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {[
                    { label: "District", value: trainee.district || "N/A" },
                    { label: "Enrollments", value: trainee.enrollments?.length || 0 },
                    {
                      label: "Skill Score",
                      value: trainee.skillAssessments?.[0] ? 100 - trainee.skillAssessments[0].skillGapScore : "N/A",
                      colored: true
                    },
                  ].map(({ label, value, colored }) => (
                    <div key={label} className="flex justify-between items-center rounded-lg px-3 py-2" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                      <span className="indus-label text-[#4a5568]">{label}</span>
                      <span
                        className="font-bold text-sm"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: colored ? "#22c55e" : "#2d3436"
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

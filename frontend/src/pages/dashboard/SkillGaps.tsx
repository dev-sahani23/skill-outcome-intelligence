import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, AlertTriangle, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
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

const statusLedColor: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#ff4757",
  DISMISSED: "#4a5568",
};

export default function SkillGaps() {
  const navigate = useNavigate();
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchFlags = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/anomaly-flags");
      setFlags(res.flags || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load anomaly flags.");
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFlags(); }, []);

  const handleAction = async (id: string, status: "CONFIRMED" | "DISMISSED") => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/anomaly-flags/${id}`, { status });
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (err: any) {
      console.error(err);
      alert("Failed to update flag status.");
    } finally { setActionLoading(null); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}>
          <Loader2 className="w-8 h-8 animate-spin text-[#ff4757]" />
        </div>
        <p className="font-bold text-[#2d3436]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Loading anomaly flags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#e0e5ec] p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#ff4757]" />
        <p className="text-[#ff4757] font-bold">{error}</p>
        <Button onClick={fetchFlags} variant="secondary">Retry</Button>
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
              <span className="indus-led-red" aria-label="Alerts active" />
              <span className="indus-label text-[#a8b2d1]">Anomaly Detection System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Anomaly & Skill Gap Alerts</h1>
            <p className="text-[#a8b2d1] mt-1 text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Review AI-detected inconsistencies in provider reporting.
            </p>
          </div>
          {/* Live flag count */}
          <div
            className="px-5 py-3 rounded-xl text-center"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p className="text-3xl font-bold text-[#ff4757]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {flags.filter(f => f.status === "PENDING").length}
            </p>
            <p className="indus-label text-[#a8b2d1]">Pending Flags</p>
          </div>
        </div>

        {flags.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)", color: "#22c55e" }}>
              <CheckCircle className="w-7 h-7" />
            </div>
            <p className="font-bold text-[#2d3436]">No anomalies detected.</p>
            <p className="indus-label text-[#4a5568] mt-1">Everything looks good.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flags.map((flag) => (
              <Card variants={itemVariants} key={flag.id} showScrews className="relative overflow-hidden">
                {/* Status LED bar — top edge */}
                <div
                  className="absolute top-0 left-8 right-8 h-1 rounded-full"
                  style={{ background: statusLedColor[flag.status] || "#4a5568" }}
                  aria-hidden
                />

                <CardHeader className="pb-2 border-b border-[#babecc] pt-5">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-sm font-bold text-[#2d3436]">
                        {flag.anomalyType.replace(/_/g, " ")}
                      </CardTitle>
                      <p className="indus-label text-[#4a5568] mt-1">
                        Provider: {flag.provider?.instituteName || flag.provider?.user?.email}
                      </p>
                    </div>
                    {/* Status badge with LED dot */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 rounded-lg px-2.5 py-1" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusLedColor[flag.status] || "#4a5568" }} />
                      <span className="indus-label text-[#2d3436]">{flag.status}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  <p
                    className="text-sm font-medium text-[#2d3436] p-3 rounded-lg"
                    style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
                  >
                    {flag.description}
                  </p>

                  {flag.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleAction(flag.id, "CONFIRMED")}
                        disabled={actionLoading === flag.id}
                        className="flex-1"
                        size="sm"
                      >
                        {actionLoading === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                      </Button>
                      <Button
                        onClick={() => handleAction(flag.id, "DISMISSED")}
                        disabled={actionLoading === flag.id}
                        variant="secondary"
                        className="flex-1"
                        size="sm"
                      >
                        {actionLoading === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dismiss"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

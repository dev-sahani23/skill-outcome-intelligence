import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleAction = async (id: string, status: "CONFIRMED" | "DISMISSED") => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/anomaly-flags/${id}`, { status });
      // Update local state
      setFlags(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (err: any) {
      console.error(err);
      alert("Failed to update flag status.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading anomaly flags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{error}</p>
        <Button onClick={fetchFlags} variant="outline" className="border-4 border-border text-foreground">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-6 text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-foreground">
              Anomaly & Skill Gap Alerts
            </h1>
            <p className="text-muted-foreground font-bold mt-2 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4" /> Review AI-detected inconsistencies in provider reporting.
            </p>
          </div>
        </div>

        {flags.length === 0 ? (
          <div className="text-center py-12 bg-white border-4 border-border">
            <CheckCircle className="w-12 h-12 mx-auto text-secondary mb-4" />
            <p className="text-muted-foreground font-bold">No anomalies detected. Everything looks good.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flags.map((flag) => (
              <Card variants={itemVariants} key={flag.id} className="bg-white border-4 border-border flex flex-col justify-between relative overflow-hidden">
                {flag.status === "PENDING" && <div className="absolute top-0 left-0 w-full h-2 bg-accent" />}
                {flag.status === "CONFIRMED" && <div className="absolute top-0 left-0 w-full h-2 bg-destructive" />}
                {flag.status === "DISMISSED" && <div className="absolute top-0 left-0 w-full h-2 bg-muted-foreground" />}
                
                <CardHeader className="pb-2 border-b-4 border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-black uppercase text-foreground">{flag.anomalyType.replace(/_/g, " ")}</CardTitle>
                      <p className="text-xs font-bold text-muted-foreground uppercase mt-1">Provider: {flag.provider?.instituteName || flag.provider?.user?.email}</p>
                    </div>
                    <span className={`px-2 py-1 border-2 border-border text-[10px] font-bold uppercase tracking-wider ${
                      flag.status === 'PENDING' ? 'bg-white text-accent border-accent' :
                      flag.status === 'CONFIRMED' ? 'bg-white text-destructive border-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {flag.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm font-bold text-foreground bg-muted p-3 border-4 border-border">
                    {flag.description}
                  </p>
                  
                  {flag.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleAction(flag.id, "CONFIRMED")}
                        disabled={actionLoading === flag.id}
                        className="flex-1 bg-destructive hover:bg-red-500 text-white font-bold uppercase tracking-wider border-2 border-destructive transition-colors"
                      >
                        {actionLoading === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                      </Button>
                      <Button 
                        onClick={() => handleAction(flag.id, "DISMISSED")}
                        disabled={actionLoading === flag.id}
                        className="flex-1 bg-white hover:bg-accent text-foreground hover:text-black border-2 border-border hover:border-accent font-bold uppercase tracking-wider transition-colors"
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

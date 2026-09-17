import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, AlertTriangle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#7048e8]" />
        <p className="text-lg">Loading anomaly flags...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchFlags} variant="outline" className="border-slate-700 text-slate-300">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#7048e8]">
              Anomaly & Skill Gap Alerts
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm sm:text-base">
              <AlertTriangle className="w-4 h-4" /> Review AI-detected inconsistencies in provider reporting.
            </p>
          </div>
        </div>

        {flags.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
            <p className="text-slate-400">No anomalies detected. Everything looks good.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flags.map((flag) => (
              <Card key={flag.id} className="bg-slate-900 border-slate-800 flex flex-col justify-between relative overflow-hidden">
                {flag.status === "PENDING" && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />}
                {flag.status === "CONFIRMED" && <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />}
                {flag.status === "DISMISSED" && <div className="absolute top-0 left-0 w-full h-1 bg-slate-600" />}
                
                <CardHeader className="pb-2 border-b border-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-slate-200">{flag.anomalyType.replace(/_/g, " ")}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">Provider: {flag.provider?.instituteName || flag.provider?.user?.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      flag.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                      flag.status === 'CONFIRMED' ? 'bg-rose-500/10 text-rose-500' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {flag.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded border border-slate-800">
                    {flag.description}
                  </p>
                  
                  {flag.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleAction(flag.id, "CONFIRMED")}
                        disabled={actionLoading === flag.id}
                        className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20"
                      >
                        {actionLoading === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                      </Button>
                      <Button 
                        onClick={() => handleAction(flag.id, "DISMISSED")}
                        disabled={actionLoading === flag.id}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      >
                        {actionLoading === flag.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Dismiss"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Loader2, ShieldCheck, XCircle, MapPin, Building, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicVerify() {
  const { hash } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hash) {
      setError("No verification hash provided.");
      setIsLoading(false);
      return;
    }

    import("../../lib/api").then(({ api }) => {
      api.get(`/public/verify/${hash}`)
        .then((data) => {
          setResult(data);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "Invalid or tampered certificate hash.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    });
  }, [hash]);

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-chassis p-6 sm:p-8 md:p-12 flex flex-col items-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none indus-schematic-bg opacity-60" aria-hidden />
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center space-y-4 text-text-muted min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff4757]" />
          <p className="indus-label">Verifying cryptographic hash on the network...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !result) {
    return (
      <PageWrapper>
        <Card elevated className="w-full p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <XCircle className="w-10 h-10 text-[#ff4757]" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Verification Failed</h2>
          <p className="text-text-muted font-medium mb-8 max-w-md leading-relaxed">
            {error || "The provided certificate hash could not be verified on the ledger."}
          </p>
          <Button onClick={() => navigate("/")} variant="secondary">
            Return to Home
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-text-muted hover:text-[#ff4757] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="indus-led-green"></span>
            <span className="indus-label text-[#22c55e]">Verified on Ledger</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
            Public Verification
          </h1>
          <p className="text-text-muted font-medium text-sm sm:text-base">
            Cryptographically signed and tamper-proof skill record.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="w-full">
        <Card elevated className="w-full overflow-hidden p-0">
          <div className="bg-[#22c55e] text-white p-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-sm">Valid Certificate</span>
          </div>
          <CardContent className="p-6 sm:p-8 space-y-8 pt-8">
            <div className="text-center">
              <p className="indus-label text-text-muted mb-1">Trainee Name</p>
              <h2 className="text-3xl font-bold text-text mb-1">{result.traineeName}</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                <p className="indus-label text-text-muted mb-1 flex items-center gap-1">
                  <Building className="w-4 h-4" /> Issuing Institute
                </p>
                <p className="font-bold text-text text-base">{result.instituteName}</p>
              </div>
              
              <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                <p className="indus-label text-text-muted mb-1">Training Program</p>
                <p className="font-bold text-text text-base">{result.programName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                  <p className="indus-label text-text-muted mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Completion Date
                  </p>
                  <p className="font-bold text-text font-mono text-sm">
                    {new Date(result.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                  <p className="indus-label text-text-muted mb-1">Verification Hash</p>
                  <p className="font-bold text-text-muted font-mono text-xs break-all">
                    {hash}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}

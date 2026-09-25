import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatDate } from "../../utils/formatters";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Download, MapPin, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

export default function OutcomePassport() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [outcome, setOutcome] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [userRes, enrollmentsRes, outcomesRes] = await Promise.all([
        auth.getMe(),
        auth.getMyEnrollments(),
        auth.getMyOutcomes(),
      ]);

      setUser(userRes.user);

      const certifiedEnrollment = enrollmentsRes?.enrollments?.find((e: any) => e.isCertified && e.certificateId);
      setEnrollment(certifiedEnrollment || null);

      const latestOutcome = outcomesRes && outcomesRes.length > 0 ? outcomesRes[0] : null;
      setOutcome(latestOutcome);

    } catch (err: any) {
      console.error(err);
      setError("Failed to load Outcome Passport. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center space-y-4 text-text-muted min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-[#ff4757]" />
          <p className="indus-label">{t('outcomePassport.loading')}</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Card elevated className="max-w-md w-full p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-[#ff4757] mb-4" />
          <p className="text-lg text-text font-bold mb-6">{t('outcomePassport.error')}</p>
          <Button onClick={fetchData} variant="secondary">
            {t('outcomePassport.retry')}
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  if (!enrollment) {
    return (
      <PageWrapper>
      <div className="w-full max-w-xl mb-8 flex justify-between items-center no-print">
          <button onClick={() => navigate('/dashboard/trainee')} className="flex items-center text-text-muted hover:text-[#ff4757] transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('outcomePassport.backToDashboard')}
          </button>
          <LanguageSelector />
        </div>
        
        <Card elevated className="w-full max-w-xl p-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
            <ShieldCheck className="w-10 h-10 text-[#a0aec0]" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">{t('outcomePassport.noVerifiedCert')}</h2>
          <p className="text-text-muted font-medium mb-8 max-w-md leading-relaxed">
            {t('outcomePassport.noVerifiedCertDesc')}
          </p>
          <Button onClick={() => navigate('/dashboard/trainee')} variant="default" fullWidth>
            {t('outcomePassport.returnToDashboard')}
          </Button>
        </Card>
      </PageWrapper>
    );
  }

  const fullName = user?.traineeProfile?.fullName || t('outcomePassport.traineeFallback');
  const district = user?.traineeProfile?.district || t('outcomePassport.unknownDistrict');
  const courseName = enrollment.program?.name || enrollment.trainingNumber || t('outcomePassport.certifiedCourse');
  const certDate = enrollment.completedAt ? formatDate(enrollment.completedAt) : "N/A";
  const verificationHash = enrollment.certificateId;
  const verifyUrl = `${window.location.origin}/verify/${verificationHash}`;

  const skillScore = user?.traineeProfile?.skillAssessments?.[0]?.skillGapScore
    ? 100 - user?.traineeProfile?.skillAssessments?.[0]?.skillGapScore
    : "N/A";

  const getOutcomeText = () => {
    if (!outcome) return "Pending Verification";
    if (outcome.type === "FORMAL_EMPLOYMENT" || outcome.type === "INFORMAL_EMPLOYMENT") {
      return `${outcome.designation || "Employed"} at ${outcome.employerName || "Unknown"}`;
    }
    if (outcome.type === "SELF_EMPLOYED") return "Self-Employed";
    if (outcome.type === "APPRENTICESHIP") return "Apprenticeship";
    return "Seeking Opportunities";
  };

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-3xl flex justify-between items-start mb-8">
        <div>
          <button
            onClick={() => navigate('/dashboard/trainee')}
            className="flex items-center text-text-muted hover:text-[#ff4757] transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('outcomePassport.backToDashboard')}
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <span className="indus-led-green"></span>
            <span className="indus-label text-[#22c55e]">Verified Identity</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
            {t('outcomePassport.title')}
          </h1>
          <p className="text-text-muted font-medium text-sm sm:text-base">
            Your universally verifiable proof of skill and employment.
          </p>
        </div>
        <div className="no-print mt-4">
          <LanguageSelector />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="w-full max-w-3xl mb-8">
        <Card elevated className="w-full overflow-hidden p-0">
          <CardContent className="p-0 flex flex-col md:flex-row">
            
            {/* Left Column: Details */}
            <div className="flex-1 p-8 sm:p-10 space-y-8">
              <div>
                <p className="indus-label text-text-muted mb-1">Passport Holder</p>
                <h2 className="text-3xl font-bold text-text mb-1">{fullName}</h2>
                <p className="text-sm font-medium text-text-muted flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {district}, MH
                </p>
              </div>

              <div className="space-y-4">
                {/* Recessed Info Blocks */}
                <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                  <p className="indus-label text-text-muted mb-1">{t('outcomePassport.certifiedCourse')}</p>
                  <p className="font-bold text-text text-base mb-1">{courseName}</p>
                  <p className="text-sm font-mono text-text-muted">{t('outcomePassport.completionDate')}: {certDate}</p>
                </div>

                <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                  <p className="indus-label text-text-muted mb-1 flex items-center gap-1">
                    <Briefcase className="w-4 h-4" /> Employment Status
                  </p>
                  <p className="font-bold text-[#3b82f6] text-base mb-1">{getOutcomeText()}</p>
                  {outcome?.monthlyWage && (
                    <p className="text-sm font-mono text-text">
                      {t('outcomePassport.salary')}: {formatINR(outcome.monthlyWage)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                    <p className="indus-label text-text-muted mb-1">{t('outcomePassport.skillVerificationScore')}</p>
                    <p className="font-bold text-[#22c55e] text-2xl font-mono">{skillScore}</p>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}>
                    <p className="indus-label text-text-muted mb-1">Issuer</p>
                    <p className="font-bold text-text text-sm truncate" title={enrollment.program?.provider?.instituteName || "Govt of MH"}>
                      {enrollment.program?.provider?.instituteName || "Govt of MH"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: QR Code */}
            <div className="flex flex-col items-center justify-center p-8 sm:p-10 shrink-0 md:w-[320px] bg-[#d8dde8] relative overflow-hidden">
               {/* Vertical divider line for desktop */}
              <div className="hidden md:block absolute left-0 top-12 bottom-12 w-px bg-linear-to-b from-transparent via-[#babecc] to-transparent" />
              
              <div 
                className="p-6 rounded-2xl bg-[#f0f2f5] mb-6"
                style={{ boxShadow: "var(--shadow-floating)" }}
              >
                <div className="p-4 bg-white rounded-lg shadow-inner">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
                <span className="font-bold text-text">Cryptographically Secure</span>
              </div>
              <p className="indus-label text-text-muted text-center max-w-50">
                {t('outcomePassport.scanToVerify')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="w-full max-w-3xl flex justify-end no-print">
        <Button variant="secondary" className="group" onClick={() => window.print()}>
          <Download className="w-5 h-5 mr-2 text-text-muted group-hover:text-[#ff4757] transition-colors" /> 
          {t('outcomePassport.downloadPdf')}
        </Button>
      </motion.div>
    </PageWrapper>
  );
}

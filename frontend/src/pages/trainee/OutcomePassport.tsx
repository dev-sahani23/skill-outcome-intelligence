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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">{t('outcomePassport.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{t('outcomePassport.error')}</p>
        <Button onClick={fetchData} variant="outline" className="border-4 border-border text-foreground">
          {t('outcomePassport.retry')}
        </Button>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-muted p-6 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg mb-8 flex justify-between items-center">
          <button onClick={() => navigate('/dashboard/trainee')} className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('outcomePassport.backToDashboard')}
          </button>
          <LanguageSelector />
        </div>
        <div className="text-center p-8 bg-white border-4 border-border max-w-lg w-full">
          <ShieldCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase text-foreground mb-2">{t('outcomePassport.noVerifiedCert')}</h2>
          <p className="text-muted-foreground font-bold mb-6">
            {t('outcomePassport.noVerifiedCertDesc')}
          </p>
          <Button onClick={() => navigate('/dashboard/trainee')} className="bg-primary hover:bg-secondary w-full text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors">
            {t('outcomePassport.returnToDashboard')}
          </Button>
        </div>
      </div>
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
    <div className="min-h-screen bg-muted p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-foreground flex flex-col items-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md md:max-w-xl flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/dashboard/trainee')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors mb-4 text-sm font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> {t('outcomePassport.backToDashboard')}
          </button>
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-foreground mb-2">
            {t('outcomePassport.title')}
          </h1>
          <p className="text-muted-foreground font-bold text-sm sm:text-base">
            Your universally verifiable proof of skill and employment.
          </p>
        </div>
        <LanguageSelector />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="w-full max-w-md md:max-w-xl">
      <Card className="w-full bg-white border-4 border-border overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

        <CardContent className="p-6 sm:p-8 pt-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-1 space-y-6 w-full">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Passport Holder</p>
              <h2 className="text-2xl font-black text-foreground uppercase">{fullName}</h2>
              <p className="text-sm font-bold text-muted-foreground flex items-center gap-1 mt-1 uppercase">
                <MapPin className="w-3.5 h-3.5" /> {district}, MH
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-3 border-4 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('outcomePassport.certifiedCourse')}</p>
                <p className="font-black text-foreground text-sm sm:text-base uppercase">{courseName}</p>
                <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">{t('outcomePassport.completionDate')}: {certDate}</p>
              </div>

              <div className="bg-muted p-3 border-4 border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Employment Status
                </p>
                <p className="font-black text-secondary text-sm sm:text-base uppercase">{getOutcomeText()}</p>
                {outcome?.monthlyWage && (
                  <p className="text-foreground font-bold text-xs mt-1 uppercase">{t('outcomePassport.salary')}: {formatINR(outcome.monthlyWage)}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted p-3 border-4 border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{t('outcomePassport.skillVerificationScore')}</p>
                  <p className="font-black text-foreground text-lg">{skillScore}</p>
                </div>
                <div className="bg-muted p-3 border-4 border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Issuer</p>
                  <p className="font-black text-foreground text-sm truncate uppercase" title={enrollment.program?.provider?.instituteName || "Govt of MH"}>
                    {enrollment.program?.provider?.instituteName || "Govt of MH"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 w-full md:w-auto shrink-0 border-t-4 md:border-t-0 md:border-l-4 border-border pt-6 md:pt-0 md:pl-8">
            <div className="bg-white p-3 border-4 border-border">
              <QRCodeSVG
                value={verifyUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest max-w-[160px]">
              {t('outcomePassport.scanToVerify')}
            </p>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }} className="w-full max-w-md md:max-w-xl flex gap-4">
        <Button className="flex-1 bg-white hover:bg-accent text-foreground hover:text-black border-4 border-border hover:border-accent font-bold uppercase tracking-wider transition-colors">
          <Download className="w-4 h-4 mr-2" /> {t('outcomePassport.downloadPdf')}
        </Button>
      </motion.div>
    </div>
  );
}

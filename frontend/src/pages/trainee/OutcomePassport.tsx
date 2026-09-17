import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck, Download, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";

export default function OutcomePassport() {
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
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-lg">Generating Outcome Passport...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchData} variant="outline" className="border-slate-700 text-slate-300">
          Retry
        </Button>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 md:p-8 flex flex-col items-center">
        <div className="w-full max-w-lg mb-8">
          <button onClick={() => navigate('/dashboard/trainee')} className="flex items-center text-slate-400 hover:text-slate-200 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
        </div>
        <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-lg w-full">
          <ShieldCheck className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-200 mb-2">No Verified Certifications</h2>
          <p className="text-slate-400 mb-6">
            You don't have any certified training records yet. Complete a course and update your training details to generate your Outcome Passport.
          </p>
          <Button onClick={() => navigate('/dashboard/trainee')} className="bg-indigo-600 hover:bg-indigo-700 w-full">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const fullName = user?.traineeProfile?.fullName || "Trainee";
  const district = user?.traineeProfile?.district || "Unknown District";
  const courseName = enrollment.program?.name || enrollment.trainingNumber || "Certified Course";
  const certDate = enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : "N/A";
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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 text-slate-100 flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-xl">
        <button
          onClick={() => navigate('/dashboard/trainee')}
          className="flex items-center text-slate-400 hover:text-slate-200 transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
          Outcome Passport
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Your universally verifiable proof of skill and employment.
        </p>
      </div>

      <Card className="w-full max-w-md md:max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-2xl shadow-emerald-900/10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

        <CardContent className="p-6 sm:p-8 pt-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-1 space-y-6 w-full">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Passport Holder</p>
              <h2 className="text-2xl font-bold text-white">{fullName}</h2>
              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {district}, MH
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                <p className="text-xs text-slate-500 mb-1">Certified Course</p>
                <p className="font-semibold text-slate-200 text-sm sm:text-base">{courseName}</p>
                <p className="text-xs text-slate-400 mt-0.5">Issued: {certDate}</p>
              </div>

              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" /> Employment Status
                </p>
                <p className="font-semibold text-emerald-400 text-sm sm:text-base">{getOutcomeText()}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Verified Score</p>
                  <p className="font-bold text-slate-200 text-lg">{skillScore}</p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                  <p className="text-xs text-slate-500 mb-1">Issuer</p>
                  <p className="font-semibold text-slate-200 text-sm truncate" title={enrollment.program?.provider?.instituteName || "Govt of MH"}>
                    {enrollment.program?.provider?.instituteName || "Govt of MH"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
            <div className="bg-white p-3 rounded-xl shadow-inner">
              <QRCodeSVG
                value={verifyUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest max-w-[160px]">
              Scan to Verify Authenticity
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="w-full max-w-md md:max-w-xl flex gap-4">
        <Button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
          <Download className="w-4 h-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

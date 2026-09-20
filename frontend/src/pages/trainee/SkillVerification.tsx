import React, { useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Award, Sparkles, AlertCircle, HelpCircle, BookOpen, Clock, Target, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSelector from "@/components/LanguageSelector";

interface VerificationQuestion {
  id: string;
  question: string;
}

interface PerSkillResult {
  skill: string;
  status: "verified" | "partially_verified" | "gap";
  reasoning: string;
}

interface AnalysisResult {
  perSkillResults: PerSkillResult[];
  overallSkillGaps: string[];
  skillGapScore: number;
  verificationConfidence: number;
  summary: string;
  recommendedPathways?: {
    courseName: string;
    reasoning: string;
    skillsAddressed: string[];
    estimatedDuration: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    isFree: boolean;
  }[];
}

export default function SkillVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 State
  const [skillsStr, setSkillsStr] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);

  // Step 2 State
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 3 State
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length === 0) {
        throw new Error("Please enter at least one skill.");
      }

      const payload = {
        claimedSkills: skillsArray,
        claimedCertifications: [],
        claimedProjects: [],
        claimedCourses: [],
      };

      const data = await api.post("/trainees/skill-assessment/start", payload);
      setAssessmentId(data.assessmentId);
      setQuestions(data.questions);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!assessmentId) throw new Error("Missing assessment ID");

      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        answerText: answers[q.id] || "No answer provided",
      }));

      const data = await api.post(`/trainees/skill-assessment/${assessmentId}/submit`, { answers: answersPayload });
      setAnalysis(data.analysis);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-chassis indus-schematic-bg p-6 md:p-8 space-y-8 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-[#f0f2f5] p-6 rounded-2xl shadow-(--shadow-floating) border border-white/40 gap-4">
        <div>
          <div className="flex justify-between w-full md:w-auto items-center mb-3">
            <button
              onClick={() => navigate('/dashboard/trainee')}
              className="flex items-center text-text-muted hover:text-[#ff4757] transition-colors text-sm font-bold uppercase tracking-wider bg-chassis px-3 py-1.5 rounded-lg shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('outcomePassport.backToDashboard')}
            </button>
            <div className="md:hidden block">
              <LanguageSelector />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="indus-led-red"></span>
            <span className="indus-label text-[#ff4757]">AI Diagnostic</span>
          </div>

          <h1 className="text-3xl font-bold text-text tracking-tight">
            {t('skillVerification.title')}
          </h1>
          <p className="text-text-muted font-medium mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4757]" /> {t('skillVerification.subtitle')}
          </p>
        </div>
        <div className="hidden md:block">
          <LanguageSelector />
        </div>
      </div>

      {error && (
        <div className="bg-white border border-[#ff4757] text-[#ff4757] font-bold p-4 rounded-xl shadow-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Step 1: Claim Skills */}
        {step === 1 && (
          <Card className="relative overflow-hidden border border-white/40">
            <CardHeader className="border-b border-[#d1d9e6] bg-white/40 pb-4">
              <CardTitle className="text-xl font-bold text-text flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-[#ff4757] rounded-full text-white shadow-(--shadow-btn-accent) text-sm">1</span>
                {t('skillVerification.step1.title').replace('Step 1: ', '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-3">
                  <label className="indus-label text-text">
                    {t('skillVerification.step1.title').replace('Step 1: ', '')} (Comma separated)
                  </label>
                  <Input
                    className="indus-input w-full"
                    type="text"
                    placeholder={t('skillVerification.step1.inputPlaceholder')}
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-sm font-medium text-text-muted pl-1">{t('skillVerification.step1.description')}</p>
                </div>
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('skillVerification.step1.generatingBtn') : t('skillVerification.step1.generateBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Answer Questions */}
        {step === 2 && (
          <Card className="relative overflow-hidden border border-white/40">
            <CardHeader className="border-b border-[#d1d9e6] bg-white/40 pb-4">
              <CardTitle className="text-xl font-bold text-text flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-[#ff4757] rounded-full text-white shadow-(--shadow-btn-accent) text-sm">2</span>
                {t('skillVerification.step2.title').replace('Step 2: ', '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmitAnswers}>
                <p className="mb-6 font-medium text-text-muted text-sm bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]">
                  Please answer the following verification questions based on your knowledge and experience.
                </p>

                <div className="space-y-6 mb-8">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-6 bg-chassis rounded-2xl shadow-(--shadow-recessed) space-y-4">
                      <label className="text-base font-bold text-text flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 bg-white p-2 rounded-lg shadow-sm border border-[#e2e8f0]">
                          <HelpCircle className="w-5 h-5 text-[#3b82f6]" />
                        </span>
                        <span className="leading-snug pt-1">{idx + 1}. {q.question}</span>
                      </label>
                      <textarea
                        className="indus-input w-full min-h-30 rounded-xl px-4 py-4 resize-y"
                        rows={4}
                        placeholder="Type your answer here..."
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        disabled={loading}
                        required
                      />
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? t('skillVerification.step2.analyzingBtn') : t('skillVerification.step2.submitBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Analysis Results */}
        {step === 3 && analysis && (
          <Card className="relative overflow-hidden border border-white/40">
            <CardHeader className="border-b border-[#d1d9e6] bg-white/40 pb-4">
              <CardTitle className="text-xl font-bold text-text flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-[#22c55e] rounded-full text-white shadow-(--shadow-btn-accent) text-sm">3</span>
                {t('skillVerification.step3.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <div className="p-6 rounded-2xl bg-white shadow-sm border border-[#e2e8f0] flex flex-col justify-center items-center text-center">
                  <h3 className="indus-label text-text-muted mb-3">
                    {t('skillVerification.step3.proficiencyScore')}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-6xl font-black ${analysis.skillGapScore < 30 ? 'text-[#22c55e]' : analysis.skillGapScore < 70 ? 'text-[#f59e0b]' : 'text-[#ff4757]'}`}>
                      {100 - analysis.skillGapScore}
                    </p>
                    <span className="text-[#a0aec0] font-bold text-xl">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-chassis rounded-2xl shadow-(--shadow-recessed) mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="indus-led-green"></span>
                  <p className="indus-label text-text">Diagnostic Summary</p>
                </div>
                <p className="font-medium text-text-muted leading-relaxed text-sm">{analysis.summary}</p>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <Award className="w-6 h-6 text-[#ff4757]" /> 
                <h3 className="text-xl font-bold text-text">
                  {t('skillVerification.step3.skillBreakdown')}
                </h3>
              </div>

              <div className="space-y-4 mb-10">
                {analysis.perSkillResults.map((result, idx) => {
                  const isVerified = result.status === "verified";
                  const isPartial = result.status === "partially_verified";
                  const bgColor = isVerified ? "bg-[#22c55e]/10 text-[#22c55e]" : isPartial ? "bg-[#f59e0b]/10 text-[#f59e0b]" : "bg-[#ff4757]/10 text-[#ff4757]";
                  const iconColor = isVerified ? "text-[#22c55e]" : isPartial ? "text-[#f59e0b]" : "text-[#ff4757]";

                  return (
                    <div key={idx} className="p-5 rounded-xl bg-white border border-[#e2e8f0] shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-text">{result.skill}</span>
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md ${bgColor}`}>
                          {result.status.replace("_", " ")}
                        </span>
                      </div>

                      {result.status === "gap" && (
                        <div className="p-4 bg-[#f8fafc] rounded-lg mt-3 text-sm font-medium text-text-muted flex items-start gap-3 border border-[#e2e8f0]">
                          <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
                          <span><strong className="text-text font-bold">{t('skillVerification.step3.reasoning')}:</strong> {result.reasoning}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {analysis.recommendedPathways && analysis.recommendedPathways.length > 0 && (
                <div className="mt-10 border-t border-[#d1d9e6] pt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Target className="w-6 h-6 text-[#ff4757]" />
                    <h3 className="text-xl font-bold text-text">
                      {analysis.overallSkillGaps.length === 0 ? t('skillVerification.step3.advanceSkillsTitle') : t('skillVerification.step3.careerPathwayTitle')}
                    </h3>
                  </div>
                  
                  <div className="space-y-5">
                    {analysis.recommendedPathways.map((pathway, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-chassis shadow-(--shadow-recessed) relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#3b82f6]"></div>
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-lg font-bold text-text">{pathway.courseName}</span>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white shadow-sm border border-[#e2e8f0] ${pathway.difficulty === 'beginner' ? 'text-[#22c55e]' : pathway.difficulty === 'intermediate' ? 'text-[#f59e0b]' : 'text-[#ff4757]'}`}>
                              {pathway.difficulty}
                            </span>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-white shadow-sm border border-[#e2e8f0] ${pathway.isFree ? 'text-[#3b82f6]' : 'text-text-muted'}`}>
                              {pathway.isFree ? t('skillVerification.step3.free') : t('skillVerification.step3.paid')}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm font-medium text-text-muted mb-5">{pathway.reasoning}</p>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-shadow-dark pt-4">
                          <div className="flex items-center gap-2 text-xs text-text font-bold uppercase">
                            <Clock className="w-4 h-4 text-text-muted" />
                            {pathway.estimatedDuration}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="indus-label text-[#a0aec0] mr-1">{t('skillVerification.step3.addresses')}</span>
                            {pathway.skillsAddressed.map((skill, sIdx) => {
                              const matchedResult = analysis.perSkillResults.find(r => r.skill.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(r.skill.toLowerCase()));
                              const isGap = !matchedResult || matchedResult.status === "gap";

                              return (
                                <span key={sIdx} className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${isGap ? 'bg-white text-[#ff4757] border-[#ff4757]/30 shadow-sm' : 'bg-transparent text-text-muted border-[#a0aec0]'}`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#3b82f6] mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-text-muted leading-relaxed">
                      <strong className="text-text font-bold">{t('skillVerification.step3.aiDisclaimerPrefix')}:</strong> {t('skillVerification.step3.aiDisclaimerDesc')}
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="secondary"
                onClick={() => {
                  setStep(1);
                  setSkillsStr("");
                  setAssessmentId(null);
                  setQuestions([]);
                  setAnswers({});
                  setAnalysis(null);
                }}
                className="w-full mt-8"
              >
                {t('skillVerification.step3.startNew')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

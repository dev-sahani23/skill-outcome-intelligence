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

      // We omit certificates, projects, and courses from this simple UI for brevity,
      // but they can easily be added to the payload.
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
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-8 text-foreground relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
        <div>
          <div className="flex justify-between w-full md:w-auto items-center mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> {t('outcomePassport.backToDashboard')}
            </button>
            <div className="md:hidden block">
              <LanguageSelector />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase text-foreground flex items-center gap-2">
            {t('skillVerification.title')}
          </h1>
          <p className="text-muted-foreground font-bold mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> {t('skillVerification.subtitle')}
          </p>
        </div>
        <div className="hidden md:block">
          <LanguageSelector />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-4 border-destructive text-destructive font-bold p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <Card className="bg-white border-4 border-border">
            <CardHeader className="border-b-4 border-border pb-4">
              <CardTitle className="text-xl font-black uppercase text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-sm">1</span>
                {t('skillVerification.step1.title').replace('Step 1: ', '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-foreground">
                    {t('skillVerification.step1.title').replace('Step 1: ', '')} (Comma separated)
                  </label>
                  <Input
                    type="text"
                    placeholder={t('skillVerification.step1.inputPlaceholder')}
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs font-bold text-muted-foreground">{t('skillVerification.step1.description')}</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
                  disabled={loading}
                >
                  {loading ? t('skillVerification.step1.generatingBtn') : t('skillVerification.step1.generateBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-white border-4 border-border">
            <CardHeader className="border-b-4 border-border pb-4">
              <CardTitle className="text-xl font-black uppercase text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-sm">2</span>
                {t('skillVerification.step2.title').replace('Step 2: ', '')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitAnswers}>
                <p className="mb-6 font-bold text-muted-foreground text-sm">
                  Please answer the following verification questions based on your knowledge and experience.
                </p>

                <div className="space-y-6 mb-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-muted border-4 border-border">
                      <label className="block text-md font-black uppercase text-foreground mb-3 flex items-start gap-2">
                        <span className="mt-1"><HelpCircle className="w-4 h-4 text-primary" /></span>
                        <span>{idx + 1}. {q.question}</span>
                      </label>
                      <textarea
                        className="w-full h-auto min-h-[100px] border-4 border-border bg-white px-3.5 py-3 text-sm font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
                  className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
                  disabled={loading}
                >
                  {loading ? t('skillVerification.step2.analyzingBtn') : t('skillVerification.step2.submitBtn')}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && analysis && (
          <Card className="bg-white border-4 border-border">
            <CardHeader className="border-b-4 border-border pb-4">
              <CardTitle className="text-xl font-black uppercase text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-white text-sm">3</span>
                {t('skillVerification.step3.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`p-5 border-4 flex flex-col justify-center ${analysis.skillGapScore < 30 ? 'bg-green-50 border-secondary' : analysis.skillGapScore < 70 ? 'bg-yellow-50 border-accent' : 'bg-red-50 border-destructive'}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${analysis.skillGapScore < 30 ? 'text-secondary' : analysis.skillGapScore < 70 ? 'text-accent' : 'text-destructive'}`}>
                    {t('skillVerification.step3.proficiencyScore')}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-5xl font-black ${analysis.skillGapScore < 30 ? 'text-secondary' : analysis.skillGapScore < 70 ? 'text-accent' : 'text-destructive'}`}>
                      {100 - analysis.skillGapScore}
                    </p>
                    <span className="text-muted-foreground font-black text-lg">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-muted border-4 border-border mb-6">
                <p className="font-bold text-foreground leading-relaxed text-sm">{analysis.summary}</p>
              </div>

              <h3 className="text-lg font-black uppercase mb-4 text-foreground flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> {t('skillVerification.step3.skillBreakdown')}
              </h3>

              <div className="space-y-4">
                {analysis.perSkillResults.map((result, idx) => {
                  const isVerified = result.status === "verified";
                  const isPartial = result.status === "partially_verified";
                  const bgColor = isVerified ? "bg-white text-secondary" : isPartial ? "bg-white text-accent" : "bg-white text-destructive";
                  const borderColor = isVerified ? "border-secondary" : isPartial ? "border-accent" : "border-destructive";
                  const iconColor = isVerified ? "text-secondary" : isPartial ? "text-accent" : "text-destructive";

                  return (
                    <div key={idx} className={`p-5 border-4 bg-muted ${borderColor}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-black uppercase text-foreground">{result.skill}</span>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase border-2 ${bgColor} ${borderColor}`}>
                          {result.status.replace("_", " ")}
                        </span>
                      </div>

                      {result.status === "gap" && (
                        <div className="mt-3 text-sm font-bold text-muted-foreground flex items-start gap-2">
                          <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                          <span><strong className="text-foreground uppercase">{t('skillVerification.step3.reasoning')}:</strong> {result.reasoning}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {analysis.recommendedPathways && analysis.recommendedPathways.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-black uppercase mb-4 text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> 
                    {analysis.overallSkillGaps.length === 0 ? t('skillVerification.step3.advanceSkillsTitle') : t('skillVerification.step3.careerPathwayTitle')}
                  </h3>
                  <div className="space-y-4">
                    {analysis.recommendedPathways.map((pathway, idx) => (
                      <div key={idx} className="p-5 border-4 bg-muted border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-lg font-black uppercase text-foreground">{pathway.courseName}</span>
                          <div className="flex gap-2">
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border-2 ${pathway.difficulty === 'beginner' ? 'bg-white text-secondary border-secondary' : pathway.difficulty === 'intermediate' ? 'bg-white text-accent border-accent' : 'bg-white text-destructive border-destructive'}`}>
                              {pathway.difficulty}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border-2 ${pathway.isFree ? 'bg-white text-primary border-primary' : 'bg-white text-muted-foreground border-border'}`}>
                              {pathway.isFree ? t('skillVerification.step3.free') : t('skillVerification.step3.paid')}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm font-bold text-muted-foreground mb-4">{pathway.reasoning}</p>

                        <div className="flex flex-wrap items-center justify-between gap-4 border-t-4 border-border pt-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-black uppercase">
                              <Clock className="w-4 h-4 text-foreground" />
                              {pathway.estimatedDuration}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground font-bold uppercase mr-1">{t('skillVerification.step3.addresses')}</span>
                            {pathway.skillsAddressed.map((skill, sIdx) => {
                              // Find original skill result to match color
                              const matchedResult = analysis.perSkillResults.find(r => r.skill.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(r.skill.toLowerCase()));
                              const isGap = !matchedResult || matchedResult.status === "gap";
                              
                              return (
                                <span key={sIdx} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-2 ${isGap ? 'bg-white text-destructive border-destructive' : 'bg-white text-secondary border-secondary'}`}>
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-white border-4 border-border flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-muted-foreground">
                      <strong className="text-foreground uppercase">{t('skillVerification.step3.aiDisclaimerPrefix')}:</strong> {t('skillVerification.step3.aiDisclaimerDesc')}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setStep(1);
                  setSkillsStr("");
                  setAssessmentId(null);
                  setQuestions([]);
                  setAnswers({});
                  setAnalysis(null);
                }}
                className="w-full mt-8 bg-white hover:bg-accent text-foreground hover:text-black border-4 border-border hover:border-accent font-bold uppercase tracking-wider transition-colors"
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

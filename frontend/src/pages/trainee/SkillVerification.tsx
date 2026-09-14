import React, { useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Award, Sparkles, AlertCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
}

export default function SkillVerification() {
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
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-slate-400 hover:text-slate-200 transition-colors mb-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            Skill Verification & Gap Analysis
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Validate your claimed skills with an AI assessment to boost employability.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {step === 1 && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-sm">1</span>
                Intake
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleStart} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Claimed Skills (Comma separated)
                  </label>
                  <Input
                    className="bg-slate-950 border-slate-800 text-white"
                    type="text"
                    placeholder="e.g. React, Node.js, Python"
                    value={skillsStr}
                    onChange={(e) => setSkillsStr(e.target.value)}
                    disabled={loading}
                    required
                  />
                  <p className="text-xs text-slate-500">List the technical or soft skills you wish to verify during this assessment.</p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-900/20 border-none"
                  disabled={loading}
                >
                  {loading ? "Generating Questions..." : "Start Assessment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-sm">2</span>
                Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitAnswers}>
                <p className="mb-6 text-slate-400 text-sm">
                  Please answer the following verification questions based on your knowledge and experience.
                </p>

                <div className="space-y-6 mb-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl">
                      <label className="block text-md font-medium text-slate-200 mb-3 flex items-start gap-2">
                        <span className="mt-1"><HelpCircle className="w-4 h-4 text-indigo-400" /></span>
                        <span>{idx + 1}. {q.question}</span>
                      </label>
                      <textarea
                        className="w-full h-auto min-h-[100px] rounded-xl border border-slate-700/50 bg-slate-950 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-600 transition-all duration-300 outline-none hover:border-indigo-500/50 focus:border-indigo-500 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/20"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-900/20 border-none"
                  disabled={loading}
                >
                  {loading ? "Analyzing Answers..." : "Submit Answers"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && analysis && (
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 text-sm">3</span>
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className={`p-5 rounded-xl border flex flex-col justify-center ${analysis.skillGapScore < 30 ? 'bg-emerald-500/10 border-emerald-500/20' : analysis.skillGapScore < 70 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${analysis.skillGapScore < 30 ? 'text-emerald-400' : analysis.skillGapScore < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                    Proficiency Score
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-5xl font-bold ${analysis.skillGapScore < 30 ? 'text-emerald-400' : analysis.skillGapScore < 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {100 - analysis.skillGapScore}
                    </p>
                    <span className="text-slate-500 font-medium text-lg">/ 100</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-xl mb-6">
                <p className="text-slate-300 leading-relaxed text-sm">{analysis.summary}</p>
              </div>

              <h3 className="text-lg font-bold mb-4 text-slate-200 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> Skill Breakdown
              </h3>

              <div className="space-y-4">
                {analysis.perSkillResults.map((result, idx) => {
                  const isVerified = result.status === "verified";
                  const isPartial = result.status === "partially_verified";
                  const bgColor = isVerified ? "bg-emerald-500/5 text-emerald-400" : isPartial ? "bg-amber-500/5 text-amber-400" : "bg-rose-500/5 text-rose-400";
                  const borderColor = isVerified ? "border-emerald-500/20" : isPartial ? "border-amber-500/20" : "border-rose-500/20";
                  const iconColor = isVerified ? "text-emerald-500" : isPartial ? "text-amber-500" : "text-rose-500";

                  return (
                    <div key={idx} className={`p-5 rounded-xl border bg-slate-950/80 ${borderColor}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold text-slate-200">{result.skill}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${bgColor} ${borderColor}`}>
                          {result.status.replace("_", " ")}
                        </span>
                      </div>

                      {!isVerified && (
                        <div className="mt-3 text-sm text-slate-400 flex items-start gap-2">
                          <AlertCircle className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
                          <span><strong className="text-slate-300">Reasoning:</strong> {result.reasoning}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setStep(1);
                  setSkillsStr("");
                  setAssessmentId(null);
                  setQuestions([]);
                  setAnswers({});
                  setAnalysis(null);
                }}
                className="w-full mt-8 bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-none border border-slate-700"
              >
                Start New Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

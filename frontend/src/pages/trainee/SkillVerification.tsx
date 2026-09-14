import React, { useState } from "react";
import { api } from "../../lib/api";

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Skill Verification & Gap Analysis</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md border border-red-300">
          {error}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStart}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Intake</h2>
          <p className="mb-4 text-gray-600">
            Enter the skills you want to verify. (Comma separated)
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claimed Skills
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. React, Node.js, Python"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Generating Questions..." : "Start Assessment"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmitAnswers}>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 2: Assessment</h2>
          <p className="mb-6 text-gray-600">
            Please answer the following verification questions based on your knowledge and experience.
          </p>
          
          <div className="space-y-6 mb-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <label className="block text-md font-medium text-gray-800 mb-2">
                  {idx + 1}. {q.question}
                </label>
                <textarea
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-500"
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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? "Analyzing Answers..." : "Submit Answers"}
          </button>
        </form>
      )}

      {step === 3 && analysis && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 3: Results</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-md border ${analysis.skillGapScore < 30 ? 'bg-green-50 border-green-200' : analysis.skillGapScore < 70 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
              <h3 className={`text-sm font-semibold uppercase ${analysis.skillGapScore < 30 ? 'text-green-800' : analysis.skillGapScore < 70 ? 'text-yellow-800' : 'text-red-800'}`}>
                Proficiency Score
              </h3>
              <p className={`text-3xl font-bold ${analysis.skillGapScore < 30 ? 'text-green-900' : analysis.skillGapScore < 70 ? 'text-yellow-900' : 'text-red-900'}`}>
                {100 - analysis.skillGapScore}/100
              </p>
            </div>
          </div>

          <p className="mb-6 text-gray-700">{analysis.summary}</p>

          <h3 className="text-lg font-bold mb-4 text-gray-800">Skill Breakdown</h3>
          <div className="space-y-4">
            {analysis.perSkillResults.map((result, idx) => {
              const isVerified = result.status === "verified";
              const bgColor = isVerified ? "bg-green-50" : result.status === "partially_verified" ? "bg-yellow-50" : "bg-red-50";
              const textColor = isVerified ? "text-green-800" : result.status === "partially_verified" ? "text-yellow-800" : "text-red-800";
              const borderColor = isVerified ? "border-green-200" : result.status === "partially_verified" ? "border-yellow-200" : "border-red-200";

              return (
                <div key={idx} className={`p-4 rounded-md border ${bgColor} ${borderColor}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900">{result.skill}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${textColor} ${borderColor} border`}>
                      {result.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  {/* Visibility Rule: Hide reasoning for verified skills */}
                  {!isVerified && (
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-semibold">Reasoning:</span> {result.reasoning}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              setStep(1);
              setSkillsStr("");
              setAssessmentId(null);
              setQuestions([]);
              setAnswers({});
              setAnalysis(null);
            }}
            className="w-full mt-8 bg-gray-600 text-white font-bold py-3 rounded-md hover:bg-gray-700 transition"
          >
            Start New Assessment
          </button>
        </div>
      )}
    </div>
  );
}

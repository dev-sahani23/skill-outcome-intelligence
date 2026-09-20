import { useState, useEffect } from "react";
import { TraineeReport } from "./TraineeReport";
import { CourseReport } from "./CourseReport";
import { ProviderReport } from "./ProviderReport";
import { SystemReport } from "./SystemReport";
import { fetchTraineeReport, fetchCourseReport, fetchProviderReport, fetchSystemReport } from "@/api/reports";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader2, Printer, Search } from "lucide-react";
import { auth } from "@/lib/auth";

type ReportLevel = "trainee" | "course" | "provider" | "system";

export default function ReportGenerator() {
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    auth.getMe()
      .then(res => {
        setUser(res.user);
      })
      .catch(console.error)
      .finally(() => setIsInitializing(false));
  }, []);

  const isAdmin = user?.role === "GOVERNMENT_ADMIN";
  const isProvider = user?.role === "PROVIDER";
  const isTrainee = user?.role === "TRAINEE";

  const getProfileId = () => {
    if (isTrainee) return user?.traineeProfile?.id || "";
    if (isProvider) return user?.providerProfile?.id || "";
    return "";
  };

  const [level, setLevel] = useState<ReportLevel>("system");
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(window.location.search);
      const urlLevel = params.get("level") as ReportLevel | null;
      const urlSubjectId = params.get("subjectId");

      if (urlLevel) {
        setLevel(urlLevel);
        if (urlSubjectId) setSubjectId(urlSubjectId);
      } else if (isTrainee) {
        setLevel("trainee");
        setSubjectId(getProfileId());
      } else if (isProvider) {
        setLevel("course");
      }
    }
  }, [user]);

  const [year, setYear] = useState("");
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emptyMsg, setEmptyMsg] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setEmptyMsg("");
    setData(null);

    const filters = year ? { year } : undefined;

    try {
      let result;
      if (level === "trainee") {
        if (!subjectId && isAdmin) throw new Error("Please enter a Trainee ID");
        result = await fetchTraineeReport(subjectId || getProfileId(), filters);
      } else if (level === "course") {
        if (!subjectId) throw new Error("Please enter a Course ID");
        result = await fetchCourseReport(subjectId, filters);
      } else if (level === "provider") {
        if (!subjectId && isAdmin) throw new Error("Please enter a Provider ID");
        result = await fetchProviderReport(subjectId || getProfileId(), filters);
      } else if (level === "system") {
        result = await fetchSystemReport(filters);
      }

      if (result.message && !result.reportType) {
        setEmptyMsg(result.message);
      } else {
        setData(result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Report Generator</h1>
        {data && (
          <Button onClick={handlePrint} variant="outline" className="no-print bg-chassis border-border text-foreground hover:bg-border transition-colors flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </Button>
        )}
      </div>

      {/* Selector Section */}
      <div className="indus-panel p-6 mb-8 no-print animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">Report Level</label>
            <div className="flex flex-wrap gap-3">
              {(isTrainee || isProvider || isAdmin) && (
                <button
                  onClick={() => { setLevel("trainee"); setSubjectId(isTrainee ? getProfileId() : ""); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${level === "trainee" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,71,87,0.4)]" : "bg-chassis text-muted-foreground hover:bg-border"}`}
                >
                  Trainee Report
                </button>
              )}
              {(isProvider || isAdmin) && (
                <>
                  <button
                    onClick={() => { setLevel("course"); setSubjectId(""); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${level === "course" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,71,87,0.4)]" : "bg-chassis text-muted-foreground hover:bg-border"}`}
                  >
                    Course Report
                  </button>
                  <button
                    onClick={() => { setLevel("provider"); setSubjectId(isProvider ? getProfileId() : ""); }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${level === "provider" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,71,87,0.4)]" : "bg-chassis text-muted-foreground hover:bg-border"}`}
                  >
                    Provider Report
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setLevel("system"); setSubjectId(""); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${level === "system" ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(255,71,87,0.4)]" : "bg-chassis text-muted-foreground hover:bg-border"}`}
                >
                  System Overview
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {level !== "system" && (!isTrainee || isAdmin) && (!isProvider || level === "course" || level === "trainee") && (
                <div>
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                    {level === "course" ? "Course ID" : level === "provider" ? "Provider ID" : "Trainee ID"}
                  </label>
                  <Input
                    placeholder={`Enter ${level} ID...`}
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="indus-input"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                  Filter by Year (Optional)
                </label>
                <Input 
                  placeholder="e.g. 2025" 
                  value={year} 
                  onChange={e => setYear(e.target.value)} 
                  className="indus-input"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <div className="flex items-end pb-1">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || (level !== "system" && !subjectId)} 
              className="indus-button-primary w-full md:w-auto h-11 px-8 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error & Empty States */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 animate-fade-in no-print flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {emptyMsg && (
        <div className="indus-panel p-8 text-center text-muted-foreground animate-fade-in print-only">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-lg font-medium">{emptyMsg}</p>
        </div>
      )}

      {/* Render Reports */}
      {data && (
        <div className="print-content">
          {level === "trainee" && <TraineeReport data={data} />}
          {level === "course" && <CourseReport data={data} />}
          {level === "provider" && <ProviderReport data={data} />}
          {level === "system" && <SystemReport data={data} />}
        </div>
      )}
    </div>
  );
}

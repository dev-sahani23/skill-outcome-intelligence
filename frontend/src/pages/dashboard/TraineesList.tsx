import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Users, Search, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function TraineesList() {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchTrainees = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/trainees");
      setTrainees(res.trainees || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load trainees.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainees();
  }, []);

  const filteredTrainees = trainees.filter(t => 
    t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#7048e8]" />
        <p className="text-lg">Loading trainees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchTrainees} variant="outline" className="border-slate-700 text-slate-300">
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
              All Trainees
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4" /> View and monitor trainee progress across all providers.
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input 
              placeholder="Search trainees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-950 border-slate-700 text-white"
            />
          </div>
        </div>

        {filteredTrainees.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">No trainees found.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainees.map((trainee) => (
              <Card key={trainee.id} className="bg-slate-900 border-slate-800 flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-slate-800">
                  <CardTitle className="text-lg text-slate-200">{trainee.fullName || "Unnamed Trainee"}</CardTitle>
                  <p className="text-xs text-slate-500">{trainee.user?.email}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">District:</span>
                    <span className="text-slate-200 font-medium">{trainee.district || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Enrollments:</span>
                    <span className="text-slate-200 font-medium">{trainee.enrollments?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Skill Score:</span>
                    <span className="text-slate-200 font-bold">
                      {trainee.skillAssessments?.[0] ? 100 - trainee.skillAssessments[0].skillGapScore : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

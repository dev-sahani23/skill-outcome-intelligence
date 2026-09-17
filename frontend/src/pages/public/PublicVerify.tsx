import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Loader2, ShieldCheck, XCircle, MapPin, Building, Calendar, ArrowLeft } from "lucide-react";

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

    // Call the public verification API endpoint without auth headers
    // Using fetch directly because our api wrapper might inject auth headers and fail if logged out,
    // though the public endpoint should ignore it. Let's use standard fetch to be safe.
    fetch(`http://localhost:5000/api/public/verify/${hash}`)
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Verification failed");
        }
        return res.json();
      })
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
  }, [hash]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        <p className="text-lg">Verifying cryptographic hash on the network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 flex flex-col items-center justify-center text-slate-100">
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
          Skill Verification Portal
        </h1>
        <p className="text-slate-400 text-sm">
          Government of Maharashtra Official Skilling Registry
        </p>
      </div>

      <Card className="w-full max-w-lg bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {error ? (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
            <CardContent className="p-8 text-center flex flex-col items-center">
              <XCircle className="w-16 h-16 text-rose-500 mb-4" />
              <h2 className="text-2xl font-bold text-slate-200 mb-2">Verification Failed</h2>
              <p className="text-slate-400 mb-8 max-w-sm">
                {error} This certificate may be forged or the hash is incorrect.
              </p>
              <Button onClick={() => navigate('/')} className="bg-slate-800 hover:bg-slate-700 text-white w-full border border-slate-700">
                Return Home
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <ShieldCheck className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-200 mb-1">Authentic Record</h2>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {result?.status === 'valid' ? 'Verified on Registry' : result?.status}
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Trainee Name</p>
                  <p className="text-lg font-bold text-slate-200">{result?.traineeName}</p>
                </div>
                
                <div className="pb-4 border-b border-slate-800">
                  <p className="text-sm text-slate-500 mb-1">Certified Course</p>
                  <p className="text-lg font-bold text-slate-200">{result?.courseName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <Building className="w-4 h-4" /> Issuer
                    </p>
                    <p className="font-semibold text-slate-200 text-sm truncate" title={result?.issuer}>{result?.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Issue Date
                    </p>
                    <p className="font-semibold text-slate-200 text-sm">{result?.issuedDate}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 break-all">
                  <p className="text-xs text-slate-500 mb-1 font-mono uppercase">Verification Hash</p>
                  <p className="text-xs text-slate-400 font-mono">{hash}</p>
                </div>
              </div>

              <Button onClick={() => navigate('/')} className="mt-8 bg-slate-800 hover:bg-slate-700 text-white w-full border border-slate-700">
                Done
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

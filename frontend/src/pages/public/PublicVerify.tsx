import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Loader2, ShieldCheck, XCircle, MapPin, Building, Calendar, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Verifying cryptographic hash on the network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8 flex flex-col items-center justify-center text-foreground">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-3xl font-black uppercase text-foreground mb-2">
          Skill Verification Portal
        </h1>
        <p className="text-muted-foreground font-bold text-sm uppercase">
          Government of Maharashtra Official Skilling Registry
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="w-full max-w-lg">
      <Card className="w-full bg-white border-4 border-border relative overflow-hidden">
        {error ? (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-destructive" />
            <CardContent className="p-8 text-center flex flex-col items-center">
              <XCircle className="w-16 h-16 text-destructive mb-4" />
              <h2 className="text-2xl font-black uppercase text-foreground mb-2">Verification Failed</h2>
              <p className="text-muted-foreground font-bold mb-8 max-w-sm">
                {error} This certificate may be forged or the hash is incorrect.
              </p>
              <Button onClick={() => navigate('/')} className="bg-white hover:bg-accent text-foreground hover:text-black w-full border-4 border-border hover:border-accent font-bold uppercase tracking-wider transition-colors">
                Back to Search
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <ShieldCheck className="w-16 h-16 text-secondary mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase text-foreground mb-1">Authentic Record</h2>
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white text-secondary border-2 border-secondary">
                  {result?.status === 'valid' ? 'Verified on Registry' : result?.status}
                </span>
              </div>
              
              <div className="space-y-6">
                <div className="pb-4 border-b-4 border-border">
                  <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Trainee Name</p>
                  <p className="text-lg font-black uppercase text-foreground">{result?.traineeName}</p>
                </div>
                
                <div className="pb-4 border-b-4 border-border">
                  <p className="text-sm font-bold text-muted-foreground uppercase mb-1">Certified Course</p>
                  <p className="text-lg font-black uppercase text-foreground">{result?.courseName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b-4 border-border">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <Building className="w-4 h-4" /> Issuer
                    </p>
                    <p className="font-black text-foreground text-sm truncate uppercase" title={result?.issuer}>{result?.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Issue Date
                    </p>
                    <p className="font-black text-foreground text-sm uppercase">{result?.issuedDate}</p>
                  </div>
                </div>

                <div className="bg-muted p-4 border-4 border-border break-all">
                  <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">Verification Hash</p>
                  <p className="text-xs font-black text-foreground uppercase tracking-widest">{hash}</p>
                </div>
              </div>

              <Button onClick={() => navigate('/')} className="mt-8 bg-primary hover:bg-secondary text-white w-full font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors">
                Verify Another Candidate
              </Button>
            </CardContent>
          </>
        )}
      </Card>
      </motion.div>
    </div>
  );
}

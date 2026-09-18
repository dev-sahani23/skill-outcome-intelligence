import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Users, Search, ArrowLeft } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading trainees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{error}</p>
        <Button onClick={fetchTrainees} variant="outline" className="border-4 border-border text-foreground">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-6 text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-foreground">
              All Trainees
            </h1>
            <p className="text-muted-foreground font-bold mt-2 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4" /> View and monitor trainee progress across all providers.
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground" />
            <Input 
              placeholder="Search trainees..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {filteredTrainees.length === 0 ? (
          <div className="text-center py-12 bg-white border-4 border-border">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-bold">No trainees found.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrainees.map((trainee) => (
              <Card variants={itemVariants} key={trainee.id} className="bg-white border-4 border-border flex flex-col justify-between hover:bg-primary/5 hover:border-primary transition-colors">
                <CardHeader className="pb-2 border-b-4 border-border">
                  <CardTitle className="text-lg font-black uppercase text-foreground">{trainee.fullName || "Unnamed Trainee"}</CardTitle>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{trainee.user?.email}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">District:</span>
                    <span className="text-foreground font-black">{trainee.district || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Enrollments:</span>
                    <span className="text-foreground font-black">{trainee.enrollments?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Skill Score:</span>
                    <span className="text-secondary font-black">
                      {trainee.skillAssessments?.[0] ? 100 - trainee.skillAssessments[0].skillGapScore : "N/A"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

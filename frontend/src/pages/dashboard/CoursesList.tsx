import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, BookOpen, Plus, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function CoursesList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCourse, setNewCourse] = useState({
    name: "",
    description: "",
    durationMonths: "",
    sector: "IT",
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/courses/my-courses");
      setCourses(res.courses || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newCourse,
        durationMonths: parseInt(newCourse.durationMonths) || 1
      };
      const res = await api.post("/courses", payload);
      setCourses(prev => [res.course, ...prev]);
      setIsAdding(false);
      setNewCourse({ name: "", description: "", durationMonths: "", sector: "IT" });
    } catch (err: any) {
      console.error(err);
      setError("Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted p-6 flex flex-col items-center justify-center text-muted-foreground space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-destructive font-bold">{error}</p>
        <Button onClick={fetchCourses} variant="outline" className="border-4 border-border text-foreground">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-6 text-foreground">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/provider')}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-6 border-4 border-border gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-foreground">
              Training Programs
            </h1>
            <p className="text-muted-foreground font-bold mt-2 flex items-center gap-2 text-sm sm:text-base">
              <BookOpen className="w-4 h-4" /> Manage your offered courses and certifications.
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-white border-4 border-border">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-black uppercase text-foreground mb-2">No Courses Found</h2>
            <p className="text-muted-foreground font-bold">You haven't created any training programs yet.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card variants={itemVariants} key={course.id} className="bg-white border-4 border-border flex flex-col justify-between hover:bg-primary/5 hover:border-primary transition-colors group">
                <CardHeader className="pb-2 border-b-4 border-border">
                  <CardTitle className="text-lg font-black uppercase text-foreground group-hover:text-primary transition-colors">{course.name}</CardTitle>
                  <p className="text-xs font-bold text-muted-foreground uppercase">{course.sector}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1">
                  <p className="text-sm font-bold text-muted-foreground line-clamp-2">{course.description || "No description provided."}</p>
                  <div className="flex justify-between items-center text-sm pt-4 mt-auto">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider">Duration:</span>
                    <span className="text-foreground font-black">{course.durationMonths} months</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white border-4 border-border w-full max-w-md p-6 relative"
              >
                <button
                  onClick={() => setIsAdding(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
                <h2 className="text-xl font-black uppercase text-foreground mb-4">Create New Course</h2>
                
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Course Name</label>
                    <Input
                      required
                      placeholder="e.g. Full Stack Web Development"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Sector</label>
                    <Input
                      required
                      placeholder="e.g. IT, Healthcare"
                      value={newCourse.sector}
                      onChange={(e) => setNewCourse({...newCourse, sector: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Duration (Months)</label>
                    <Input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 6"
                      value={newCourse.durationMonths}
                      onChange={(e) => setNewCourse({...newCourse, durationMonths: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-foreground">Description</label>
                    <textarea
                      className="w-full h-24 border-4 border-border bg-white p-3 text-sm font-bold text-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2"
                      placeholder="Brief description of the course"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    />
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-wider border-2 border-primary hover:border-secondary transition-colors">
                    {isSubmitting ? "Creating..." : "Create Course"}
                  </Button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

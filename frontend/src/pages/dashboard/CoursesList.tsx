import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, BookOpen, Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";

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
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#2f9e44]" />
        <p className="text-lg">Loading your courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg text-rose-400">{error}</p>
        <Button onClick={fetchCourses} variant="outline" className="border-slate-700 text-slate-300">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-6 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/dashboard/provider')}
          className="flex items-center text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2f9e44]">
              Training Programs
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm sm:text-base">
              <BookOpen className="w-4 h-4" /> Manage your offered courses and certifications.
            </p>
          </div>
          <Button 
            className="bg-[#2f9e44] hover:bg-[#2b8a3e] text-white"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Course
          </Button>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No Courses Found</h2>
            <p className="text-slate-400">You haven't created any training programs yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="bg-slate-900 border-slate-800 flex flex-col justify-between">
                <CardHeader className="pb-2 border-b border-slate-800">
                  <CardTitle className="text-lg text-slate-200">{course.name}</CardTitle>
                  <p className="text-xs text-slate-500">{course.sector}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-3 flex-1">
                  <p className="text-sm text-slate-400 line-clamp-2">{course.description || "No description provided."}</p>
                  <div className="flex justify-between items-center text-sm pt-4 mt-auto">
                    <span className="text-slate-500">Duration:</span>
                    <span className="text-slate-200 font-medium">{course.durationMonths} months</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 relative">
              <button
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-white mb-4">Create New Course</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Course Name</label>
                  <Input
                    required
                    placeholder="e.g. Full Stack Web Development"
                    value={newCourse.name}
                    onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Sector</label>
                  <Input
                    required
                    placeholder="e.g. IT, Healthcare"
                    value={newCourse.sector}
                    onChange={(e) => setNewCourse({...newCourse, sector: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Duration (Months)</label>
                  <Input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 6"
                    value={newCourse.durationMonths}
                    onChange={(e) => setNewCourse({...newCourse, durationMonths: e.target.value})}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Description</label>
                  <textarea
                    className="w-full h-24 rounded-md border border-slate-800 bg-slate-950 p-3 text-sm text-white"
                    placeholder="Brief description of the course"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#2f9e44] hover:bg-[#2b8a3e]">
                  {isSubmitting ? "Creating..." : "Create Course"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";
import { formatINR } from "../../utils/formatters";

const FALLBACK_PLACEMENT_DATA = [
  { name: "Pune", Placed: 0 },
  { name: "Mumbai", Placed: 0 },
  { name: "Nagpur", Placed: 0 },
  { name: "Nashik", Placed: 0 },
];

const SKILL_GAP_DATA = [
  { subject: 'Cloud Computing', A: 90, B: 40, fullMark: 100 },
  { subject: 'Cybersecurity', A: 85, B: 20, fullMark: 100 },
  { subject: 'React Dev', A: 70, B: 60, fullMark: 100 },
  { subject: 'Data Science', A: 80, B: 30, fullMark: 100 },
  { subject: 'AI/ML', A: 95, B: 15, fullMark: 100 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function OrgDashboard() {
  const [stats, setStats] = useState<{
    totalEnrolled: number;
    placementRate: number;
    avgWage: number;
    districtPlacements: { name: string; Placed: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    auth.getAdminStats()
      .then((data: any) => setStats(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const placementData = stats?.districtPlacements?.length
    ? stats.districtPlacements
    : FALLBACK_PLACEMENT_DATA;

  return (
    <div className="min-h-screen bg-muted p-6 md:p-8 space-y-8 text-foreground relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 border-4 border-border">
        <div>
          <h1 className="text-3xl font-black uppercase text-foreground">Government Admin Dashboard</h1>
          <p className="text-muted-foreground font-bold mt-2">Overview of SIH Skilling Outcomes across Maharashtra.</p>
        </div>
        <div className="flex gap-4">
        <button
          onClick={() => window.location.href = '/dashboard/admin/trainees'}
          className="bg-primary hover:bg-secondary hover:border-secondary text-white px-4 py-2 font-bold uppercase tracking-wider border-2 border-primary transition-colors"
        >
          View All Trainees
        </button>
        <button
          onClick={() => window.location.href = '/dashboard/admin/skill-gaps'}
          className="bg-secondary hover:bg-primary hover:border-primary text-white px-4 py-2 font-bold uppercase tracking-wider border-2 border-secondary transition-colors"
        >
          View Skill Gaps & Anomalies
        </button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-4">
        <Card variants={itemVariants} className="bg-white border-4 border-border border-l-8 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "—" : stats?.totalEnrolled?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>
        <Card variants={itemVariants} className="bg-white border-4 border-border border-l-8 border-l-secondary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {isLoading ? "—" : `${stats?.placementRate ?? 0}%`}
            </div>
          </CardContent>
        </Card>
        <Card variants={itemVariants} className="bg-white border-4 border-border border-l-8 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Avg Monthly Wage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-secondary">
              {isLoading ? "—" : stats?.avgWage ? formatINR(stats.avgWage) : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card variants={itemVariants} className="bg-white border-4 border-border border-l-8 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Skill Gap Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              42.5
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2">
        {/* Analytics Chart */}
        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="border-b-4 border-border pb-4">
            <CardTitle className="text-lg font-black uppercase text-foreground">District-wise Placements</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground font-bold">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementData}>
                  <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground font-bold text-xs" />
                  <YAxis stroke="currentColor" className="text-muted-foreground font-bold text-xs" label={{ value: 'Trainees Placed', angle: -90, position: 'insideLeft', fill: 'currentColor' }} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: "#ffffff", borderColor: "#111827", borderWidth: 4, borderRadius: 0, color: "#111827", fontWeight: 'bold' }} />
                  <Bar dataKey="Placed" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Leaflet Map */}
        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="border-b-4 border-border pb-4">
            <CardTitle className="text-lg font-black uppercase text-foreground">Geospatial Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80 relative overflow-hidden pt-6">
            <MapContainer center={[19.7515, 75.7139]} zoom={6} scrollWheelZoom={false} className="h-full w-full z-0 border-2 border-border">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              <Marker position={[18.5204, 73.8567]}>
                <Popup>Pune: High placement rate</Popup>
              </Marker>
              <Marker position={[19.0760, 72.8777]}>
                <Popup>Mumbai: Top outcomes</Popup>
              </Marker>
            </MapContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2">
        {/* Radar Chart */}
        <Card variants={itemVariants} className="bg-white border-4 border-border">
          <CardHeader className="border-b-4 border-border pb-4">
            <CardTitle className="text-lg font-black uppercase text-foreground">Skill Demand vs Supply Gap</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAP_DATA}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#111827', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#e5e7eb" />
                <Radar name="Demand" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Supply" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#111827", borderWidth: 4, borderRadius: 0, color: "#111827", fontWeight: 'bold' }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

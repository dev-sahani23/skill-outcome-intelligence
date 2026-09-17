import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Government Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Overview of SIH Skilling Outcomes across Maharashtra.</p>
        </div>
        <div className="flex gap-4">
        <button
          onClick={() => window.location.href = '/dashboard/admin/trainees'}
          className="bg-[#7048e8] hover:bg-[#5f3dc4] text-white px-4 py-2 rounded shadow transition-colors"
        >
          View All Trainees
        </button>
        <button
          onClick={() => window.location.href = '/dashboard/admin/skill-gaps'}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded shadow border border-slate-700 transition-colors"
        >
          View Skill Gaps & Anomalies
        </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-indigo-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoading ? "—" : stats?.totalEnrolled?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoading ? "—" : `${stats?.placementRate ?? 0}%`}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Monthly Wage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {isLoading ? "—" : stats?.avgWage ? formatINR(stats.avgWage) : "N/A"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-rose-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Skill Gap Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              42.5
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics Chart */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-200">District-wise Placements</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" label={{ value: 'Trainees Placed', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f1f5f9" }} />
                  <Bar dataKey="Placed" fill="#7048e8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Leaflet Map */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-200">Geospatial Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80 relative rounded-md overflow-hidden">
            <MapContainer center={[19.7515, 75.7139]} zoom={6} scrollWheelZoom={false} className="h-full w-full rounded-md z-0">
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Radar Chart */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-200">Skill Demand vs Supply Gap</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAP_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar name="Demand" dataKey="A" stroke="#7048e8" fill="#7048e8" fillOpacity={0.6} />
                <Radar name="Supply" dataKey="B" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f1f5f9" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

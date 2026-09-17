import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { auth } from "../../lib/auth";

const FALLBACK_PLACEMENT_DATA = [
  { name: "Pune", Placed: 0 },
  { name: "Mumbai", Placed: 0 },
  { name: "Nagpur", Placed: 0 },
  { name: "Nashik", Placed: 0 },
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
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Government Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Overview of SIH Skilling Outcomes across Maharashtra.</p>
        </div>
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
                  <YAxis stroke="#94a3b8" />
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoading ? "—" : stats?.totalEnrolled?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Placement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {isLoading ? "—" : `${stats?.placementRate ?? 0}%`}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Avg Monthly Wage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">
              {isLoading ? "—" : stats?.avgWage ? `₹${stats.avgWage.toLocaleString()}` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

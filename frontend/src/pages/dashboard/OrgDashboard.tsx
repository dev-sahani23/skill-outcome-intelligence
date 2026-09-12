import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const placementData = [
  { name: "Pune", Placed: 1200 },
  { name: "Mumbai", Placed: 3000 },
  { name: "Nagpur", Placed: 800 },
  { name: "Nashik", Placed: 400 },
];

export default function OrgDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 text-slate-100 relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Government Admin Dashboard</h1>
          <p className="text-slate-400 mt-2">Overview of SIH Skilling Outcomes across Maharashtra.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics Chart */}
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-200">District-wise Placements</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#f1f5f9" }} />
                <Bar dataKey="Placed" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Total Enrolled</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">12,345</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Placement Rate</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">68%</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-400">Avg Wage Progression</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-400">+15%</div></CardContent>
        </Card>
      </div>
    </div>
  );
}

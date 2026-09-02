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
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Government Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">Overview of SIH Skilling Outcomes across Maharashtra.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>District-wise Placements</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={placementData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Placed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leaflet Map */}
        <Card>
          <CardHeader>
            <CardTitle>Geospatial Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80 relative">
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
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Enrolled</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">12,345</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Placement Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">68%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Avg Wage Progression</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">+15%</div></CardContent>
        </Card>
      </div>
    </div>
  );
}

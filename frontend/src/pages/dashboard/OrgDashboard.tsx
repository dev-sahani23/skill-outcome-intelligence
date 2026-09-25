import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, type Variants } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, LineChart, Line, CartesianGrid } from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import { Users, TrendingUp, Wallet, BarChart2, MapPin } from "lucide-react";
import { auth } from "../../lib/auth";
import { formatINR } from "../../utils/formatters";
import L from "leaflet";

const defaultIcon = new L.Icon({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.175, 0.885, 0.32, 1.275] } }
};

export default function OrgDashboard() {
  const [stats, setStats] = useState<{
    totalEnrolled: number;
    placementRate: number;
    avgWage: number;
    districtPlacements?: { name: string; Placed: number }[];
  } | null>(null);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [historicalDataRaw, setHistoricalDataRaw] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      auth.getAdminStats(),
      auth.getAdminLocationStats().catch(() => null), // fail gracefully if not deployed yet
      auth.getAdminHistoricalData().catch(() => ({ historicalData: [] }))
    ])
      .then(([statsData, locData, histData]) => {
        setStats(statsData);
        if (locData) setLocationStats(locData);
        if (histData && histData.historicalData) setHistoricalDataRaw(histData.historicalData);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const placementData = stats?.districtPlacements?.length ? stats.districtPlacements : FALLBACK_PLACEMENT_DATA;

  const statCards = [
    { label: "Total Enrolled",  value: isLoading ? "—" : (stats?.totalEnrolled?.toLocaleString() ?? "0"), accentColor: "#ff4757", icon: <Users  className="w-5 h-5" /> },
    { label: "Placement Rate",  value: isLoading ? "—" : `${stats?.placementRate ?? 0}%`,                  accentColor: "#22c55e", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Avg Monthly Wage",value: isLoading ? "—" : (stats?.avgWage ? formatINR(stats.avgWage) : "N/A"), accentColor: "#f59e0b", icon: <Wallet className="w-5 h-5" /> },
    { label: "Skill Gap Index", value: "42.5",                                                              accentColor: "#3b82f6", icon: <BarChart2 className="w-5 h-5" /> },
  ];

  // Aggregate historical data by year
  const aggregatedHistoricalData = useMemo(() => {
    if (!historicalDataRaw.length) return [];
    
    const byYear: Record<string, { enrolled: number; assessed: number }> = {};
    historicalDataRaw.forEach((row) => {
      if (!byYear[row.financialYear]) {
        byYear[row.financialYear] = { enrolled: 0, assessed: 0 };
      }
      byYear[row.financialYear].enrolled += row.enrolled;
      byYear[row.financialYear].assessed += row.assessed;
    });

    return Object.entries(byYear)
      .map(([year, data]) => ({ financialYear: year, ...data }))
      .sort((a, b) => a.financialYear.localeCompare(b.financialYear));
  }, [historicalDataRaw]);

  return (
    <div className="min-h-screen bg-chassis p-6 md:p-8 space-y-8">

      {/* ─── Header: Dark charcoal command panel ─── */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
        style={{ background: "#2d3436", boxShadow: "8px 8px 20px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.05)" }}
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="indus-led-green" aria-label="System online" />
            <span className="indus-label text-[#a8b2d1]">State Oversight Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
            Government Admin Dashboard
          </h1>
          <p className="text-[#a8b2d1] mt-1 text-sm font-medium">
            Overview of SIH Skilling Outcomes across Maharashtra.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => window.location.href = '/dashboard/admin/trainees'}
            className="rounded-xl px-5 py-3 font-bold uppercase tracking-wider text-sm text-white transition-all duration-150"
            style={{ background: "#ff4757", boxShadow: "var(--shadow-btn-accent)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
          >
            View All Trainees
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/admin/skill-gaps'}
            className="rounded-xl px-5 py-3 font-bold uppercase tracking-wider text-sm text-text transition-all duration-150"
            style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-floating)"; (e.currentTarget as HTMLButtonElement).style.color = "#ff4757"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLButtonElement).style.color = "#2d3436"; }}
          >
            Skill Gaps & Anomalies
          </button>
          <button
            onClick={() => window.location.href = '/reports'}
            className="rounded-xl px-5 py-3 font-bold uppercase tracking-wider text-sm text-text transition-all duration-150"
            style={{ background: "#e0e5ec", boxShadow: "var(--shadow-card)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-floating)"; (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-card)"; (e.currentTarget as HTMLButtonElement).style.color = "#2d3436"; }}
          >
            Generate Reports
          </button>
        </div>
      </div>

      {/* ─── Key Metrics: Reference-style feature cards ─── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-4">
        {statCards.map((sc) => (
          <Card key={sc.label} variants={itemVariants} showScrews showVents>
            {/* Large circular icon housing — top-left, floating */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4 shrink-0"
              style={{
                background: "#e8ecf1",
                boxShadow: "6px 6px 12px #babecc, -6px -6px 12px #ffffff",
                color: sc.accentColor,
              }}
            >
              {sc.icon}
            </div>

            {/* Label */}
            <p className="text-sm font-semibold text-text-muted mb-1">{sc.label}</p>

            {/* Value */}
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: sc.accentColor }}
            >
              {sc.value}
            </div>
          </Card>
        ))}
      </motion.div>

      {/* ─── Location Coverage Card ─── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <Card variants={itemVariants} showScrews showVents>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">Location Coverage</h3>
                <p className="text-text-muted font-medium mt-1">
                  {locationStats ? `${locationStats.totalWithLocation} / ${locationStats.totalWithLocation + locationStats.totalWithout} trainees (${locationStats.coveragePercent}%) have shared location` : "Loading..."}
                </p>
              </div>
            </div>
            {locationStats && (
              <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${locationStats.coveragePercent}%` }}></div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Charts Row ─── */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2">
        {/* Bar Chart */}
        <Card variants={itemVariants} showScrews showVents>
          <CardHeader className="border-b border-shadow-dark pb-4">
            <CardTitle className="text-base font-bold uppercase text-text">District-wise Placements</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full font-bold text-text-muted">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={placementData}>
                  <XAxis dataKey="name" stroke="#4a5568" tick={{ fill: '#4a5568', fontWeight: 700, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
                  <YAxis stroke="#4a5568" tick={{ fill: '#4a5568', fontWeight: 700, fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ backgroundColor: "#2d3436", border: "none", borderRadius: "8px", color: "#e0e5ec", fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <Bar dataKey="Placed" fill="#ff4757" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card variants={itemVariants} showScrews>
          <CardHeader className="border-b border-shadow-dark pb-4">
            <CardTitle className="text-base font-bold uppercase text-text">Geospatial Tracking</CardTitle>
          </CardHeader>
          <CardContent className="h-80 relative overflow-hidden pt-6">
            <MapContainer center={[19.7515, 75.7139]} zoom={6} scrollWheelZoom={false} className="h-full w-full z-0 rounded-xl">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              {locationStats?.rawLocations ? (
                locationStats.rawLocations.map((loc: any, i: number) => (
                  <Marker key={i} position={[loc.latitude, loc.longitude]} icon={defaultIcon}>
                    <Popup>Trainee from {loc.trainee?.district || "Unknown"}</Popup>
                  </Marker>
                ))
              ) : (
                <>
                  <Marker position={[18.5204, 73.8567]} icon={defaultIcon}><Popup>Pune: High placement rate</Popup></Marker>
                  <Marker position={[19.0760, 72.8777]} icon={defaultIcon}><Popup>Mumbai: Top outcomes</Popup></Marker>
                </>
              )}
            </MapContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Historical Trends & Radar Chart Row ─── */}
      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid gap-6 md:grid-cols-2">
        
        {/* Historical Data Line Chart */}
        <Card variants={itemVariants} showScrews showVents>
          <CardHeader className="border-b border-shadow-dark pb-4">
            <CardTitle className="text-base font-bold uppercase text-text">Historical Enrollment Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full font-bold text-text-muted">Loading chart...</div>
            ) : aggregatedHistoricalData.length === 0 ? (
              <div className="flex items-center justify-center h-full font-bold text-text-muted">No historical data found</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedHistoricalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#babecc" vertical={false} />
                  <XAxis dataKey="financialYear" stroke="#4a5568" tick={{ fill: '#4a5568', fontWeight: 700, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }} />
                  <YAxis stroke="#4a5568" tick={{ fill: '#4a5568', fontWeight: 700, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#2d3436", border: "none", borderRadius: "8px", color: "#e0e5ec", fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "10px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                  <Line type="monotone" dataKey="enrolled" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} name="Enrolled" />
                  <Line type="monotone" dataKey="assessed" stroke="#22c55e" strokeWidth={3} name="Assessed" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card variants={itemVariants} showScrews>
          <CardHeader className="border-b border-shadow-dark pb-4">
            <CardTitle className="text-base font-bold uppercase text-text">Skill Demand vs Supply Gap</CardTitle>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_GAP_DATA}>
                <PolarGrid stroke="#babecc" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#2d3436', fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#babecc" />
                <Radar name="Demand" dataKey="A" stroke="#ff4757" fill="#ff4757" fillOpacity={0.4} />
                <Radar name="Supply" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.4} />
                <Legend wrapperStyle={{ paddingTop: "20px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#2d3436", border: "none", borderRadius: "8px", color: "#e0e5ec", fontWeight: 'bold', fontFamily: "'JetBrains Mono', monospace" }} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

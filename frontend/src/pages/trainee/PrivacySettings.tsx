import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/Button";
import { useLocation } from "../../hooks/useLocation";
import { api } from "../../lib/api";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

export default function PrivacySettings() {
  const { isGranted, locationData, clearLocation } = useLocation();
  const [district, setDistrict] = useState<string | null>(null);
  
  useEffect(() => {
    // Attempt to fetch current trainee district if needed, or just rely on what is returned by the API
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.user?.traineeProfile?.district) {
          setDistrict(res.user.traineeProfile.district);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleDisableLocation = async () => {
    if (!window.confirm("This will remove your stored location data. Your district assignment will be kept.")) return;
    try {
      await api.delete("/trainees/location");
      clearLocation();
      alert("Location data deleted");
      window.location.reload(); // reload to reflect changes
    } catch (err: any) {
      alert("Failed to disable location: " + err.message);
    }
  };

  const handleEnableLocation = () => {
    clearLocation();
    window.location.reload(); // trigger banner again
  };

  return (
    <div className="min-h-screen bg-chassis p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div className="rounded-2xl p-6 bg-[#2d3436] flex flex-col gap-4 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Privacy Settings</h1>
      </div>

      <Card showScrews showVents>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" /> Location Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            Status: 
            {isGranted ? (
              <span className="flex items-center text-green-600 font-bold gap-1">
                <CheckCircle className="w-4 h-4" /> Enabled 
              </span>
            ) : (
              <span className="flex items-center text-red-500 font-bold gap-1">
                <XCircle className="w-4 h-4" /> Disabled
              </span>
            )}
          </div>
          {isGranted && district && (
            <div className="text-gray-700 font-medium">
              District detected: {district}
            </div>
          )}
          <div className="pt-4">
            {isGranted ? (
              <Button variant="secondary" onClick={handleDisableLocation} className="text-red-500">
                Disable Location Tracking
              </Button>
            ) : (
              <Button onClick={handleEnableLocation}>
                Enable Location Tracking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

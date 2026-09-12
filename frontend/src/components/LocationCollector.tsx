import React, { useState } from "react";
import { useGeolocation } from "../hooks/useGeolocation";
import { api } from "../lib/api"; // Assume there's a configured Axios or fetch wrapper

export const LocationCollector: React.FC = () => {
  const { requestLocation, loading, error } = useGeolocation();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProvideLocation = async () => {
    setSuccessMsg(null);
    setApiError(null);
    setIsSubmitting(true);

    const coords = await requestLocation();
    
    if (coords) {
      try {
        const response = await api.post("/trainees/location", coords);
        setSuccessMsg(`Location successfully recorded: ${response.data.location.district}, ${response.data.location.state}`);
      } catch (err: any) {
        setApiError(err.response?.data?.error || "Failed to submit location to server");
      }
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="location-collector p-4 border rounded-md shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Location Information</h3>
      <p className="text-sm text-gray-600 mb-4">
        Providing your location helps us find relevant training opportunities near you.
      </p>
      
      <button 
        onClick={handleProvideLocation} 
        disabled={loading || isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading || isSubmitting ? "Processing..." : "Share Location"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {apiError && <p className="mt-2 text-sm text-red-600">{apiError}</p>}
      {successMsg && <p className="mt-2 text-sm text-green-600">{successMsg}</p>}
    </div>
  );
};

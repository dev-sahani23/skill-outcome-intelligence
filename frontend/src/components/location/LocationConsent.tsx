import React, { useState } from 'react';
import { setCookie } from '../../utils/cookies';
import type { LocationData } from '../../hooks/useLocation';
import { MapPin, X } from 'lucide-react';

interface LocationConsentProps {
  onGranted: (data: LocationData) => void;
  onNotNow: () => void;
}

export const LocationConsent: React.FC<LocationConsentProps> = ({ onGranted, onNotNow }) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsRequesting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsRequesting(false);
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        };
        // Store consent cookie
        setCookie("location_consent", "granted", 30);
        // Store location cookie
        setCookie("location_data", JSON.stringify(locationData), 30);
        
        onGranted(locationData);
        alert("Location tracking enabled");
      },
      (error) => {
        setIsRequesting(false);
        let message = "Could not get location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission was denied in browser settings.";
        }
        if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        alert(message);
        // Don't set any cookie — let them try again
      },
      {
        enableHighAccuracy: false, // battery-friendly
        timeout: 10000,            // 10 second timeout
        maximumAge: 300000,        // cache for 5 minutes
      }
    );
  };

  const handleNotNow = () => {
    // Session-only dismissal — no cookie
    onNotNow();
  };

  const handleNeverAsk = () => {
    setCookie("location_consent", "denied", 365);
    onNotNow(); // trigger dismissal
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-safe">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-t-xl md:rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Enable Location Tracking
              </h3>
            </div>
            <button onClick={handleNotNow} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We'd like to track your location to improve district-level analytics and match you with 
            local job opportunities. Your location is only used for skilling outcome analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAllow}
              disabled={isRequesting}
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-70"
            >
              {isRequesting ? 'Requesting...' : 'Allow Location'}
            </button>
            <button
              onClick={handleNotNow}
              className="flex-1 px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow-sm transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleNeverAsk}
              className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-medium rounded-lg transition-colors"
            >
              Never Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

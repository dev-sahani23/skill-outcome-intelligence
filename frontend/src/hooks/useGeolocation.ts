import { useState, useCallback } from "react";

interface GeolocationState {
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async (): Promise<{ latitude: number, longitude: number, accuracy: number } | null> => {
    setState({ loading: true, error: null });
    
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation is not supported by your browser" });
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({ loading: false, error: null });
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let errorMsg = "An unknown error occurred while retrieving location.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "User denied the request for Geolocation.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMsg = "The request to get user location timed out.";
              break;
          }
          setState({ loading: false, error: errorMsg });
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { requestLocation, ...state };
};

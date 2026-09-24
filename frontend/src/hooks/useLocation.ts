import { getCookie, deleteCookie } from '../utils/cookies';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

export const useLocation = () => {
  const consent = getCookie("location_consent");
  const raw = getCookie("location_data");

  const locationData: LocationData | null = raw
    ? JSON.parse(raw)
    : null;

  const isGranted = consent === "granted";
  const isDenied = consent === "denied";
  const isPending = !consent;  // never asked or "not now"

  const clearLocation = () => {
    deleteCookie("location_consent");
    deleteCookie("location_data");
  };

  return { isGranted, isDenied, isPending, locationData, clearLocation };
};

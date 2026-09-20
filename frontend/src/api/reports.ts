import { getAuthToken } from "../lib/api";

const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const getQueryString = (filters?: { year?: string; from?: string; to?: string }) => {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.year) params.append("year", filters.year);
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  const str = params.toString();
  return str ? `?${str}` : "";
};

export const fetchTraineeReport = async (traineeId: string, filters?: any) => {
  const res = await fetch(`/api/reports/trainee/${traineeId}${getQueryString(filters)}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const fetchCourseReport = async (courseId: string, filters?: any) => {
  const res = await fetch(`/api/reports/course/${courseId}${getQueryString(filters)}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const fetchProviderReport = async (providerId: string, filters?: any) => {
  const res = await fetch(`/api/reports/provider/${providerId}${getQueryString(filters)}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const fetchSystemReport = async (filters?: any) => {
  const res = await fetch(`/api/reports/system${getQueryString(filters)}`, { headers: getHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

import { api, setAuthToken, removeAuthToken } from "./api";

export type LoginInput = any;
export type RegisterInput = any;

export const auth = {
  login: async (data: LoginInput) => {
    const response = await api.post("/auth/login", data);
    if (response.accessToken) {
      setAuthToken(response.accessToken);
    }
    return response;
  },

  register: async (data: RegisterInput) => {
    const response = await api.post("/auth/register", data);
    if (response.accessToken) {
      setAuthToken(response.accessToken);
      import("../utils/cookies").then(({ deleteCookie }) => {
        deleteCookie("location_consent");
        deleteCookie("location_data");
      });
    }
    return response;
  },

  logout: async () => {
    await api.post("/auth/logout");
    removeAuthToken();
    import("../utils/cookies").then(({ deleteCookie }) => {
      deleteCookie("location_consent");
      deleteCookie("location_data");
    });
  },

  getMe: async () => {
    return api.get("/auth/me");
  },

  sendOtp: async (data: { email: string }) => {
    return api.post("/auth/forgot-password/send-otp", data);
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    return api.post("/auth/forgot-password/verify-otp", data);
  },

  resetPassword: async (data: { resetToken: string; newPassword: string }) => {
    return api.post("/auth/forgot-password/reset-password", data);
  },

  // ─── Training & Enrollments ───────────────────────────────────────────────
  recordTrainingDetails: async (data: any) => {
    return api.post("/enrollments/record-details", data);
  },

  getMyEnrollments: async () => {
    return api.get("/enrollments/my-enrollments");
  },

  getProviderEnrollments: async (page = 1, limit = 10, search = "") => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    return api.get(`/enrollments/provider-enrollments?${params.toString()}`);
  },

  // ─── Courses ─────────────────────────────────────────────────────────────
  getMyCourses: async (page = 1, limit = 10, search = "") => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), search });
    return api.get(`/courses/my-courses?${params.toString()}`);
  },

  createCourse: async (data: { name: string; description?: string; durationMonths?: number; sector?: string }) => {
    return api.post("/courses", data);
  },

  // ─── Employment Outcomes ─────────────────────────────────────────────────
  reportOutcome: async (data: {
    type: string;
    employerName?: string;
    designation?: string;
    monthlyWage?: number;
    aadhaarNo?: string;
    uanNumber?: string;
    napsNumber?: string;
    udyamRegistrationNo?: string;
    businessActivity?: string;
    nonPlacementReason?: string;
  }) => {
    return api.post("/outcomes", data);
  },

  getMyOutcomes: async () => {
    return api.get("/outcomes/my-outcomes");
  },

  // ─── Admin ───────────────────────────────────────────────────────────────
  getAdminStats: async () => {
    return api.get("/admin/stats");
  },

  getAdminLocationStats: async () => {
    return api.get("/admin/location-stats");
  },

  getAdminHistoricalData: async () => {
    return api.get("/admin/historical-data");
  },
};

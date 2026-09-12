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
    }
    return response;
  },

  logout: async () => {
    await api.post("/auth/logout");
    removeAuthToken();
  },

  getMe: async () => {
    return api.get("/auth/me");
  },

  // ─── Training & Enrollments ───────────────────────────────────────────────
  recordTrainingDetails: async (data: any) => {
    return api.post("/enrollments/record-details", data);
  },

  getMyEnrollments: async () => {
    return api.get("/enrollments/my-enrollments");
  },

  getProviderEnrollments: async () => {
    return api.get("/enrollments/provider-enrollments");
  },

  // ─── Courses ─────────────────────────────────────────────────────────────
  getMyCourses: async () => {
    return api.get("/courses/my-courses");
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
};

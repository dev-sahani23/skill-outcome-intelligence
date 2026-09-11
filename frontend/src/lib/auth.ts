import { api, setAuthToken, removeAuthToken } from "./api";
// Define basic types locally to avoid cross-project import issues
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

  recordTrainingDetails: async (data: any) => {
    return api.post("/enrollments/record-details", data);
  },
};

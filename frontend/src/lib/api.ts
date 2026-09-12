const API_BASE_URL = "http://localhost:5000/api";

export const getAuthToken = () => localStorage.getItem("accessToken");
export const setAuthToken = (token: string) => localStorage.setItem("accessToken", token);
export const removeAuthToken = () => localStorage.removeItem("accessToken");

interface RequestOptions extends RequestInit {
  data?: any;
}

const request = async (endpoint: string, options: RequestOptions = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  
  if (options.data && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }
  
  config.credentials = "include";

  const response = await fetch(url, config);
  
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "An error occurred");
  }

  return data;
};

export const api = {
  get: (endpoint: string, options?: Omit<RequestOptions, "method" | "data">) => 
    request(endpoint, { ...options, method: "GET" }),
    
  post: (endpoint: string, data?: any, options?: Omit<RequestOptions, "method" | "data">) => 
    request(endpoint, { ...options, method: "POST", data }),
    
  put: (endpoint: string, data?: any, options?: Omit<RequestOptions, "method" | "data">) => 
    request(endpoint, { ...options, method: "PUT", data }),

  patch: (endpoint: string, data?: any, options?: Omit<RequestOptions, "method" | "data">) => 
    request(endpoint, { ...options, method: "PATCH", data }),
    
  delete: (endpoint: string, options?: Omit<RequestOptions, "method" | "data">) => 
    request(endpoint, { ...options, method: "DELETE" }),
};

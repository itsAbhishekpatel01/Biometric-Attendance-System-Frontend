import axios from "axios";
import type {
  User,
  Device,
  UserListResponse,
  AttendanceListResponse,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:11',message:'API client initialized',data:{apiBaseUrl:API_BASE_URL,windowOrigin:window.location.origin,windowHref:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
}
// #endregion

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:26',message:'API request interceptor',data:{url:config.url,baseURL:config.baseURL,fullUrl:config.baseURL+config.url,method:config.method,origin:window.location.origin},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  }
  return config;
});

// #region agent log
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      fetch('http://127.0.0.1:7245/ingest/ce8c5969-e772-4fa2-a8ed-1cee37b6f6fb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:38',message:'API response error',data:{message:error.message,code:error.code,status:error.response?.status,statusText:error.response?.statusText,url:error.config?.url,baseURL:error.config?.baseURL,isCorsError:error.message?.includes('CORS')||error.message?.includes('cors')||error.code==='ERR_NETWORK'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    return Promise.reject(error);
  }
);
// #endregion

// Auth API
export const authApi = {
  login: (password: string) =>
    api.post<{ token: string; success: boolean }>("/auth/login", { password }),
};

// Users API
export const usersApi = {
  list: (params?: { search?: string; page?: number; limit?: number }) =>
    api.get<UserListResponse>("/users", { params }),
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>("/users", data),
  update: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Devices API
export const devicesApi = {
  list: () => api.get<Device[]>("/devices"),
  get: (id: string) => api.get<Device>(`/devices/${id}`),
  create: (data: { deviceId: string; name: string }) =>
    api.post<Device>("/devices", data),
  regenerateToken: (id: string) =>
    api.post<Device>(`/devices/${id}/regenerate-token`),
  delete: (id: string) => api.delete(`/devices/${id}`),
};

// Attendance API
export const attendanceApi = {
  list: (params?: {
    userId?: string;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => api.get<AttendanceListResponse>("/attendance", { params }),
};

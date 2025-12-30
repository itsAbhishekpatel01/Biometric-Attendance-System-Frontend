export interface User {
  id: string;
  admissionNumber: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  className: string;
  section: string;
  batch: string;
  createdAt: string;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  token: string;
  createdAt: string;
  _count?: {
    attendance: number;
  };
}

export interface Attendance {
  id: string;
  event: string;
  confidence: number | null;
  createdAt: string;
  user: User;
  device: Device;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export interface AttendanceListResponse {
  attendances: Attendance[];
  pagination: Pagination;
}

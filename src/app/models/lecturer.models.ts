export interface Lecturer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  department?: any;
  departmentId?: number;
  academicTitle?: string;
  specialization?: string;
}

export interface LecturerRequest {
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: number;
  academicTitle?: string;
  specialization?: string;
}

export interface LecturerResponse {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  department?: any;
  departmentId?: number;
  academicTitle?: string;
  specialization?: string;
}

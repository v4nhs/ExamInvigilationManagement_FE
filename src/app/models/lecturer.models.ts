export interface Lecturer {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  department?: any;
  departmentId?: number;
  departmentName?: string;
  academicTitle?: string;
  specialization?: string;
  user?: { id: number; username: string; firstName: string; lastName: string; email: string };
}

export interface LecturerRequest {
  userId: number;
  fullName: string;
  departmentId: number; 
  academicTitle: string;
  specialization: string;
}

export interface LecturerResponse {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  department?: any;
  departmentId: number;
  departmentName: string;
  academicTitle: string;
  specialization: string;
}

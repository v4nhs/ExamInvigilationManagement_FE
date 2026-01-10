export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  description?: string;
  departmentId?: number;
  departmentName?: string;
}

export interface CourseRequest {
  name: string;
  code: string;
  credits: number;
  description?: string;
  departmentId?: number;
}

export interface CourseResponse extends Course {}

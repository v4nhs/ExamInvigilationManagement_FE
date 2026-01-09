export interface CourseRequest {
  code: string;
  name: string;
  credit: number;
  departmentId?: number;
}

export interface CourseResponse {
  id: number;
  code: string;
  name: string;
  credit: number;
  departmentName?: string;
}

export interface ExamSchedule {
  id: number;
  course?: any;  
  courseId?: number;
  courseName?: string;  
  courseCode?: string;  
  examDate: string;  
  examDay: string; 
  examTime: string;  
  endTime?: string; 
  examType: string;  
  room?: string;
  studentCount?: number;
  invigilatorCount?: number;
  description?: string;
  status?: string;
}

export interface CreateExamScheduleRequest {
  courseId: number;
  examDate: string;
  examTime: string;
  endTime: string;
  examDay: string;
  examType: string;
  room: string;
  invigilatorCount: number;
  description?: string;
}

export interface AssignLecturerRequest {
  lecturerIds: number[];
  room: string;
  studentCount: number;
}

export interface ExamAssignment {
  id: number;
  examScheduleId: number;
  lecturerId: number;
  lecturerName: string;
  lecturerEmail: string;
  room: string;
  studentCount: number;
  assignmentType: string; 
  assignedAt: string;
}

export interface AvailableLecturer {
  id: number;
  fullName: string;
  department?: string;
  academicTitle?: string;
  specialization?: string;
}

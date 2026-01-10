export interface ExamSchedule {
  id: number;
  course?: any;  // Course object
  courseId?: number;
  courseName?: string;  // from course.name
  courseCode?: string;  // from course.code
  examDate: string;  // LocalDate format: yyyy-MM-dd
  examDay: string;  // Thứ 2, Thứ 3, etc.
  examTime: string;  // LocalTime format: HH:mm:ss
  endTime?: string;  // LocalTime format: HH:mm:ss
  examType: string;  // WRITTEN, OTHER
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
  assignmentType: string; // WRITTEN, OTHER
  assignedAt: string;
}

export interface AvailableLecturer {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  academicTitle?: string;
  specialization?: string;
}

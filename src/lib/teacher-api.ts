// Teacher Dashboard API Service

const API_BASE = '/api/teacher';

// Get auth headers for API calls
const getAuthHeaders = (): HeadersInit => {
  const session = JSON.parse(localStorage.getItem('caribbeanAI_rbac_session') || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`
  };
};

export interface TeacherClass {
  id: number;
  name: string;
  subject: string;
  grade_level: string;
  max_students: number;
  is_active: boolean;
  school_name: string;
  student_count: number;
}

export interface ClassOverview {
  classInfo: {
    id: number;
    name: string;
    subject: string;
    grade_level: string;
    student_count: number;
    school_name: string;
  };
  analytics: {
    activeStudents: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    averageTimeSpent: number; // in minutes
    overallAccuracy: number; // percentage
    topicsPracticed: Array<{
      topic: string;
      sessionCount: number;
      averageAccuracy: number;
    }>;
    curriculumCoverage: number; // percentage
  };
}

export interface StudentProfile {
  studentId: number;
  studentName: string;
  email: string;
  analytics: {
    totalTimeSpent: number; // in minutes
    averageSessionDuration: number; // in minutes
    totalSessions: number;
    accuracyRate: number; // percentage
    engagementStreak: number; // days
    recentActivity: Array<{
      date: string;
      sessionsCompleted: number;
      timeSpent: number;
      averageAccuracy: number;
    }>;
    topicMastery: Array<{
      topic: string;
      masteryLevel: number; // percentage
      sessionsCompleted: number;
      timeSpent: number;
    }>;
    lastActive: string | null;
  };
}

export interface StudentsProgress {
  classInfo: {
    id: number;
    name: string;
    subject: string;
    grade_level: string;
  };
  students: StudentProfile[];
}

// API Functions
export const teacherAPI = {
  // Get teacher's classes
  async getClasses(): Promise<TeacherClass[]> {
    try {
      const response = await fetch(`${API_BASE}/classes`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch teacher classes:', error);
      throw new Error('Failed to load classes');
    }
  },

  // Get class overview analytics
  async getClassOverview(classId: number): Promise<ClassOverview> {
    try {
      const response = await fetch(`${API_BASE}/class/${classId}/overview`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch class overview:', error);
      throw new Error('Failed to load class overview');
    }
  },

  // Get detailed student progress for a class
  async getStudentsProgress(classId: number): Promise<StudentsProgress> {
    try {
      const response = await fetch(`${API_BASE}/class/${classId}/students`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch students progress:', error);
      throw new Error('Failed to load student progress');
    }
  }
};
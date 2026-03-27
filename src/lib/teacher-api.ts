// Teacher Dashboard API Service

const API_BASE = '/api/teacher';

// Get auth headers — prefer RBAC token, fall back to main-app token
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('caribbeanAI_auth_token')
    || localStorage.getItem('caribbeanAI_token')
    || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export interface TeacherClass {
  id: number;
  name: string;
  subject: string;
  gradeLevel: string;
  maxStudents: number;
  isActive: boolean;
  schoolId: number;
  schoolName: string;
  totalStudents: number;
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
    activeStudents: { daily: number; weekly: number; monthly: number };
    averageTimeSpent: number;
    overallAccuracy: number;
    topicsPracticed: Array<{ topic: string; sessionCount: number; averageAccuracy: number }>;
    curriculumCoverage: number;
  };
}

export interface StudentProfile {
  studentId: number;
  studentName: string;
  email: string;
  analytics: {
    totalTimeSpent: number;
    averageSessionDuration: number;
    totalSessions: number;
    accuracyRate: number;
    engagementStreak: number;
    recentActivity: Array<{
      date: string;
      sessionsCompleted: number;
      timeSpent: number;
      averageAccuracy: number;
    }>;
    topicMastery: Array<{
      topic: string;
      masteryLevel: number;
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
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.classes || data;
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
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Server returns flat overview; transform to nested structure components expect
      const raw = data.overview || data;
      return {
        classInfo: {
          id: classId,
          name: raw.className || '',
          subject: raw.subject || '',
          grade_level: raw.gradeLevel || '',
          student_count: raw.totalStudents ?? 0,
          school_name: raw.schoolName || '',
        },
        analytics: {
          activeStudents: {
            daily: raw.activeStudentsToday ?? 0,
            weekly: raw.activeStudentsThisWeek ?? 0,
            monthly: raw.activeStudentsThisMonth ?? 0,
          },
          averageTimeSpent: raw.avgTimePerStudent ?? 0,
          overallAccuracy: raw.overallAccuracyRate ?? 0,
          topicsPracticed: raw.topicsMostPracticed || [],
          curriculumCoverage: raw.curriculumCoverage ?? 0,
        },
      };
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
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Remap server response shape to the StudentProfile shape components expect.
      // Server returns: { studentId, user: { fullName, email }, progress: { timeSpent, accuracyRate, ... } }
      // Components expect: { studentId, studentName, email, analytics: { totalTimeSpent, ... } }
      const rawStudents: any[] = data.students || [];
      const students: StudentProfile[] = rawStudents.map((s: any) => {
        const prog = s.progress || s.analytics || {};
        const rawActivity: any[] = prog.recentActivity || [];
        const rawMastery: any[] = prog.topicMastery || [];

        const totalSessions = rawActivity.reduce((sum: number, d: any) => sum + (Number(d.sessionsCount ?? d.sessionsCompleted ?? 1)), 0);

        return {
          studentId: s.studentId,
          studentName: s.user?.fullName || s.studentName || 'Student',
          email: s.user?.email || s.email || '',
          analytics: {
            totalTimeSpent: Number(prog.timeSpent ?? prog.totalTimeSpent ?? 0),
            averageSessionDuration: totalSessions > 0
              ? Number(prog.timeSpent ?? prog.totalTimeSpent ?? 0) / totalSessions
              : 0,
            totalSessions,
            accuracyRate: Number(prog.accuracyRate ?? 0),
            engagementStreak: Number(prog.engagementStreak ?? 0),
            lastActive: prog.lastActive ?? null,
            recentActivity: rawActivity.map((a: any) => ({
              date: a.date,
              sessionsCompleted: Number(a.sessionsCount ?? a.sessionsCompleted ?? 1),
              timeSpent: Number(a.totalTime ?? a.timeSpent ?? 0),
              averageAccuracy: parseFloat(String(a.accuracyRate ?? a.averageAccuracy ?? 0)),
            })),
            topicMastery: rawMastery.map((t: any) => ({
              topic: t.topic,
              // masteryLevel as a percentage number (0-100)
              masteryLevel: parseFloat(String(t.accuracyRate ?? t.masteryLevel ?? 0)),
              sessionsCompleted: Number(t.totalProblems ?? t.sessionsCompleted ?? 0),
              timeSpent: Number(t.timeSpent ?? 0),
            })),
          },
        };
      });

      return {
        classInfo: data.classInfo || { id: classId, name: '', subject: '', grade_level: '' },
        students,
      };
    } catch (error) {
      console.error('Failed to fetch students progress:', error);
      throw new Error('Failed to load student progress');
    }
  },
};

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class AuthService {
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private hashPassword(password: string): string {
    // Simple hash for demonstration - in production, use proper bcrypt
    return btoa(password + 'salt');
  }

  private getStoredUsers(): any[] {
    const users = localStorage.getItem('caribbeanAI_users');
    if (users) {
      return JSON.parse(users);
    }
    
    // Create demo accounts if no users exist
    const demoAccounts = this.createDemoAccounts();
    if (demoAccounts.length > 0) {
      this.saveUsers(demoAccounts);
      return demoAccounts;
    }
    
    return [];
  }

  private createDemoAccounts(): any[] {
    const demoUsers = [
      // Students
      { email: 'emily.student@demo.com', fullName: 'Emily Johnson', role: 'student', password: 'demo123' },
      { email: 'marcus.student@demo.com', fullName: 'Marcus Williams', role: 'student', password: 'demo123' },
      { email: 'sophia.student@demo.com', fullName: 'Sophia Garcia', role: 'student', password: 'demo123' },
      
      // Parents
      { email: 'parent.johnson@demo.com', fullName: 'Robert Johnson', role: 'parent', password: 'demo123' },
      { email: 'parent.williams@demo.com', fullName: 'Lisa Williams', role: 'parent', password: 'demo123' },
      { email: 'parent.garcia@demo.com', fullName: 'Carlos Garcia', role: 'parent', password: 'demo123' },
      
      // Teachers
      { email: 'teacher.math@demo.com', fullName: 'Dr. Sarah Martinez', role: 'teacher', password: 'demo123' },
      { email: 'teacher.science@demo.com', fullName: 'Prof. Michael Chen', role: 'teacher', password: 'demo123' },
      
      // Admins
      { email: 'admin.school@demo.com', fullName: 'Principal James Wilson', role: 'school_admin', password: 'demo123' },
      { email: 'admin.system@demo.com', fullName: 'System Administrator', role: 'system_admin', password: 'demo123' }
    ];

    const users = demoUsers.map(user => ({
      id: this.generateId(),
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      phone: undefined,
      is_active: true,
      password_hash: this.hashPassword(user.password)
    }));

    // Also create localStorage demo data for children and progress when accounts are created
    this.createFrontendDemoData();

    return users;
  }

  private createFrontendDemoData(): void {
    // Only create demo data if it doesn't already exist
    if (localStorage.getItem('caribbean_ai_children')) {
      return;
    }

    // Create children data for parents
    const childrenData = [
      // Robert Johnson's children
      {
        id: '1001',
        name: 'Alex Johnson',
        age: 14,
        grade: 'form-3',
        exam: 'csec',
        parentId: 'parent.johnson@demo.com',
        avatar: '/avatars/student1.png',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'English Language']
      },
      {
        id: '1002',
        name: 'Maya Johnson',
        age: 11,
        grade: 'standard-5',
        exam: 'sea',
        parentId: 'parent.johnson@demo.com',
        avatar: '/avatars/student2.png',
        subjects: ['Mathematics', 'Science', 'English Language', 'Social Studies']
      },
      // Lisa Williams' children
      {
        id: '1003',
        name: 'Tyler Williams',
        age: 15,
        grade: 'form-4',
        exam: 'csec',
        parentId: 'parent.williams@demo.com',
        avatar: '/avatars/student3.png',
        subjects: ['Mathematics', 'Biology', 'Chemistry', 'History', 'English Language']
      },
      {
        id: '1004',
        name: 'Zoe Williams',
        age: 13,
        grade: 'form-2',
        exam: 'high-school-entrance',
        parentId: 'parent.williams@demo.com',
        avatar: '/avatars/student4.png',
        subjects: ['Mathematics', 'Physics', 'Geography', 'English Language']
      },
      // Carlos Garcia's children
      {
        id: '1005',
        name: 'Diego Garcia',
        age: 16,
        grade: 'form-5',
        exam: 'cape',
        parentId: 'parent.garcia@demo.com',
        avatar: '/avatars/student5.png',
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English Literature']
      },
      {
        id: '1006',
        name: 'Sofia Garcia',
        age: 10,
        grade: 'standard-4',
        exam: 'sea',
        parentId: 'parent.garcia@demo.com',
        avatar: '/avatars/student6.png',
        subjects: ['Mathematics', 'Science', 'English Language', 'Art']
      }
    ];

    // Create progress data
    const progressData = [
      // Alex Johnson (1001) progress
      { childId: '1001', subject: 'Mathematics', topic: 'Algebra', completed: 17, total: 20, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1001', subject: 'Mathematics', topic: 'Geometry', completed: 14, total: 18, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1001', subject: 'Physics', topic: 'Mechanics', completed: 11, total: 16, lastUpdate: new Date(Date.now() - 259200000).toISOString() },
      { childId: '1001', subject: 'Chemistry', topic: 'Atomic Structure', completed: 18, total: 20, lastUpdate: new Date(Date.now() - 86400000).toISOString() },

      // Maya Johnson (1002) progress
      { childId: '1002', subject: 'Mathematics', topic: 'Fractions', completed: 15, total: 18, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1002', subject: 'Mathematics', topic: 'Decimals', completed: 16, total: 18, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1002', subject: 'Science', topic: 'Plant Biology', completed: 12, total: 16, lastUpdate: new Date(Date.now() - 345600000).toISOString() },
      { childId: '1002', subject: 'English Language', topic: 'Comprehension', completed: 13, total: 15, lastUpdate: new Date(Date.now() - 86400000).toISOString() },

      // Tyler Williams (1003) progress  
      { childId: '1003', subject: 'Mathematics', topic: 'Calculus Basics', completed: 19, total: 24, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1003', subject: 'Biology', topic: 'Cell Structure', completed: 22, total: 25, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1003', subject: 'Chemistry', topic: 'Chemical Bonding', completed: 14, total: 19, lastUpdate: new Date(Date.now() - 259200000).toISOString() },
      { childId: '1003', subject: 'History', topic: 'Caribbean History', completed: 17, total: 20, lastUpdate: new Date(Date.now() - 345600000).toISOString() },

      // Zoe Williams (1004) progress
      { childId: '1004', subject: 'Mathematics', topic: 'Linear Equations', completed: 19, total: 25, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1004', subject: 'Physics', topic: 'Forces and Motion', completed: 13, total: 16, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1004', subject: 'Geography', topic: 'Physical Geography', completed: 11, total: 15, lastUpdate: new Date(Date.now() - 259200000).toISOString() },

      // Diego Garcia (1005) progress (top performer)
      { childId: '1005', subject: 'Mathematics', topic: 'Advanced Calculus', completed: 37, total: 40, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1005', subject: 'Physics', topic: 'Electromagnetic Theory', completed: 26, total: 30, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1005', subject: 'Chemistry', topic: 'Organic Chemistry', completed: 18, total: 20, lastUpdate: new Date(Date.now() - 86400000).toISOString() },
      { childId: '1005', subject: 'Computer Science', topic: 'Data Structures', completed: 19, total: 20, lastUpdate: new Date(Date.now() - 86400000).toISOString() },

      // Sofia Garcia (1006) progress
      { childId: '1006', subject: 'Mathematics', topic: 'Basic Operations', completed: 14, total: 16, lastUpdate: new Date(Date.now() - 172800000).toISOString() },
      { childId: '1006', subject: 'Science', topic: 'Animals and Plants', completed: 10, total: 12, lastUpdate: new Date(Date.now() - 259200000).toISOString() },
      { childId: '1006', subject: 'English Language', topic: 'Reading Skills', completed: 11, total: 14, lastUpdate: new Date(Date.now() - 86400000).toISOString() }
    ];

    // Create subject enrollments
    const enrollmentData = [];
    childrenData.forEach(child => {
      child.subjects.forEach(subject => {
        enrollmentData.push({
          childId: child.id,
          subject: subject,
          enrolledAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
        });
      });
    });

    // Store all demo data in localStorage
    localStorage.setItem('caribbean_ai_children', JSON.stringify(childrenData));
    localStorage.setItem('caribbean_ai_progress', JSON.stringify(progressData));
    localStorage.setItem('caribbean_ai_enrollments', JSON.stringify(enrollmentData));

    console.log('✅ Demo children and progress data created successfully');
  }

  private saveUsers(users: any[]): void {
    localStorage.setItem('caribbeanAI_users', JSON.stringify(users));
  }

  private getCurrentSession(): { userId: number; token: string } | null {
    const session = localStorage.getItem('caribbeanAI_session');
    return session ? JSON.parse(session) : null;
  }

  private saveSession(userId: number): string {
    const token = btoa(JSON.stringify({ userId, timestamp: Date.now() }));
    localStorage.setItem('caribbeanAI_session', JSON.stringify({ userId, token }));
    return token;
  }

  private clearSession(): void {
    localStorage.removeItem('caribbeanAI_session');
  }

  async signUp(email: string, password: string, fullName: string, role: UserRole, phone?: string): Promise<AuthResponse> {
    try {
      const users = this.getStoredUsers();
      console.log('Attempting signup for:', email);
      
      // Check if user already exists (case-insensitive)
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, error: 'An account with this email already exists. Try signing in instead.' };
      }

      // Create new user
      const user: User = {
        id: this.generateId(),
        email,
        full_name: fullName,
        role,
        phone,
        is_active: true
      };

      // Store user with hashed password
      const userWithPassword = { ...user, password_hash: this.hashPassword(password) };
      users.push(userWithPassword);
      this.saveUsers(users);

      // Create session
      this.saveSession(user.id);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during signup' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      let users = this.getStoredUsers();
      console.log('Total users in system:', users.length);
      
      // Make email comparison case-insensitive
      let userWithPassword = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      // If user not found and trying to access demo account, recreate demo accounts
      if (!userWithPassword && email.includes('@demo.com')) {
        console.log('Demo account not found, recreating demo accounts...');
        const demoAccounts = this.createDemoAccounts();
        this.saveUsers(demoAccounts);
        users = demoAccounts;
        userWithPassword = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      }

      if (!userWithPassword) {
        console.log('No user found with email:', email);
        if (users.length === 0) {
          return { user: null, error: 'No accounts exist yet. Please sign up first.' };
        }
        return { user: null, error: 'No account found with this email address. Please check your email or sign up.' };
      }
      
      if (userWithPassword.password_hash !== this.hashPassword(password)) {
        console.log('Password mismatch for user:', email);
        return { user: null, error: 'Incorrect password. Please check your password and try again.' };
      }

      const { password_hash, ...user } = userWithPassword;

      if (!user.is_active) {
        return { user: null, error: 'Your account has been deactivated' };
      }

      // Create session
      this.saveSession(user.id);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred during sign in' };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const session = this.getCurrentSession();
      if (!session) {
        return null;
      }

      const users = this.getStoredUsers();
      const userWithPassword = users.find(u => u.id === session.userId);
      
      if (!userWithPassword) {
        this.clearSession();
        return null;
      }

      const { password_hash, ...user } = userWithPassword;
      return user;
    } catch (error) {
      return null;
    }
  }

  async signOut(): Promise<void> {
    this.clearSession();
  }

  async getToken(): Promise<string | null> {
    const session = this.getCurrentSession();
    return session?.token || null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}

export const authService = new AuthService();
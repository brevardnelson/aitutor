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

    return demoUsers.map(user => ({
      id: this.generateId(),
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      phone: undefined,
      is_active: true,
      password_hash: this.hashPassword(user.password)
    }));
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
      const users = this.getStoredUsers();
      console.log('Total users in system:', users.length);
      
      // Make email comparison case-insensitive
      const userWithPassword = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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
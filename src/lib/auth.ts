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
    return users ? JSON.parse(users) : [];
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
      
      // Check if user already exists
      if (users.find(u => u.email === email)) {
        return { user: null, error: 'An account with this email already exists' };
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
      const userWithPassword = users.find(u => u.email === email);

      if (!userWithPassword || userWithPassword.password_hash !== this.hashPassword(password)) {
        return { user: null, error: 'Invalid email or password' };
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
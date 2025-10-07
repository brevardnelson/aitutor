// API service for children and progress data

export interface Child {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  targetExam?: string;
  subjects: string[];
}

export interface ProgressData {
  id: number;
  studentId: number;
  subject: string;
  topic: string;
  completed: number;
  total: number;
  lastAccessed: string;
  performanceScore: string;
}

class ChildrenAPIService {
  private readonly API_URL = '/api/parent';

  private getToken(): string | null {
    return localStorage.getItem('caribbeanAI_token');
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Get all children for the authenticated parent
  async getChildren(): Promise<Child[]> {
    try {
      const data = await this.fetchWithAuth(`${this.API_URL}/children`);
      return data.children || [];
    } catch (error) {
      console.error('Get children error:', error);
      throw error;
    }
  }

  // Get a specific child by ID
  async getChild(childId: number): Promise<Child> {
    try {
      const data = await this.fetchWithAuth(`${this.API_URL}/children/${childId}`);
      return data.child;
    } catch (error) {
      console.error('Get child error:', error);
      throw error;
    }
  }

  // Create a new child
  async createChild(childData: {
    name: string;
    age: number;
    gradeLevel: string;
    targetExam?: string;
    subjects: string[];
  }): Promise<Child> {
    try {
      const data = await this.fetchWithAuth(`${this.API_URL}/children`, {
        method: 'POST',
        body: JSON.stringify(childData),
      });
      return data.child;
    } catch (error) {
      console.error('Create child error:', error);
      throw error;
    }
  }

  // Update a child
  async updateChild(childId: number, updates: {
    name?: string;
    age?: number;
    gradeLevel?: string;
    targetExam?: string;
    subjects?: string[];
  }): Promise<Child> {
    try {
      const data = await this.fetchWithAuth(`${this.API_URL}/children/${childId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return data.child;
    } catch (error) {
      console.error('Update child error:', error);
      throw error;
    }
  }

  // Delete a child
  async deleteChild(childId: number): Promise<void> {
    try {
      await this.fetchWithAuth(`${this.API_URL}/children/${childId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete child error:', error);
      throw error;
    }
  }

  // Get progress for a specific child
  async getChildProgress(childId: number): Promise<ProgressData[]> {
    try {
      const data = await this.fetchWithAuth(`${this.API_URL}/children/${childId}/progress`);
      return data.progress || [];
    } catch (error) {
      console.error('Get child progress error:', error);
      throw error;
    }
  }
}

export const childrenAPI = new ChildrenAPIService();

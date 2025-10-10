// Learning session tracking service
// This handles starting/ending sessions and recording problem attempts

export interface LearningSessionData {
  studentId: number;
  subject: string;
  topic: string;
  sessionType: 'practice' | 'test' | 'review';
}

export interface ProblemAttemptData {
  problemId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  attempts: number;
  hintsUsed: number;
  timeSpent: number;
  isCorrect: boolean;
  isCompleted: boolean;
  needsAIIntervention: boolean;
  skippedToFinalHint: boolean;
}

export class LearningTracker {
  private currentSessionId: number | null = null;
  private sessionStartTime: number = 0;
  private problemStartTime: number = 0;

  // Start a new learning session
  async startSession(data: LearningSessionData): Promise<number> {
    try {
      const response = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const errorMessage = `Failed to start session: ${response.status} ${response.statusText} - ${errorText}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();
      this.currentSessionId = result.sessionId;
      this.sessionStartTime = Date.now();
      
      console.log(`Started learning session ${this.currentSessionId} for ${data.topic}`);
      return this.currentSessionId;
    } catch (error) {
      console.error('Error starting learning session:', error instanceof Error ? error.message : String(error), error);
      throw error;
    }
  }

  // End the current learning session
  async endSession(sessionMetrics: {
    problemsAttempted: number;
    problemsCompleted: number;
    correctAnswers: number;
    hintsUsed: number;
  }): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('No active session to end');
      return;
    }

    try {
      const duration = Math.round((Date.now() - this.sessionStartTime) / 1000); // Convert to seconds

      const response = await fetch(`/api/sessions/${this.currentSessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          duration,
          ...sessionMetrics,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to end session: ${response.statusText}`);
      }

      console.log(`Ended learning session ${this.currentSessionId} (${duration}s)`);
      this.currentSessionId = null;
      this.sessionStartTime = 0;
      this.problemStartTime = 0; // Reset problem timer too
    } catch (error) {
      console.error('Error ending learning session:', error);
      throw error;
    }
  }

  // Session cleanup method for abandoning sessions (navigation/unmount)
  async abandonSession(reason: string = 'Navigation/unmount'): Promise<void> {
    if (!this.currentSessionId) {
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${this.currentSessionId}/abandon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        console.error(`Failed to abandon session: ${response.statusText}`);
      } else {
        console.log(`Abandoned learning session ${this.currentSessionId}: ${reason}`);
      }
    } catch (error) {
      console.error('Error abandoning learning session:', error);
    } finally {
      this.currentSessionId = null;
      this.sessionStartTime = 0;
      this.problemStartTime = 0;
    }
  }

  // Record a problem attempt
  async recordProblemAttempt(
    studentId: number,
    subject: string,
    topic: string,
    problemData: ProblemAttemptData
  ): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('No active session for problem attempt');
      return;
    }

    try {
      const response = await fetch(`/api/sessions/${this.currentSessionId}/problem-attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          subject,
          topic,
          problemData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record problem attempt: ${response.statusText}`);
      }

      console.log(`Recorded problem attempt for ${problemData.problemId}`);
    } catch (error) {
      console.error('Error recording problem attempt:', error);
      // Don't throw here - we don't want to break the learning flow
    }
  }

  // Utility methods for timing
  startProblemTimer(): void {
    this.problemStartTime = Date.now();
    console.log('Started problem timer at:', new Date(this.problemStartTime).toISOString());
  }

  getProblemTimeSpent(): number {
    if (this.problemStartTime <= 0) {
      console.warn('Problem timer was never started');
      return 0;
    }
    const timeSpent = Math.round((Date.now() - this.problemStartTime) / 1000);
    console.log(`Problem time spent: ${timeSpent}s`);
    return timeSpent;
  }

  resetProblemTimer(): void {
    this.problemStartTime = 0;
  }

  // Get current session info
  getCurrentSessionId(): number | null {
    return this.currentSessionId;
  }

  isSessionActive(): boolean {
    return this.currentSessionId !== null;
  }

  // Helper method to determine difficulty based on topic and question characteristics
  static determineDifficulty(topic: string, questionText: string): 'easy' | 'medium' | 'hard' {
    // Simple heuristic - could be made more sophisticated
    const textLength = questionText.length;
    const hasMultipleSteps = questionText.includes('and') || questionText.includes('then');
    const hasComplexNumbers = /\d+\.\d+|\d+\/\d+|\d+%/.test(questionText);

    if (textLength > 150 || hasMultipleSteps) {
      return 'hard';
    } else if (textLength > 80 || hasComplexNumbers) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  // Helper to get current user/child context from app context
  static getCurrentStudentId(): number {
    try {
      // Try to get current child from localStorage (AppContext persists it there)
      const appState = localStorage.getItem('caribbean_ai_current_child');
      if (appState) {
        const currentChild = JSON.parse(appState);
        return parseInt(currentChild.id) || 1;
      }
      
      // Fallback: check if there's a selected child in children list
      const children = localStorage.getItem('caribbean_ai_children');
      if (children) {
        const childrenList = JSON.parse(children);
        if (childrenList.length > 0) {
          return parseInt(childrenList[0].id) || 1;
        }
      }
      
      // Final fallback
      return 1;
    } catch (error) {
      console.error('Error getting current student ID:', error);
      return 1;
    }
  }
}

// Export a singleton instance
export const learningTracker = new LearningTracker();
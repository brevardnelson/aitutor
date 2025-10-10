import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Import from the integration blueprints - referenced from javascript_openai and javascript_anthropic
// The newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
// The newest Anthropic model is "claude-sonnet-4-20250514"

export type Subject = 'math' | 'english' | 'science' | 'social-studies' | 'reasoning';
export type AIProvider = 'openai' | 'anthropic';

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
}

export interface TutoringRequest {
  subject: Subject;
  topic: string;
  userMessage: string;
  context?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  gradeLevel?: string; // e.g., 'standard-5', 'form-3', 'grade-7'
  targetExam?: string; // e.g., 'common-entrance', 'sea', 'csec'
  curriculumContext?: string; // Extracted curriculum content for this grade/topic
}

// Subject-specific model routing configuration
const SUBJECT_MODEL_CONFIG = {
  math: {
    primary: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    backup: { provider: 'openai', model: 'gpt-5' }
  },
  english: {
    primary: { provider: 'openai', model: 'gpt-5' },
    backup: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' }
  },
  science: {
    primary: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    backup: { provider: 'openai', model: 'gpt-5' }
  },
  'social-studies': {
    primary: { provider: 'openai', model: 'gpt-5' },
    backup: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' }
  },
  reasoning: {
    primary: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
    backup: { provider: 'openai', model: 'gpt-5' }
  }
} as const;

export class MultiModalAIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    // Initialize only on server side or when API keys are available
    if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY 
      });
    }
    
    if (typeof window === 'undefined' && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Get the optimal AI model for a given subject
   */
  getOptimalModel(subject: Subject): { provider: AIProvider; model: string } {
    return SUBJECT_MODEL_CONFIG[subject].primary;
  }

  /**
   * Get the backup AI model for a given subject
   */
  getBackupModel(subject: Subject): { provider: AIProvider; model: string } {
    return SUBJECT_MODEL_CONFIG[subject].backup;
  }

  /**
   * Generate Caribbean-focused educational content using optimal model for subject
   * For now, returns mock response on client side - will be replaced with API calls
   */
  async generateTutoringResponse(request: TutoringRequest): Promise<AIResponse> {
    // On client side, return mock response for now
    if (typeof window !== 'undefined') {
      return this.generateMockResponse(request);
    }

    const { primary } = SUBJECT_MODEL_CONFIG[request.subject];
    
    try {
      if (primary.provider === 'anthropic' && this.anthropic) {
        return await this.callAnthropic(request, primary.model);
      } else if (primary.provider === 'openai' && this.openai) {
        return await this.callOpenAI(request, primary.model);
      } else {
        return this.generateMockResponse(request);
      }
    } catch (error) {
      console.warn(`Primary model failed for ${request.subject}, trying backup:`, error);
      
      // Fallback to backup model
      const { backup } = SUBJECT_MODEL_CONFIG[request.subject];
      try {
        if (backup.provider === 'anthropic' && this.anthropic) {
          return await this.callAnthropic(request, backup.model);
        } else if (backup.provider === 'openai' && this.openai) {
          return await this.callOpenAI(request, backup.model);
        } else {
          return this.generateMockResponse(request);
        }
      } catch (backupError) {
        return this.generateMockResponse(request);
      }
    }
  }

  /**
   * Generate mock response for client-side testing
   */
  private generateMockResponse(request: TutoringRequest): AIResponse {
    const { primary } = SUBJECT_MODEL_CONFIG[request.subject];
    
    const mockResponses = {
      math: "Let's break this down step by step. Can you tell me what mathematical operation we need to perform first?",
      english: "That's a great question about grammar! Let's explore the structure of this sentence together.",
      science: "Excellent observation! In Caribbean ecosystems, we can see this principle in action. What do you think happens next?",
      'social-studies': "This is an important part of Caribbean history. Can you think of how this might have affected the people of that time?",
      reasoning: "Good thinking! Let's approach this logically. What clues can we use to solve this step?"
    };
    
    return {
      content: mockResponses[request.subject] || mockResponses.math,
      model: primary.model,
      provider: primary.provider
    };
  }

  /**
   * Call Anthropic Claude models
   */
  private async callAnthropic(request: TutoringRequest, model: string): Promise<AIResponse> {
    const systemPrompt = this.getSystemPrompt(request.subject, request.difficulty, request.gradeLevel, request.targetExam);
    const userPrompt = this.buildUserPrompt(request);

    const response = await this.anthropic.messages.create({
      model: model,
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      model,
      provider: 'anthropic'
    };
  }

  /**
   * Call OpenAI GPT models
   */
  private async callOpenAI(request: TutoringRequest, model: string): Promise<AIResponse> {
    const systemPrompt = this.getSystemPrompt(request.subject, request.difficulty, request.gradeLevel, request.targetExam);
    const userPrompt = this.buildUserPrompt(request);

    const response = await this.openai.chat.completions.create({
      model: model,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    return {
      content: response.choices[0].message.content || '',
      model,
      provider: 'openai'
    };
  }

  /**
   * Generate subject-specific system prompts optimized for Caribbean education
   */
  private getSystemPrompt(subject: Subject, difficulty: string = 'intermediate', gradeLevel?: string, targetExam?: string): string {
    const gradeLevelInfo = gradeLevel ? `\nStudent Grade Level: ${gradeLevel.replace('-', ' ').toUpperCase()}` : '';
    const examInfo = targetExam ? `\nTarget Exam: ${targetExam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}` : '';
    
    const basePrompt = `You are an expert Caribbean AI tutor specializing in ${subject.replace('-', ' ')}. 
Your teaching approach should be culturally relevant to Caribbean students and aligned with regional exam standards (Common Entrance, SEA, CXC).${gradeLevelInfo}${examInfo}

CRITICAL: Create questions and content that are AGE-APPROPRIATE and GRADE-APPROPRIATE for this specific level.
- For primary school students (Infant 1-2, Standard 1-5): Use simple language, basic concepts, concrete examples
- For secondary school students (Form 1-6): Use more advanced vocabulary, abstract thinking, complex problem-solving
- Ensure difficulty matches the student's current grade level and preparation needs for their target exam

Use the Socratic method to guide students through problems step-by-step rather than giving direct answers.
Incorporate Caribbean contexts, examples, and cultural references when appropriate.
Adapt your language and complexity to ${difficulty} level.`;

    const subjectSpecific = {
      math: `
        Focus on mathematical accuracy and step-by-step problem solving.
        Break down complex problems into manageable steps.
        Provide clear explanations for each mathematical operation.
        Use real-world Caribbean examples (currency, measurements, local scenarios).`,
      
      english: `
        Emphasize proper grammar, reading comprehension, and creative expression.
        Use Caribbean literature examples when relevant.
        Help with essay structure, vocabulary building, and critical analysis.
        Be encouraging and supportive of creative expression.`,
      
      science: `
        Provide accurate scientific explanations with real-world applications.
        Use Caribbean environmental examples (hurricanes, coral reefs, tropical ecosystems).
        Encourage scientific thinking and hypothesis formation.
        Connect concepts to everyday Caribbean life.`,
      
      'social-studies': `
        Focus on Caribbean history, geography, and civics.
        Provide accurate historical information and cultural context.
        Encourage critical thinking about social issues.
        Connect past events to present-day Caribbean society.`,
      
      reasoning: `
        Guide students through logical thinking processes.
        Break down complex problems into logical steps.
        Encourage pattern recognition and critical analysis.
        Use puzzles and scenarios relevant to Caribbean students.`
    };

    return basePrompt + '\n\n' + subjectSpecific[subject];
  }

  /**
   * Build user-facing prompts with context
   */
  private buildUserPrompt(request: TutoringRequest): string {
    let prompt = `Topic: ${request.topic}\n\n`;
    
    if (request.gradeLevel) {
      prompt += `Student Grade Level: ${request.gradeLevel.replace('-', ' ').toUpperCase()}\n`;
    }
    
    if (request.targetExam) {
      prompt += `Target Exam: ${request.targetExam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}\n`;
    }
    
    if (request.curriculumContext) {
      prompt += `\nRelevant Curriculum Content:\n${request.curriculumContext}\n`;
      prompt += `\nIMPORTANT: Base your questions and guidance on the curriculum content above. Ensure all content aligns with what this grade level should be learning.\n`;
    }
    
    if (request.context) {
      prompt += `\nAdditional Context: ${request.context}\n`;
    }
    
    prompt += `\nStudent Question/Request: ${request.userMessage}\n\n`;
    prompt += `Please provide a helpful, educational response that guides the student toward understanding rather than simply giving the answer. Ensure all content is appropriate for the student's grade level and references the curriculum when applicable.`;
    
    return prompt;
  }

  /**
   * Get model information for UI display
   */
  getModelInfo(subject: Subject): { primaryModel: string; primaryProvider: string; backupModel: string; backupProvider: string } {
    const config = SUBJECT_MODEL_CONFIG[subject];
    return {
      primaryModel: config.primary.model,
      primaryProvider: config.primary.provider,
      backupModel: config.backup.model,
      backupProvider: config.backup.provider
    };
  }
}

// Export singleton instance
export const aiService = new MultiModalAIService();
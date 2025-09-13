export interface StepValidationResult {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  nextGuidance?: string;
  hint?: string;
  suggestedCorrection?: string;
}

export class StepValidator {
  private static readonly SUPABASE_FUNCTION_URL = 'https://ydcbxqkwuufyjwuzxvpo.supabase.co/functions/v1/a444b884-7c1c-41c1-96de-79a8297efc80';

  private static normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9+\-*/=().\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static extractNumbers(text: string): number[] {
    const matches = text.match(/-?\d+(?:\.\d+)?/g);
    return matches ? matches.map(Number) : [];
  }

  private static extractOperations(text: string): string[] {
    const operations = text.match(/[+\-*/=]/g);
    return operations || [];
  }

  private static evaluateExpression(expr: string): number | null {
    try {
      const cleaned = expr.replace(/[^0-9+\-*/.()\s]/g, '');
      if (cleaned.match(/^[0-9+\-*/.()\s]+$/)) {
        return Function('"use strict"; return (' + cleaned + ')')();
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  }

  private static validateMathExpression(userInput: string, expectedStep: string): StepValidationResult {
    const userNumbers = this.extractNumbers(userInput);
    const expectedNumbers = this.extractNumbers(expectedStep);
    const userOps = this.extractOperations(userInput);
    const expectedOps = this.extractOperations(expectedStep);

    // Check numerical equivalence first
    const userResult = this.evaluateExpression(userInput);
    const expectedResult = this.evaluateExpression(expectedStep);
    
    if (userResult !== null && expectedResult !== null && Math.abs(userResult - expectedResult) < 0.01) {
      return {
        isCorrect: true,
        confidence: 0.95,
        feedback: "Perfect! Your calculation gives the correct result.",
        nextGuidance: "Excellent mathematical work!"
      };
    }

    // Check if numbers and operations match
    const numbersMatch = userNumbers.length > 0 && expectedNumbers.length > 0 &&
      userNumbers.some(num => expectedNumbers.some(exp => Math.abs(num - exp) < 0.01));

    const operationsMatch = userOps.length > 0 && expectedOps.length > 0 &&
      userOps.some(op => expectedOps.includes(op));

    if (numbersMatch && (operationsMatch || userOps.length === 0)) {
      return {
        isCorrect: true,
        confidence: 0.9,
        feedback: "Great! Your mathematical approach is correct.",
        nextGuidance: "Perfect calculation! Let's move forward."
      };
    }

    if (numbersMatch) {
      return {
        isCorrect: true,
        confidence: 0.8,
        feedback: "Good! You have the right numbers.",
        nextGuidance: "Your numbers are correct. Great work!"
      };
    }

    return {
      isCorrect: false,
      confidence: 0.3,
      feedback: "The mathematical expression needs adjustment.",
      suggestedCorrection: `Try: ${expectedStep}`,
      hint: "Think about what operation should be performed with these numbers."
    };
  }

  public static async validateStepWithAI(
    userInput: string, 
    expectedStep: string, 
    stepContext?: string,
    problemType?: string
  ): Promise<StepValidationResult> {
    try {
      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          expectedStep,
          stepContext,
          problemType
        })
      });

      if (!response.ok) {
        throw new Error('AI validation service unavailable');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.warn('AI validation failed, using enhanced fallback:', error);
      return this.validateStep(userInput, expectedStep, stepContext);
    }
  }

  public static validateStep(userInput: string, expectedStep: string, stepContext?: string): StepValidationResult {
    if (!userInput.trim() || !expectedStep.trim()) {
      return {
        isCorrect: false,
        confidence: 0,
        feedback: "Please provide an answer to validate.",
        hint: "Try writing out your next step or calculation."
      };
    }

    const normalizedUser = this.normalizeText(userInput);
    const normalizedExpected = this.normalizeText(expectedStep);

    // Direct match check
    if (normalizedUser === normalizedExpected) {
      return {
        isCorrect: true,
        confidence: 1.0,
        feedback: "Perfect! That's exactly right.",
        nextGuidance: "Excellent work! Ready for the next step?"
      };
    }

    // Containment check (more lenient)
    if (normalizedUser.includes(normalizedExpected) || normalizedExpected.includes(normalizedUser)) {
      return {
        isCorrect: true,
        confidence: 0.95,
        feedback: "Excellent! Your answer is correct.",
        nextGuidance: "Perfect understanding! Let's continue."
      };
    }

    // Check for mathematical expressions
    if (/[0-9+\-*/=]/.test(userInput) && /[0-9+\-*/=]/.test(expectedStep)) {
      const mathResult = this.validateMathExpression(userInput, expectedStep);
      if (mathResult.isCorrect) {
        return mathResult;
      }
    }

    // Enhanced keyword matching with fuzzy matching
    const expectedWords = expectedStep.toLowerCase().split(/\s+/)
      .filter(word => word.length > 2 && !['the', 'and', 'or', 'but', 'for', 'with', 'from', 'into', 'over', 'under', 'then', 'now'].includes(word));
    
    const userWords = userInput.toLowerCase().split(/\s+/);
    
    if (expectedWords.length > 0) {
      const matches = expectedWords.filter(word => 
        userWords.some(userWord => 
          userWord === word || 
          userWord.includes(word) || 
          word.includes(userWord) ||
          this.levenshteinDistance(userWord, word) <= 2
        )
      );
      
      const matchRatio = matches.length / expectedWords.length;
      
      if (matchRatio >= 0.5) {
        return {
          isCorrect: true,
          confidence: Math.min(0.9, 0.5 + matchRatio * 0.4),
          feedback: "Good! You understand the key concepts correctly.",
          nextGuidance: "You're thinking correctly about this step."
        };
      }
    }

    // Semantic similarity check (enhanced)
    const semanticScore = this.calculateSemanticSimilarity(normalizedUser, normalizedExpected);

    if (semanticScore >= 0.4) {
      return {
        isCorrect: true,
        confidence: semanticScore,
        feedback: "You're on the right track! Your understanding is developing well.",
        nextGuidance: "Good approach! Let's refine this further."
      };
    }

    return {
      isCorrect: false,
      confidence: semanticScore,
      feedback: "Let me help guide you to the correct approach.",
      suggestedCorrection: `The next step should be: ${expectedStep}`,
      hint: "Break down the problem into smaller parts and think about what comes next."
    };
  }

  private static calculateSemanticSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(text2.split(' ').filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }
}
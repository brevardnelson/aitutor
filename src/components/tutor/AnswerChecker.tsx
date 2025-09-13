import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnswerCheckerProps {
  userAnswer: string;
  correctAnswer: string;
  topic: string;
  onResult: (isCorrect: boolean, feedback: string) => void;
}

const AnswerChecker: React.FC<AnswerCheckerProps> = ({ 
  userAnswer, 
  correctAnswer, 
  topic, 
  onResult 
}) => {
  const checkAnswer = () => {
    const normalizedUser = normalizeAnswer(userAnswer, topic);
    const normalizedCorrect = normalizeAnswer(correctAnswer, topic);
    
    const isCorrect = compareAnswers(normalizedUser, normalizedCorrect, topic);
    const feedback = generateFeedback(userAnswer, correctAnswer, isCorrect, topic);
    
    onResult(isCorrect, feedback);
  };

  const normalizeAnswer = (answer: string, topic: string): string => {
    let normalized = answer.toLowerCase().trim();
    
    // Remove common words and spaces
    normalized = normalized.replace(/[\s,]/g, '');
    
    if (topic.includes('Fraction')) {
      // Convert mixed numbers and decimals to fractions
      normalized = convertToFraction(normalized);
    } else if (topic.includes('Decimal')) {
      // Ensure decimal format
      normalized = parseFloat(normalized).toString();
    } else if (topic.includes('Percentage')) {
      // Handle percentage formats
      normalized = normalized.replace('%', '');
    }
    
    return normalized;
  };

  const convertToFraction = (input: string): string => {
    // Handle common fraction formats
    if (input.includes('/')) return input;
    
    const decimal = parseFloat(input);
    if (!isNaN(decimal)) {
      // Convert decimal to fraction (simplified)
      const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
      const denominator = Math.pow(10, input.split('.')[1]?.length || 0);
      const numerator = decimal * denominator;
      const divisor = gcd(numerator, denominator);
      return `${numerator / divisor}/${denominator / divisor}`;
    }
    
    return input;
  };

  const compareAnswers = (user: string, correct: string, topic: string): boolean => {
    if (user === correct) return true;
    
    // Topic-specific comparisons
    if (topic.includes('Fraction')) {
      return compareFractions(user, correct);
    } else if (topic.includes('Decimal') || topic.includes('Percentage')) {
      const userNum = parseFloat(user);
      const correctNum = parseFloat(correct);
      return Math.abs(userNum - correctNum) < 0.01; // Allow small rounding errors
    }
    
    return false;
  };

  const compareFractions = (user: string, correct: string): boolean => {
    const parseFraction = (frac: string) => {
      const parts = frac.split('/');
      if (parts.length === 2) {
        return parseFloat(parts[0]) / parseFloat(parts[1]);
      }
      return parseFloat(frac);
    };
    
    const userValue = parseFraction(user);
    const correctValue = parseFraction(correct);
    
    return Math.abs(userValue - correctValue) < 0.001;
  };

  const generateFeedback = (user: string, correct: string, isCorrect: boolean, topic: string): string => {
    if (isCorrect) {
      return "Excellent! That's the correct answer. Great work!";
    }
    
    // Provide specific feedback based on topic and common mistakes
    if (topic.includes('Fraction')) {
      return "Not quite right. Remember to find a common denominator when adding fractions. Try again!";
    } else if (topic.includes('Decimal')) {
      return "Close! Double-check your decimal placement and try adding column by column.";
    } else if (topic.includes('Percentage')) {
      return "Almost there! Remember that percentage means 'per hundred'. Convert to decimal first.";
    } else if (topic.includes('Algebra')) {
      return "Good attempt! Remember to perform the same operation on both sides of the equation.";
    }
    
    return "Not quite right, but you're on the right track! Let's work through this together.";
  };

  React.useEffect(() => {
    if (userAnswer && correctAnswer) {
      checkAnswer();
    }
  }, [userAnswer, correctAnswer]);

  return null; // This is a utility component that doesn't render
};

export default AnswerChecker;
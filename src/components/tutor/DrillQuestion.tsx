import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DrillQuestionProps {
  question: string;
  options: string[];
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  topic: string;
  showFeedback?: boolean;
  correctAnswer?: string;
}

const DrillQuestion: React.FC<DrillQuestionProps> = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  topic,
  showFeedback = false,
  correctAnswer
}) => {
  const generateRealisticWrongAnswers = (correct: string, topic: string): string[] => {
    const wrongAnswers: string[] = [];
    
    if (topic === 'Fractions') {
      const fractionOptions = ['1/2', '1/3', '1/4', '2/3', '3/4', '1/6', '5/6', '3/8', '5/8', '7/8', '2/5', '3/5', '4/5'];
      const filtered = fractionOptions.filter(f => f !== correct);
      wrongAnswers.push(...filtered.slice(0, 3));
    } else if (topic === 'Decimals') {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 0.5).toFixed(2));
        wrongAnswers.push((correctNum - 0.5).toFixed(2));
        wrongAnswers.push((correctNum * 1.5).toFixed(2));
      }
    } else if (topic === 'Percentages') {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 5).toString());
        wrongAnswers.push((correctNum - 5).toString());
        wrongAnswers.push((correctNum * 2).toString());
      }
    } else if (topic === 'Basic Algebra') {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 1).toString());
        wrongAnswers.push((correctNum - 1).toString());
        wrongAnswers.push((correctNum * 2).toString());
      }
    } else if (topic === 'Word Problems') {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 3).toString());
        wrongAnswers.push((correctNum - 2).toString());
        wrongAnswers.push((correctNum + 6).toString());
      }
    } else if (topic === 'Geometry Basics') {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 4).toString());
        wrongAnswers.push((correctNum - 4).toString());
        wrongAnswers.push((correctNum * 2).toString());
      }
    } else {
      const correctNum = parseFloat(correct);
      if (!isNaN(correctNum)) {
        wrongAnswers.push((correctNum + 2).toString());
        wrongAnswers.push((correctNum - 1).toString());
        wrongAnswers.push((correctNum * 2).toString());
      } else {
        wrongAnswers.push('A', 'B', 'C');
      }
    }
    
    return wrongAnswers.slice(0, 3);
  };

  // If options are not provided or don't look realistic, generate them
  const finalOptions = options && options.length === 4 ? options : (() => {
    if (correctAnswer) {
      const wrongAnswers = generateRealisticWrongAnswers(correctAnswer, topic);
      const allOptions = [correctAnswer, ...wrongAnswers];
      return allOptions.sort(() => Math.random() - 0.5);
    }
    return options;
  })();

  const getButtonVariant = (option: string) => {
    if (!showFeedback) {
      return selectedAnswer === option ? 'default' : 'outline';
    }
    
    if (option === correctAnswer) {
      return 'default'; // Correct answer - green
    }
    
    if (selectedAnswer === option && option !== correctAnswer) {
      return 'destructive'; // Wrong selected answer - red
    }
    
    return 'outline';
  };

  const getButtonClass = (option: string) => {
    const baseClass = 'p-4 h-auto text-left justify-start transition-all';
    
    if (!showFeedback) {
      return selectedAnswer === option 
        ? `${baseClass} bg-blue-600 hover:bg-blue-700 text-white`
        : `${baseClass} hover:bg-gray-50`;
    }
    
    if (option === correctAnswer) {
      return `${baseClass} bg-green-600 hover:bg-green-700 text-white`;
    }
    
    if (selectedAnswer === option && option !== correctAnswer) {
      return `${baseClass} bg-red-600 hover:bg-red-700 text-white`;
    }
    
    return `${baseClass} opacity-50`;
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="flex justify-between items-start">
          <div className="bg-blue-50 rounded-lg p-6 text-center flex-1">
            <div className="text-xl font-mono">{question}</div>
          </div>
          <Badge className="ml-4">{topic}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {finalOptions.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === option;
            const isCorrect = showFeedback && option === correctAnswer;
            const isWrong = showFeedback && isSelected && option !== correctAnswer;
            
            return (
              <Button
                key={index}
                variant={getButtonVariant(option)}
                className={getButtonClass(option)}
                onClick={() => !showFeedback && onAnswerSelect(option)}
                disabled={showFeedback}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    !showFeedback && isSelected ? 'bg-white text-blue-600' :
                    isCorrect ? 'bg-white text-green-600' :
                    isWrong ? 'bg-white text-red-600' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-base">{option}</span>
                  {showFeedback && isCorrect && (
                    <span className="ml-auto text-white">✓</span>
                  )}
                  {showFeedback && isWrong && (
                    <span className="ml-auto text-white">✗</span>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default DrillQuestion;
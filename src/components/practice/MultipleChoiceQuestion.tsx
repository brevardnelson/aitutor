import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  topic: string;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  selectedAnswer,
  onAnswerSelect,
  topic
}) => {
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
          {options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedAnswer === option;
            
            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`p-4 h-auto text-left justify-start ${
                  isSelected ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => onAnswerSelect(option)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isSelected ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {letter}
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultipleChoiceQuestion;
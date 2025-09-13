import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import { problemBank } from './PracticeTestProblems';
import { extendedProblemBank } from './PracticeTestProblemsExtended';

interface PracticeTestProps {
  type: 'full' | 'drill';
  topics: string[];
  problemCount: number;
  onComplete: (results: TestResults) => void;
  onBack: () => void;
}

interface TestResults {
  score: number;
  totalProblems: number;
  timeSpent: number;
  topicBreakdown: Record<string, { correct: number; total: number }>;
}

interface Problem {
  question: string;
  correctAnswer: string;
  options: string[];
  topic: string;
  id: string;
}

const PracticeTest: React.FC<PracticeTestProps> = ({ type, topics, problemCount, onComplete, onBack }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);

  useEffect(() => {
    generateProblems();
  }, [topics, problemCount]);

  const generateWrongAnswers = (correct: string, topic: string): string[] => {
    const wrongAnswers: string[] = [];
    const correctNum = parseFloat(correct);
    
    if (!isNaN(correctNum)) {
      wrongAnswers.push((correctNum + 1).toString());
      wrongAnswers.push((correctNum - 1).toString());
      wrongAnswers.push((correctNum * 2).toString());
    } else {
      const commonWrong: Record<string, string[]> = {
        'Fractions': ['1/2', '1/4', '3/8', '5/6', '2/3'],
        'Decimals': ['2.5', '3.75', '1.25', '4.5'],
        'Percentages': ['15', '25', '30', '45'],
        'Basic Algebra': ['3', '5', '8', '12'],
        'Word Problems': ['12', '15', '18', '24'],
        'Geometry Basics': ['8', '12', '16', '20']
      };
      
      const topicWrong = commonWrong[topic] || ['A', 'B', 'C'];
      wrongAnswers.push(...topicWrong.filter(ans => ans !== correct).slice(0, 3));
    }
    
    return wrongAnswers.slice(0, 3);
  };

  const generateProblems = () => {
    const allProblems = { ...problemBank, ...extendedProblemBank };
    const selectedProblems: Problem[] = [];
    const usedIds = new Set<string>();
    const problemsPerTopic = Math.floor(problemCount / topics.length);
    const remainder = problemCount % topics.length;

    topics.forEach((topic, index) => {
      const topicProblems = allProblems[topic] || [];
      const numProblemsForTopic = problemsPerTopic + (index < remainder ? 1 : 0);
      
      const shuffled = [...topicProblems].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numProblemsForTopic && i < shuffled.length; i++) {
        const baseProblem = shuffled[i];
        if (!usedIds.has(baseProblem.id)) {
          const wrongAnswers = generateWrongAnswers(baseProblem.correctAnswer, topic);
          const allOptions = [baseProblem.correctAnswer, ...wrongAnswers];
          const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
          
          selectedProblems.push({
            ...baseProblem,
            options: shuffledOptions
          });
          usedIds.add(baseProblem.id);
        }
      }
    });

    const finalProblems = selectedProblems.sort(() => Math.random() - 0.5);
    setProblems(finalProblems);
    setUserAnswers(new Array(finalProblems.length).fill(''));
  };

  const handleNext = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = currentAnswer;
    setUserAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = (answers: string[]) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    let correct = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};

    problems.forEach((problem, index) => {
      const topic = problem.topic;
      if (!topicBreakdown[topic]) {
        topicBreakdown[topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[topic].total++;

      if (answers[index] === problem.correctAnswer) {
        correct++;
        topicBreakdown[topic].correct++;
      }
    });

    const testResults: TestResults = {
      score: correct,
      totalProblems: problems.length,
      timeSpent,
      topicBreakdown
    };

    setResults(testResults);
    setIsComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isComplete && results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Test Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {results.score}/{results.totalProblems}
              </div>
              <div className="text-lg text-gray-600">
                {Math.round((results.score / results.totalProblems) * 100)}% Correct
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Time: {formatTime(results.timeSpent)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.topicBreakdown).map(([topic, stats]) => (
                <div key={topic} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-2">{topic}</div>
                  <div className="flex items-center justify-between">
                    <span>{stats.correct}/{stats.total}</span>
                    <Badge variant={stats.correct === stats.total ? "default" : "secondary"}>
                      {Math.round((stats.correct / stats.total) * 100)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={onBack} variant="outline">
                New Test
              </Button>
              <Button onClick={() => onComplete(results)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          ← Back
        </Button>
        <Badge variant="secondary">
          {type === 'full' ? 'Full Test' : 'Topic Drill'}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Problem {currentIndex + 1} of {problems.length}</CardTitle>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {currentProblem && (
            <>
              <MultipleChoiceQuestion
                question={currentProblem.question}
                options={currentProblem.options}
                selectedAnswer={currentAnswer}
                onAnswerSelect={setCurrentAnswer}
                topic={currentProblem.topic}
              />
              
              <div className="text-center">
                <Button 
                  onClick={handleNext}
                  disabled={!currentAnswer}
                  className="px-8"
                >
                  {currentIndex === problems.length - 1 ? 'Finish Test' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeTest;
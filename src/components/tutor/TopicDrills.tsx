import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import DrillQuestion from './DrillQuestion';
import { drillContent, DrillTopicKey, getRandomDrillQuestion } from './DrillContent';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { learningTracker, LearningTracker } from '@/services/learning-tracker';

interface TopicDrillsProps {
  topic: string;
  onComplete: () => void;
}

interface DrillResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

const TopicDrills: React.FC<TopicDrillsProps> = ({ topic, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);

  const totalQuestions = 5;

  // Start learning session when component mounts
  useEffect(() => {
    const startSession = async () => {
      if (topic && !sessionStarted) {
        try {
          const sessionData = {
            studentId: LearningTracker.getCurrentStudentId(),
            subject: 'math',
            topic: topic,
            sessionType: 'practice' as 'practice'
          };
          
          await learningTracker.startSession(sessionData);
          setSessionStarted(true);
          // Start timer for first question
          learningTracker.startProblemTimer();
          console.log(`Started drill session for topic: ${topic}`);
        } catch (error) {
          console.error('Failed to start drill session:', error);
        }
      }
    };

    loadNewQuestion();
    startSession();
  }, [topic, sessionStarted]);

  // Cleanup effect to handle unmounting
  useEffect(() => {
    return () => {
      // Abandon session on component unmount
      if (learningTracker.isSessionActive()) {
        learningTracker.abandonSession('TopicDrills component unmounted').catch(console.error);
      }
    };
  }, []);

  const loadNewQuestion = () => {
    const topicKey = topic as DrillTopicKey;
    const question = getRandomDrillQuestion(topicKey);
    
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer('');
      setShowFeedback(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const result: DrillResult = {
      question: currentQuestion.question,
      userAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };

    // Record problem attempt
    if (sessionStarted) {
      try {
        // Get time spent BEFORE starting next timer
        const timeSpent = learningTracker.getProblemTimeSpent();
        
        await learningTracker.recordProblemAttempt(
          LearningTracker.getCurrentStudentId(),
          'math',
          topic,
          {
            problemId: currentQuestion.id || `drill-${topic}-${questionIndex}`,
            difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.question),
            attempts: 1, // Drills allow one attempt per question
            hintsUsed: 0, // No hints in drills
            timeSpent,
            isCorrect,
            isCompleted: true,
            needsAIIntervention: false,
            skippedToFinalHint: false
          }
        );
      } catch (error) {
        console.error('Failed to record drill attempt:', error);
      }
    }

    setResults(prev => [...prev, result]);
    setShowFeedback(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = async () => {
    if (questionIndex + 1 >= totalQuestions) {
      setIsComplete(true);
      
      // End learning session when drill is complete
      if (sessionStarted) {
        try {
          await learningTracker.endSession({
            problemsAttempted: totalQuestions,
            problemsCompleted: totalQuestions,
            correctAnswers: score,
            hintsUsed: 0 // No hints in drills
          });
        } catch (error) {
          console.error('Failed to end drill session:', error);
        }
      }
    } else {
      setQuestionIndex(prev => prev + 1);
      learningTracker.startProblemTimer(); // Start timer for next question
      loadNewQuestion();
    }
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setResults([]);
    setScore(0);
    setIsComplete(false);
    loadNewQuestion();
  };

  const progress = ((questionIndex + (showFeedback ? 1 : 0)) / totalQuestions) * 100;
  const finalScore = Math.round((score / totalQuestions) * 100);

  if (isComplete) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <CardTitle className="text-2xl">Drill Complete!</CardTitle>
          <p className="text-gray-600">{topic} Practice Session</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {finalScore}%
            </div>
            <p className="text-gray-600">
              You got {score} out of {totalQuestions} questions correct
            </p>
          </div>

          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm font-medium">Question {index + 1}</span>
                </div>
                <Badge variant={result.isCorrect ? 'default' : 'destructive'}>
                  {result.isCorrect ? 'Correct' : 'Incorrect'}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onComplete} variant="outline" className="flex-1">
              Back to Topics
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading {topic} drill questions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{topic} Drills</CardTitle>
          <Badge variant="outline">
            Question {questionIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-6">
        <DrillQuestion
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          topic={topic}
          showFeedback={showFeedback}
          correctAnswer={currentQuestion.correctAnswer}
        />

        <div className="flex gap-3">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedAnswer}
              className="flex-1"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {questionIndex + 1 >= totalQuestions ? 'Finish Drill' : 'Next Question'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopicDrills;
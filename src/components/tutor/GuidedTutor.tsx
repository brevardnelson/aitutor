import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Lightbulb, CheckCircle, XCircle, AlertCircle, RefreshCw, Cpu, PenTool, Keyboard, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StepValidator, StepValidationResult } from '@/lib/stepValidator';
import { guidedTutorContent, TopicKey, getRandomQuestion } from './GuidedTutorContent';
import { aiService, type Subject, type TutoringRequest } from '@/lib/ai-service';
import { learningTracker, LearningTracker } from '@/services/learning-tracker';
import { useAppContext } from '@/contexts/AppContext';
import HandwritingCanvas from './HandwritingCanvas';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  validationResult?: StepValidationResult;
  aiModel?: string;
  aiProvider?: string;
}

interface GuidedTutorProps {
  topic: string;
  subject?: Subject;
  onComplete: () => void;
  onReset?: () => void;
}

const GuidedTutor: React.FC<GuidedTutorProps> = ({ topic, subject = 'math', onComplete, onReset }) => {
  const { currentChild } = useAppContext();
  
  const getInitialQuestion = () => {
    if (!topic) return guidedTutorContent['Fractions'].questions[0];
    
    const topicKey = topic as TopicKey;
    if (guidedTutorContent[topicKey]) {
      return getRandomQuestion(topicKey) || guidedTutorContent[topicKey].questions[0];
    }
    return guidedTutorContent['Fractions'].questions[0];
  };
  
  const [currentQuestion, setCurrentQuestion] = useState(() => getInitialQuestion());
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [useHandwriting, setUseHandwriting] = useState(false);
  const [recognisedText, setRecognisedText] = useState('');
  
  // Session-wide aggregate counters for proper endSession tracking
  const [problemsAttempted, setProblemsAttempted] = useState(0);
  const [problemsCompleted, setProblemsCompleted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  // Get model info for this subject
  const modelInfo = aiService.getModelInfo(subject);

  // Fetch curriculum context for this student's grade level and topic
  const [curriculumContext, setCurriculumContext] = React.useState<string>('');

  React.useEffect(() => {
    const fetchCurriculum = async () => {
      if (!currentChild || !topic) return;
      
      try {
        const response = await fetch(
          `/api/curriculum/${currentChild.gradeLevel}/${subject}?topic=${encodeURIComponent(topic)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.documents && data.documents.length > 0) {
            // Combine curriculum summaries into context
            const context = data.documents
              .map((doc: any) => {
                return `${doc.title}: ${doc.aiSummary || doc.extractedText?.substring(0, 500) || doc.description}`;
              })
              .join('\n\n');
            setCurriculumContext(context);
          }
        }
      } catch (error) {
        console.error('Failed to fetch curriculum:', error);
      }
    };
    
    fetchCurriculum();
  }, [currentChild, subject, topic]);

  // Generate AI response using the multi-modal service with grade-level context
  const generateAIResponse = async (userMessage: string, context?: string) => {
    const request: TutoringRequest = {
      subject,
      topic,
      userMessage,
      context,
      difficulty: 'intermediate',
      gradeLevel: currentChild?.gradeLevel,
      targetExam: currentChild?.targetExam,
      curriculumContext: curriculumContext || undefined
    };
    
    return await aiService.generateTutoringResponse(request);
  };

  // Start learning session (getNewQuestion will display the first problem)
  React.useEffect(() => {
    const startSession = async () => {
      if (topic && !sessionStarted && currentChild) {
        try {
          const sessionData = {
            studentId: currentChild.id,
            subject: subject,
            topic: topic,
            sessionType: 'practice' as 'practice'
          };
          
          await learningTracker.startSession(sessionData);
          setSessionStarted(true);
          learningTracker.startProblemTimer();
          console.log(`Started guided tutoring session for topic: ${topic}`);
        } catch (error) {
          console.error('Failed to start guided session:', error);
        }
      }
    };
    
    startSession();
  }, [topic, subject, sessionStarted, currentChild]);

  // Helper function to end session properly with aggregates
  const metricsRef = React.useRef({ problemsAttempted: 0, problemsCompleted: 0, correctAnswers: 0, totalHintsUsed: 0 });
  React.useEffect(() => {
    metricsRef.current = { problemsAttempted, problemsCompleted, correctAnswers, totalHintsUsed };
  }, [problemsAttempted, problemsCompleted, correctAnswers, totalHintsUsed]);

  const endSessionWithMetrics = async (reason: string = 'Session completed') => {
    if (!learningTracker.isSessionActive()) return;
    const m = metricsRef.current;
    try {
      await learningTracker.endSession({
        problemsAttempted: m.problemsAttempted,
        problemsCompleted: m.problemsCompleted,
        correctAnswers: m.correctAnswers,
        hintsUsed: m.totalHintsUsed
      });
    } catch (error) {
      console.error('Error ending GuidedTutor session:', error);
      try {
        await learningTracker.abandonSession(reason);
      } catch (abandonError) {
        console.error('Error abandoning session as fallback:', abandonError);
      }
    }
  };

  React.useEffect(() => {
    return () => {
      if (learningTracker.isSessionActive()) {
        endSessionWithMetrics('GuidedTutor component unmounted').catch(console.error);
      }
    };
  }, []);

  const getNewQuestion = async () => {
    if (!topic) return;
    
    const topicKey = topic as TopicKey;
    const newQuestion = guidedTutorContent[topicKey] 
      ? getRandomQuestion(topicKey) || guidedTutorContent[topicKey].questions[0]
      : guidedTutorContent['Fractions'].questions[0];
    
    setCurrentQuestion(newQuestion);
    setMessages([{
      id: '1',
      type: 'ai',
      content: `Let's work through this ${topic} problem: ${newQuestion.problem}\n\nWhat is the first step?`,
      timestamp: new Date()
    }]);
    setCurrentStep(0);
    setIsComplete(false);
    setUserInput('');
    setHintIndex(0);
    setIsValidating(false);
    setAttempts(0); // Reset attempts for new question
    setHintsUsed(0); // Reset hints for new question
    // Note: Don't reset aggregate counters - they track session-wide metrics
    
    // Fix #3: Ensure session continuity for new questions
    if (!learningTracker.isSessionActive() && currentChild) {
      try {
        const sessionData = {
          studentId: currentChild.id,
          subject: subject,
          topic: topic,
          sessionType: 'practice' as 'practice'
        };
        
        await learningTracker.startSession(sessionData);
        setSessionStarted(true);
        console.log(`Started new guided tutoring session for new question: ${topic}`);
      } catch (error) {
        console.error('Failed to start new session for new question:', error);
      }
    }
    
    // Restart timer for new problem
    learningTracker.startProblemTimer();
  };

  React.useEffect(() => {
    if (currentChild) {
      getNewQuestion().catch(console.error);
    }
  }, [topic, currentChild]);

  const checkAnswer = (userAnswer: string): boolean => {
    if (!userAnswer || !currentQuestion?.correctAnswer) return false;
    
    const normalize = (answer: string) => {
      return answer.toLowerCase().replace(/[^a-z0-9+\-*/=().\s]/g, '').replace(/\s+/g, '').trim();
    };
    
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(currentQuestion.correctAnswer);
    
    return normalizedUser === normalizedCorrect || normalizedUser.includes(normalizedCorrect);
  };

  const getNextHint = (): string => {
    if (!currentQuestion?.hints || currentQuestion.hints.length === 0) {
      return 'Think about the mathematical operation needed.';
    }
    
    const hints = currentQuestion.hints;
    const idx = Math.min(hintIndex, hints.length - 1);
    setHintIndex(prev => prev + 1);
    return hints[idx];
  };

  const handleSolve = async () => {
    const workings = currentQuestion.steps?.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'Work through each step carefully.';
    const solveMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `📖 Solution\n\n✅ Correct Answer: ${currentQuestion.correctAnswer}\n\nWorkings:\n${workings}\n\nStudy this carefully, then try a new question!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, solveMessage]);
    setIsComplete(true);

    if (sessionStarted) {
      try {
        await learningTracker.recordProblemAttempt(
          LearningTracker.getCurrentStudentId(),
          subject,
          topic,
          {
            problemId: `${topic}-solved-${Date.now()}`,
            difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.problem || ''),
            attempts: attempts,
            hintsUsed: hintsUsed,
            timeSpent: learningTracker.getProblemTimeSpent(),
            isCorrect: false,
            isCompleted: true,
            needsAIIntervention: true,
            skippedToFinalHint: true
          }
        );
      } catch (error) {
        console.error('Failed to record solved problem:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, textOverride?: string) => {
    e.preventDefault();
    const text = textOverride ?? userInput;
    if (!text?.trim() || isValidating || isGeneratingResponse) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setRecognisedText('');
    
    // Handle hint requests - don't count as problem attempts
    if (text.toLowerCase().trim() === 'hint') {
      setHintsUsed(prev => prev + 1);
      setTotalHintsUsed(prev => prev + 1);
      const hintMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Hint: ${getNextHint()}\n\nWhat's your next step?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, hintMessage]);
      return;
    }
    
    // Increment attempts on every submission
    setAttempts(prev => prev + 1);
    setProblemsAttempted(prev => prev + 1);
    
    // Check if this is the final correct answer
    if (checkAnswer(text)) {
      // Update aggregate counters
      setCorrectAnswers(prev => prev + 1);
      setProblemsCompleted(prev => prev + 1);
      
      // Log the successful final answer completion
      if (sessionStarted) {
        try {
          await learningTracker.recordProblemAttempt(
            LearningTracker.getCurrentStudentId(),
            subject,
            topic,
            {
              problemId: `${topic}-final-${Date.now()}`,
              difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.problem || ''),
              attempts: attempts + 1,
              hintsUsed: hintsUsed,
              timeSpent: learningTracker.getProblemTimeSpent(),
              isCorrect: true,
              isCompleted: true, // This is the final answer
              needsAIIntervention: hintsUsed > 0,
              skippedToFinalHint: hintsUsed > 2
            }
          );

          console.log(`Problem completed successfully. Attempts: ${attempts + 1}, Hints: ${hintsUsed}`);
        } catch (error) {
          console.error('Failed to record final answer completion:', error);
        }
      }

      const finalMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `🎉 Correct! Answer: ${currentQuestion.correctAnswer}\n\nSolution:\n${currentQuestion.steps?.map((step, i) => `${i + 1}. ${step}`).join('\n') || 'Well done!'}\n\nGreat work!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, finalMessage]);
      setIsComplete(true);
      setUserInput('');
      return;
    }
    
    // Log incorrect final answer attempts
    if (sessionStarted) {
      try {
        await learningTracker.recordProblemAttempt(
          LearningTracker.getCurrentStudentId(),
          subject,
          topic,
          {
            problemId: `${topic}-final-attempt-${Date.now()}`,
            difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.problem || ''),
            attempts: attempts,
            hintsUsed: hintsUsed,
            timeSpent: learningTracker.getProblemTimeSpent(),
            isCorrect: false,
            isCompleted: false, // Incorrect final answer attempt
            needsAIIntervention: true, // Incorrect answer needs intervention
            skippedToFinalHint: hintsUsed > 2
          }
        );
      } catch (error) {
        console.error('Failed to record incorrect final answer attempt:', error);
      }
    }
    
    setIsValidating(true);
    
    try {
      const validation = await StepValidator.validateStepWithAI(
        text, 
        currentQuestion.steps?.[currentStep] || 'Continue with the next step', 
        `Step ${currentStep + 1}`,
        topic || 'math'
      );
      
      // Record step-level attempts
      if (sessionStarted) {
        try {
          await learningTracker.recordProblemAttempt(
            LearningTracker.getCurrentStudentId(),
            subject,
            topic,
            {
              problemId: `${topic}-step-${currentStep + 1}-${Date.now()}`,
              difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.problem || ''),
              attempts: attempts,
              hintsUsed: hintsUsed,
              timeSpent: learningTracker.getProblemTimeSpent(),
              isCorrect: validation.isCorrect,
              isCompleted: false, // Step-level validation, not final completion
              needsAIIntervention: hintsUsed > 0 || !validation.isCorrect,
              skippedToFinalHint: hintsUsed > 2
            }
          );
          
          console.log(`Step ${currentStep + 1} validation: ${validation.isCorrect ? 'correct' : 'incorrect'}`);
        } catch (error) {
          console.error('Failed to record step-level attempt:', error);
        }
      }
      
      let response = validation.feedback || "Good thinking! Let's continue.";
      
      if (validation.isCorrect) {
        response += `\n\nStep ${currentStep + 1}: ${currentQuestion.steps?.[currentStep] || 'Good work!'}`;
        setCurrentStep(prev => prev + 1);
        
        if (currentStep + 1 >= (currentQuestion.steps?.length || 0)) {
          response += '\n\nNow provide your final answer.';
        } else {
          response += '\n\nWhat\'s the next step?';
        }
      } else {
        response += '\n\nTry again or type "hint" for help.';
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        validationResult: validation
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('StepValidator error:', error);
      
      // Log failed validation attempts
      if (sessionStarted) {
        try {
          await learningTracker.recordProblemAttempt(
            LearningTracker.getCurrentStudentId(),
            subject,
            topic,
            {
              problemId: `${topic}-validation-error-${Date.now()}`,
              difficulty: LearningTracker.determineDifficulty(topic, currentQuestion.problem || ''),
              attempts: attempts,
              hintsUsed: hintsUsed,
              timeSpent: learningTracker.getProblemTimeSpent(),
              isCorrect: false,
              isCompleted: false,
              needsAIIntervention: true, // Validation error requires intervention
              skippedToFinalHint: hintsUsed > 2
            }
          );
        } catch (recordError) {
          console.error('Failed to record validation error attempt:', recordError);
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Good try! Think about what operation is needed here.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsValidating(false);
    }
    
    setUserInput('');
  };

  const getValidationIcon = (result: StepValidationResult) => {
    if (result.isCorrect) return <CheckCircle className="h-3 w-3 text-green-600" />;
    if (result.confidence > 0.3) return <AlertCircle className="h-3 w-3 text-yellow-600" />;
    return <XCircle className="h-3 w-3 text-red-600" />;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{topic || 'Math'} Practice</h3>
          <Button onClick={() => getNewQuestion().catch(console.error)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />New Question
          </Button>
        </div>
        
        <div className="h-80 overflow-y-auto mb-4 space-y-3 p-3 bg-gray-50 rounded-lg">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-2 rounded-full ${message.type === 'ai' ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {message.type === 'ai' ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4 text-white" />}
                </div>
                <div className={`p-3 rounded-lg ${message.type === 'ai' ? 'bg-white border' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'}`}>
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  {message.validationResult && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {getValidationIcon(message.validationResult)}
                      <span>Confidence: {Math.round(message.validationResult.confidence * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isValidating && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="p-2 rounded-full bg-blue-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="p-3 rounded-lg bg-white border">
                  <p className="text-sm text-gray-600">Analyzing...</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setHintsUsed(prev => prev + 1);
                setTotalHintsUsed(prev => prev + 1);
                const hint: Message = {
                  id: Date.now().toString(),
                  type: 'ai',
                  content: `Hint ${hintsUsed + 1}: ${getNextHint()}`,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, hint]);
              }}
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={isComplete || isValidating || hintsUsed >= 3}
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {hintsUsed >= 3 ? 'No more hints' : `Get Hint (${hintsUsed}/3)`}
            </Button>
            {hintsUsed >= 3 && !isComplete && (
              <Button
                onClick={handleSolve}
                variant="destructive"
                size="sm"
                className="flex-1"
                disabled={isValidating}
              >
                <BookOpen className="h-4 w-4 mr-2" />Show Solution
              </Button>
            )}
          </div>
          
          {useHandwriting ? (
            <div className="space-y-2">
              <HandwritingCanvas
                onRecognised={(text) => {
                  setRecognisedText(text);
                }}
                disabled={isComplete || isValidating}
              />
              {recognisedText && (
                <form onSubmit={(e) => {
                  handleSubmit(e, recognisedText);
                }} className="flex gap-2">
                  <Input
                    value={recognisedText}
                    onChange={(e) => setRecognisedText(e.target.value)}
                    placeholder="Recognised text — edit if needed"
                    disabled={isComplete || isValidating}
                  />
                  <Button type="submit" disabled={isComplete || isValidating || !recognisedText.trim()}>
                    {isValidating ? 'Checking...' : 'Submit'}
                  </Button>
                </form>
              )}
              <button
                type="button"
                onClick={() => { setUseHandwriting(false); setRecognisedText(''); }}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Keyboard className="h-3 w-3" />
                Switch to keyboard
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isComplete ? "Completed! Try new question" : "Your answer..."}
                  disabled={isComplete || isValidating}
                />
                <Button type="submit" disabled={isComplete || isValidating || !userInput?.trim()}>
                  {isValidating ? 'Checking...' : 'Send'}
                </Button>
              </form>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setUseHandwriting(true)}
                disabled={isComplete || isValidating}
                title="Switch to handwriting input"
                className="shrink-0"
              >
                <PenTool className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidedTutor;
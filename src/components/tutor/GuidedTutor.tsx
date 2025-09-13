import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Lightbulb, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { StepValidator, StepValidationResult } from '@/lib/stepValidator';
import { guidedTutorContent, TopicKey, getRandomQuestion } from './GuidedTutorContent';

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  validationResult?: StepValidationResult;
}

interface GuidedTutorProps {
  topic: string;
  onComplete: () => void;
  onReset?: () => void;
}

const GuidedTutor: React.FC<GuidedTutorProps> = ({ topic, onComplete, onReset }) => {
  const getInitialQuestion = () => {
    if (!topic) return guidedTutorContent['Fractions'].questions[0];
    
    const topicKey = topic as TopicKey;
    if (guidedTutorContent[topicKey]) {
      return getRandomQuestion(topicKey) || guidedTutorContent[topicKey].questions[0];
    }
    return guidedTutorContent['Fractions'].questions[0];
  };
  
  const [currentQuestion, setCurrentQuestion] = useState(() => getInitialQuestion());
  
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'ai',
    content: `Let's work through this ${topic || 'math'} problem: ${currentQuestion.problem}\n\nWhat is the first step?`,
    timestamp: new Date()
  }]);
  const [userInput, setUserInput] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsShown, setHintsShown] = useState<number[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const getNewQuestion = () => {
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
    setHintsShown([]);
    setIsValidating(false);
  };

  React.useEffect(() => {
    getNewQuestion();
  }, [topic]);

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
    if (!currentQuestion?.hints || !currentQuestion.hints[currentStep]) {
      return 'Think about the mathematical operation needed.';
    }
    
    const hints = currentQuestion.hints[currentStep].split('|') || ['Think about the mathematical operation needed.'];
    const hintIndex = hintsShown.filter(h => Math.floor(h / 10) === currentStep).length;
    
    if (hintIndex < hints.length) {
      setHintsShown(prev => [...prev, currentStep * 10 + hintIndex]);
      return hints[hintIndex];
    }
    
    return hints[hints.length - 1] || 'Think about the mathematical operation needed.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput?.trim() || isValidating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    if (userInput.toLowerCase().trim() === 'hint') {
      const hintMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Hint: ${getNextHint()}\n\nWhat's your next step?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, hintMessage]);
      setUserInput('');
      return;
    }
    
    if (checkAnswer(userInput)) {
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
    
    setIsValidating(true);
    
    try {
      const validation = await StepValidator.validateStepWithAI(
        userInput, 
        currentQuestion.steps?.[currentStep] || 'Continue with the next step', 
        `Step ${currentStep + 1}`,
        topic || 'math'
      );
      
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
          <Button onClick={getNewQuestion} variant="outline" size="sm">
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
          <Button 
            onClick={() => {
              const hint: Message = {
                id: Date.now().toString(),
                type: 'ai',
                content: `Hint: ${getNextHint()}`,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, hint]);
            }}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isComplete || isValidating}
          >
            <Lightbulb className="h-4 w-4 mr-2" />Get Hint
          </Button>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidedTutor;
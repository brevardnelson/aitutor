import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Brain, Target, ClipboardList, Settings, Cpu, MessageCircle } from 'lucide-react';
import TopicSelector from './TopicSelector';
import ProblemSolver from './ProblemSolver';
import PracticeTestSelector from '../practice/PracticeTestSelector';
import PracticeTest from '../practice/PracticeTest';
import CurriculumUpload from '../admin/CurriculumUpload';
import VoiceChat from './VoiceChat';
import { aiService, type Subject } from '@/lib/ai-service';

type ViewMode = 'topics' | 'problem' | 'practice-selector' | 'practice-test' | 'admin';

interface TestConfig {
  type: 'full' | 'drill';
  topics: string[];
  problemCount: number;
}

interface TutorInterfaceProps {
  subject?: Subject;
}

const TutorInterface: React.FC<TutorInterfaceProps> = ({ subject = 'math' }) => {
  const { currentChild } = useAppContext();
  const [viewMode, setViewMode] = useState<ViewMode>('topics');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);

  // Get AI model info for this subject
  const modelInfo = aiService.getModelInfo(subject);

  if (!currentChild) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Child Selected</h1>
          <p className="text-gray-600">Please select a child from the dashboard to start learning.</p>
        </div>
      </div>
    );
  }

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setViewMode('problem');
    setCurrentQuestion(null);
  };

  const handleStartTest = (type: 'full' | 'drill', topics: string[], problemCount: number) => {
    setTestConfig({ type, topics, problemCount });
    setViewMode('practice-test');
  };

  const handleTestComplete = (results: any) => {
    setViewMode('topics');
    setTestConfig(null);
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'topics':
        return (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Choose a {subject.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Topic
                  </h2>
                  <p className="text-gray-600">Select a topic to start your personalized learning session</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="flex items-center gap-2 text-xs">
                    <Cpu className="h-3 w-3" />
                    AI: {modelInfo.primaryProvider.charAt(0).toUpperCase() + modelInfo.primaryProvider.slice(1)}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Optimized for {subject}</p>
                </div>
              </div>
            </div>
            <TopicSelector onTopicSelect={handleTopicSelect} subject={subject} />
          </div>
        );
      
      case 'problem':
        return (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{selectedTopic}</h2>
              </div>
            </div>
            <ProblemSolver topic={selectedTopic!} subject={subject} onQuestionChange={setCurrentQuestion} />
          </div>
        );
      
      case 'practice-selector':
        return (
          <div>
            <PracticeTestSelector onStartTest={handleStartTest} />
          </div>
        );
      
      case 'practice-test':
        return testConfig ? (
          <PracticeTest
            type={testConfig.type}
            topics={testConfig.topics}
            problemCount={testConfig.problemCount}
            onComplete={handleTestComplete}
            onBack={() => setViewMode('practice-selector')}
          />
        ) : null;
      
      case 'admin':
        return (
          <div>
            <CurriculumUpload />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {viewMode !== 'topics' && (
              <Button 
                variant="outline" 
                onClick={() => setViewMode('topics')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Topics
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentChild.name}'s Learning Session
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{currentChild.gradeLevel.replace('-', ' ').toUpperCase()}</Badge>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {currentChild.targetExam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={viewMode === 'practice-selector' ? 'default' : 'outline'}
              onClick={() => setViewMode('practice-selector')}
              className="flex items-center gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Practice Tests
            </Button>
            <Button
              variant={viewMode === 'admin' ? 'default' : 'outline'}
              onClick={() => setViewMode('admin')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin
            </Button>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">AI Tutor Active</span>
            </div>
          </div>
        </div>

        {/* Learning Interface */}
        {renderContent()}

        {/* Learning Tips */}
        {viewMode === 'topics' && (
          <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Learning Tips</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Take your time to think through each step</li>
                    <li>• Ask questions when you're unsure</li>
                    <li>• The AI tutor will guide you, not give direct answers</li>
                    <li>• Practice makes perfect - don't worry about mistakes!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Talk to Tutor button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 overflow-visible max-h-screen">
        {voiceChatOpen && (
          <VoiceChat
            topic={selectedTopic ?? undefined}
            subject={subject}
            gradeLevel={currentChild.gradeLevel}
            targetExam={currentChild.targetExam}
            currentQuestion={currentQuestion ?? undefined}
            onClose={() => setVoiceChatOpen(false)}
          />
        )}
        <button
          onClick={() => setVoiceChatOpen(prev => !prev)}
          title={voiceChatOpen ? 'Close voice chat' : 'Talk to your AI Tutor'}
          className={`flex items-center gap-2 px-4 py-3 rounded-full shadow-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
            voiceChatOpen
              ? 'bg-gray-700 hover:bg-gray-800 text-white'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:scale-105 shadow-blue-200'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {voiceChatOpen ? 'Close Chat' : 'Talk to Tutor'}
        </button>
      </div>
    </div>
  );
};

export default TutorInterface;
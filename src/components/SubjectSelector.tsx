import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calculator, Globe, TestTube, FileText, Brain, Lock, Cpu } from 'lucide-react';
import { User } from '@/lib/auth';
import { aiService, type Subject } from '@/lib/ai-service';

interface SubjectInfo {
  id: Subject;
  name: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  comingSoon?: boolean;
}

interface SubjectSelectorProps {
  user: User;
  onSubjectSelect: (subjectId: string) => void;
}

const SubjectSelector: React.FC<SubjectSelectorProps> = ({ user, onSubjectSelect }) => {
  const subjects: SubjectInfo[] = [
    {
      id: 'math',
      name: 'Mathematics',
      description: 'Arithmetic, Algebra, Geometry, and Word Problems',
      icon: <Calculator className="h-8 w-8" />,
      isActive: true
    },
    {
      id: 'english',
      name: 'English Language',
      description: 'Reading Comprehension, Grammar, and Writing',
      icon: <FileText className="h-8 w-8" />,
      isActive: false,
      comingSoon: true
    },
    {
      id: 'science',
      name: 'General Science',
      description: 'Biology, Chemistry, Physics, and Environmental Science',
      icon: <TestTube className="h-8 w-8" />,
      isActive: false,
      comingSoon: true
    },
    {
      id: 'social-studies',
      name: 'Social Studies',
      description: 'Caribbean History, Geography, and Civics',
      icon: <Globe className="h-8 w-8" />,
      isActive: false,
      comingSoon: true
    },
    {
      id: 'reasoning',
      name: 'Verbal Reasoning',
      description: 'Critical Thinking and Problem Solving',
      icon: <Brain className="h-8 w-8" />,
      isActive: false,
      comingSoon: true
    }
  ];

  const handleSubjectClick = (subject: SubjectInfo) => {
    if (subject.isActive) {
      onSubjectSelect(subject.id);
    }
  };

  const getModelInfo = (subjectId: Subject) => {
    const modelInfo = aiService.getModelInfo(subjectId);
    return {
      provider: modelInfo.primaryProvider,
      model: modelInfo.primaryModel.replace(/^(claude-|gpt-)/, '')
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome, {user.full_name}!
          </h1>
          <p className="text-gray-600 text-lg">Choose a subject to begin your learning journey</p>
          <div className="mt-4">
            <Badge variant="outline" className="text-sm">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
            </Badge>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card 
              key={subject.id}
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                subject.isActive 
                  ? 'cursor-pointer hover:scale-105 bg-white/80 backdrop-blur-sm' 
                  : 'opacity-60 bg-white/60'
              }`}
              onClick={() => handleSubjectClick(subject)}
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-full mb-4 ${
                  subject.isActive 
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {subject.isActive ? subject.icon : <Lock className="h-8 w-8" />}
                </div>
                <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {subject.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {subject.isActive ? (
                  <>
                    <div className="mb-3">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1 w-fit">
                        <Cpu className="h-3 w-3" />
                        AI: {getModelInfo(subject.id).provider.charAt(0).toUpperCase() + getModelInfo(subject.id).provider.slice(1)}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        Optimized {getModelInfo(subject.id).model} model for {subject.name.toLowerCase()}
                      </p>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => handleSubjectClick(subject)}
                    >
                      Start Learning
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <Badge variant="secondary" className="mb-2">
                      {subject.comingSoon ? 'Coming Soon' : 'Locked'}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      This subject will be available soon
                    </p>
                  </div>
                )}
              </CardContent>
              
              {/* Active indicator */}
              {subject.isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Role-specific information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {user.role === 'student' ? 'Your Learning' : 'Progress Tracking'}
              </div>
              <p className="text-sm text-gray-600">
                {user.role === 'student' 
                  ? 'Personalized curriculum based on your level'
                  : 'Monitor learning progress and achievements'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {user.role === 'teacher' ? 'Class Insights' : 'AI Tutoring'}
              </div>
              <p className="text-sm text-gray-600">
                {user.role === 'teacher' 
                  ? 'Detailed analytics and learning paths for students'
                  : 'Interactive AI-powered learning assistance'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {user.role === 'parent' ? 'Family Hub' : 'Practice Tests'}
              </div>
              <p className="text-sm text-gray-600">
                {user.role === 'parent' 
                  ? 'Manage multiple children and track their progress'
                  : 'Comprehensive exam preparation and assessments'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                Exam Prep
              </div>
              <p className="text-sm text-gray-600">
                Targeted preparation for Caribbean entrance exams
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelector;
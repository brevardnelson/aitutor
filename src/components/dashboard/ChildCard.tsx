import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/contexts/AppContext';
import { User, Play, BarChart3, Trophy, Star, Flame } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  targetExam?: string;
  subjects: string[];
}

interface ChildCardProps {
  child: Child;
  onStartLearning?: () => void;
  onViewAnalytics?: (childId: number, childName: string) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, onStartLearning, onViewAnalytics }) => {
  const { selectChild, selectedSubject, getChildProgress } = useAppContext();
  const [gamification, setGamification] = useState<{ totalXP: number; badgeCount: number; streak: number }>({ totalXP: 0, badgeCount: 0, streak: 0 });
  
  useEffect(() => {
    const token = localStorage.getItem('caribbeanAI_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    Promise.all([
      fetch(`/api/gamification/xp/${child.id}`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`/api/gamification/badges/student/${child.id}`, { headers }).then(r => r.ok ? r.json() : null),
    ]).then(([xpData, badgesData]) => {
      setGamification({
        totalXP: xpData?.totalXP || xpData?.total_xp || 0,
        badgeCount: Array.isArray(badgesData) ? badgesData.filter((b: any) => b.earnedAt || b.earned_at).length : 0,
        streak: xpData?.currentStreak || xpData?.current_streak || 0,
      });
    }).catch(e => console.error('Failed to load child gamification:', e));
  }, [child.id]);

  // Get progress for current subject only
  const currentSubject = selectedSubject || 'math';
  const childProgress = getChildProgress(child.id).filter(p => p.subject === currentSubject);
  const avgProgress = childProgress.length > 0 
    ? Math.round(childProgress.reduce((acc, p) => acc + (p.completed / p.total * 100), 0) / childProgress.length)
    : 0;

  const handleStartLearning = () => {
    console.log('Starting learning for child:', child.name);
    selectChild(child);
    console.log('Starting learning session');
    if (onStartLearning) {
      onStartLearning();
    }
  };

  const handleViewAnalytics = () => {
    if (onViewAnalytics) {
      onViewAnalytics(child.id, child.name);
    }
  };

  const getExamBadgeColor = (exam: string) => {
    switch (exam) {
      case 'common-entrance': return 'bg-blue-100 text-blue-800';
      case 'sea': return 'bg-green-100 text-green-800';
      case 'high-school-entrance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExamName = (exam: string) => {
    return exam.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{child.name}</CardTitle>
              <CardDescription>Age {child.age} • {child.gradeLevel.replace('-', ' ').toUpperCase()}</CardDescription>
            </div>
          </div>
        </div>
        {child.targetExam && (
          <Badge className={`w-fit ${getExamBadgeColor(child.targetExam)}`}>
            {formatExamName(child.targetExam)}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">{avgProgress}%</span>
          </div>
          <Progress value={avgProgress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="font-semibold text-blue-700">{childProgress.length}</div>
            <div className="text-blue-600">Topics Started</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="font-semibold text-green-700">
              {childProgress.filter(p => p.completed === p.total).length}
            </div>
            <div className="text-green-600">Completed</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-yellow-700">{gamification.totalXP} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-purple-700">{gamification.badgeCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-orange-700">{gamification.streak}d</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleStartLearning}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Learning
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            onClick={handleViewAnalytics}
            title="View Analytics"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
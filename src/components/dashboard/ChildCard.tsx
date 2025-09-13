import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/contexts/AppContext';
import { User, Play, BarChart3 } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  age: number;
  grade: string;
  exam: string;
}

interface ChildCardProps {
  child: Child;
}

const ChildCard: React.FC<ChildCardProps> = ({ child }) => {
  const { selectChild, setView, progress } = useAppContext();
  
  const childProgress = progress.filter(p => p.childId === child.id);
  const avgProgress = childProgress.length > 0 
    ? Math.round(childProgress.reduce((acc, p) => acc + (p.completed / p.total * 100), 0) / childProgress.length)
    : 0;

  const handleStartLearning = () => {
    selectChild(child);
    setView('tutor');
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
              <CardDescription>Age {child.age} • {child.grade.replace('-', ' ').toUpperCase()}</CardDescription>
            </div>
          </div>
        </div>
        <Badge className={`w-fit ${getExamBadgeColor(child.exam)}`}>
          {formatExamName(child.exam)}
        </Badge>
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
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleStartLearning}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Learning
          </Button>
          <Button variant="outline" size="sm" className="px-3">
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChildCard;
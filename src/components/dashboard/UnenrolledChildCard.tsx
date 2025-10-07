import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/contexts/AppContext';
import { User, Plus } from 'lucide-react';

interface Child {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  targetExam?: string;
  subjects: string[];
}

interface UnenrolledChildCardProps {
  child: Child;
  subject: string;
}

const UnenrolledChildCard: React.FC<UnenrolledChildCardProps> = ({ child, subject }) => {
  const { refreshChildren } = useAppContext();
  
  const handleAddToSubject = async () => {
    // Update child to include this subject
    try {
      const response = await fetch(`/api/parent/children/${child.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('caribbeanAI_token')}`
        },
        body: JSON.stringify({
          subjects: [...child.subjects, subject]
        })
      });
      
      if (response.ok) {
        await refreshChildren();
      }
    } catch (error) {
      console.error('Error adding subject:', error);
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

  const formatSubjectName = (subjectName: string) => {
    return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
  };

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-dashed border-2 border-gray-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-2 rounded-full">
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
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-orange-700 text-sm font-medium mb-2">
            Not enrolled in {formatSubjectName(subject)} yet
          </div>
          <div className="text-orange-600 text-xs">
            Add this child to start their {formatSubjectName(subject)} journey
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={handleAddToSubject}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to {formatSubjectName(subject)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnenrolledChildCard;
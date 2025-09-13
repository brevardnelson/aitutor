import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Target, RotateCcw } from 'lucide-react';
import GuidedTutor from './GuidedTutor';
import TopicDrills from './TopicDrills';

interface ProblemSolverProps {
  topic: string;
}

const ProblemSolver: React.FC<ProblemSolverProps> = ({ topic }) => {
  const [activeTab, setActiveTab] = useState('guided');
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setKey(prev => prev + 1);
  };

  const handleComplete = () => {
    // Could add completion tracking here
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            {topic} Practice
          </CardTitle>
          <p className="text-gray-600">
            Choose between guided practice with step-by-step help or quick drills to test your skills.
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guided" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Guided Practice
          </TabsTrigger>
          <TabsTrigger value="drills" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Drills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guided" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Guided {topic} Practice</h3>
                <p className="text-sm text-gray-600">
                  Work through problems step-by-step with AI guidance
                </p>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            <GuidedTutor 
              key={`guided-${key}`}
              topic={topic} 
              onComplete={handleComplete}
              onReset={handleReset}
            />
          </div>
        </TabsContent>

        <TabsContent value="drills" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{topic} Quick Drills</h3>
                <p className="text-sm text-gray-600">
                  Test your knowledge with multiple choice questions
                </p>
              </div>
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                New Set
              </Button>
            </div>
            <TopicDrills 
              key={`drills-${key}`}
              topic={topic} 
              onComplete={handleComplete}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProblemSolver;
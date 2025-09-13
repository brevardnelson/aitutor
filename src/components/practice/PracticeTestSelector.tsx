import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Target, BookOpen } from 'lucide-react';

interface PracticeTestSelectorProps {
  onStartTest: (type: 'full' | 'drill', topics: string[], problemCount: number) => void;
}

const topics = [
  'Fractions', 'Decimals', 'Percentages', 'Basic Algebra', 'Word Problems', 'Geometry Basics'
];

const PracticeTestSelector: React.FC<PracticeTestSelectorProps> = ({ onStartTest }) => {
  const [testType, setTestType] = useState<'full' | 'drill'>('full');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [drillCount, setDrillCount] = useState('10');

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleStart = () => {
    if (testType === 'full') {
      onStartTest('full', topics, 40);
    } else {
      if (selectedTopics.length > 0) {
        onStartTest('drill', selectedTopics, parseInt(drillCount));
      }
    }
  };

  const canStart = testType === 'full' || (testType === 'drill' && selectedTopics.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Practice Tests
        </h2>
        <p className="text-gray-600">Choose between a full test or focused drills</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          className={`cursor-pointer transition-all ${testType === 'full' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}
          onClick={() => setTestType('full')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Full Practice Test</CardTitle>
                <CardDescription>Complete assessment with all topics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">40 problems</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-sm">All topics included</span>
              </div>
              <Badge variant="secondary">Recommended for assessment</Badge>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${testType === 'drill' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:shadow-lg'}`}
          onClick={() => setTestType('drill')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Topic Drill</CardTitle>
                <CardDescription>Focus on specific topics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Customizable length</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Choose your topics</span>
              </div>
              <Badge variant="secondary">Great for practice</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {testType === 'drill' && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Your Drill</CardTitle>
            <CardDescription>Select topics and number of problems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium mb-3 block">Select Topics</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {topics.map(topic => (
                  <Button
                    key={topic}
                    variant={selectedTopics.includes(topic) ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="problemCount" className="text-base font-medium">Number of Problems</Label>
              <Select value={drillCount} onValueChange={setDrillCount}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 problems</SelectItem>
                  <SelectItem value="10">10 problems</SelectItem>
                  <SelectItem value="15">15 problems</SelectItem>
                  <SelectItem value="20">20 problems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button 
          onClick={handleStart}
          disabled={!canStart}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
        >
          {testType === 'full' ? 'Start Full Test' : 'Start Drill'}
        </Button>
      </div>
    </div>
  );
};

export default PracticeTestSelector;
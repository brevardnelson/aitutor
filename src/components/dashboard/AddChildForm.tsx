import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '@/contexts/AppContext';
import { X, Calculator, BookOpen, Beaker } from 'lucide-react';

interface AddChildFormProps {
  onClose: () => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onClose }) => {
  const { addChild, selectedSubject } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    exam: '',
    subjects: [selectedSubject || 'math'] // Start with current subject selected
  });
  
  const availableSubjects = [
    { id: 'math', name: 'Math', icon: Calculator, description: 'Numbers, algebra, geometry' },
    { id: 'english', name: 'English', icon: BookOpen, description: 'Reading, writing, grammar' },
    { id: 'science', name: 'Science', icon: Beaker, description: 'Biology, chemistry, physics' }
  ];

  const handleSubjectToggle = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.grade && formData.exam && formData.subjects.length > 0) {
      addChild({
        name: formData.name,
        age: parseInt(formData.age),
        grade: formData.grade,
        exam: formData.exam
      }, formData.subjects); // Pass subjects to addChild
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Add Child</CardTitle>
            <CardDescription>Add a new child to start their learning journey</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter child's name"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="6"
                max="18"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="grade">Current Grade</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grade-1">Grade 1</SelectItem>
                  <SelectItem value="grade-2">Grade 2</SelectItem>
                  <SelectItem value="grade-3">Grade 3</SelectItem>
                  <SelectItem value="grade-4">Grade 4</SelectItem>
                  <SelectItem value="grade-5">Grade 5</SelectItem>
                  <SelectItem value="grade-6">Grade 6</SelectItem>
                  <SelectItem value="grade-7">Grade 7</SelectItem>
                  <SelectItem value="grade-8">Grade 8</SelectItem>
                  <SelectItem value="grade-9">Grade 9</SelectItem>
                  <SelectItem value="grade-10">Grade 10</SelectItem>
                  <SelectItem value="grade-11">Grade 11</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="exam">Target Exam</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, exam: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common-entrance">Common Entrance</SelectItem>
                  <SelectItem value="sea">SEA (Secondary Entrance Assessment)</SelectItem>
                  <SelectItem value="high-school-entrance">High School Entrance</SelectItem>
                  <SelectItem value="placement-test">Placement Test</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Subjects to Enroll</Label>
              <p className="text-sm text-gray-600 mb-3">Select which subjects this child will study</p>
              <div className="grid grid-cols-1 gap-3">
                {availableSubjects.map((subject) => {
                  const IconComponent = subject.icon;
                  return (
                    <div key={subject.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <Checkbox
                        id={subject.id}
                        checked={formData.subjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <IconComponent className="h-4 w-4 text-gray-600" />
                        <div className="flex-1">
                          <label htmlFor={subject.id} className="text-sm font-medium cursor-pointer">
                            {subject.name}
                          </label>
                          <p className="text-xs text-gray-500">{subject.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.subjects.length === 0 && (
                <p className="text-sm text-red-600 mt-2">Please select at least one subject</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Add Child
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddChildForm;
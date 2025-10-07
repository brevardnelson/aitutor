import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppContext } from '@/contexts/AppContext';
import { X, Calculator, BookOpen, Beaker } from 'lucide-react';
import { GRADE_LEVELS } from '../../../shared/schema';

interface AddChildFormProps {
  onClose: () => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onClose }) => {
  const { addChild, selectedSubject } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gradeLevel: '',
    targetExam: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.age && formData.gradeLevel && formData.targetExam && formData.subjects.length > 0) {
      setIsSubmitting(true);
      try {
        await addChild({
          name: formData.name,
          age: parseInt(formData.age),
          gradeLevel: formData.gradeLevel,
          targetExam: formData.targetExam,
          subjects: formData.subjects
        });
        onClose();
      } catch (error) {
        console.error('Error adding child:', error);
        alert('Failed to add child. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-4">
        <Card className="w-full max-w-lg bg-white shadow-2xl my-4">
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
                min="5"
                max="19"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="grade">Current Grade</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectGroup>
                    <SelectLabel>US Grade Levels</SelectLabel>
                    <SelectItem value={GRADE_LEVELS.US_KINDERGARTEN}>Kindergarten (K)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_1}>Grade 1</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_2}>Grade 2</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_3}>Grade 3</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_4}>Grade 4</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_5}>Grade 5</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_6}>Grade 6</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_7}>Grade 7</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_8}>Grade 8</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_9}>Grade 9</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_10}>Grade 10</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_11}>Grade 11</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_12}>Grade 12</SelectItem>
                    <SelectItem value={GRADE_LEVELS.US_GRADE_13}>Grade 13</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Caribbean Primary School</SelectLabel>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_INFANT_1}>Infant 1 (Age 5-6)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_INFANT_2}>Infant 2 (Age 6-7)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_1}>Standard 1 (Age 7-8)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_2}>Standard 2 (Age 8-9)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_3}>Standard 3 (Age 9-10)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_4}>Standard 4 (Age 10-11)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_5}>Standard 5 - SEA/11+/PEP Year (Age 11-12)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Caribbean Secondary School</SelectLabel>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_1}>Form 1 (Age 12-13)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_2}>Form 2 (Age 13-14)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_3}>Form 3 (Age 14-15)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_4}>Form 4 - CSEC Prep (Age 15-16)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_5}>Form 5 - CSEC Exams (Age 16-17)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_LOWER_6TH}>Lower 6th Form - CAPE/A-Levels (Age 17-18)</SelectItem>
                    <SelectItem value={GRADE_LEVELS.CARIBBEAN_UPPER_6TH}>Upper 6th Form - Final Year (Age 18-19)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="exam">Target Exam</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, targetExam: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target exam" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectGroup>
                    <SelectLabel>Primary to Secondary Transition</SelectLabel>
                    <SelectItem value="sea">SEA - Secondary Entrance Assessment (T&T)</SelectItem>
                    <SelectItem value="11-plus">11+ Exam (Barbados)</SelectItem>
                    <SelectItem value="pep">PEP - Primary Exit Profile (Jamaica)</SelectItem>
                    <SelectItem value="common-entrance">Common Entrance</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Secondary School Completion</SelectLabel>
                    <SelectItem value="csec">CSEC - Caribbean Secondary Education Certificate</SelectItem>
                    <SelectItem value="cxc">CXC Exams</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Advanced Level</SelectLabel>
                    <SelectItem value="cape">CAPE - Caribbean Advanced Proficiency Exam</SelectItem>
                    <SelectItem value="a-levels">A-Levels</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value="high-school-entrance">High School Entrance</SelectItem>
                    <SelectItem value="placement-test">Placement Test</SelectItem>
                    <SelectItem value="sat">SAT (US College Entrance)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
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
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Child'}
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddChildForm;
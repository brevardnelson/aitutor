import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PDFUpload from './PDFUpload';

interface CurriculumItem {
  id: string;
  topic: string;
  grade: string;
  content: string;
  type: 'concept' | 'example' | 'strategy';
  uploadDate: string;
}

const CurriculumUpload: React.FC = () => {
  const { toast } = useToast();
  const [uploadForm, setUploadForm] = useState({
    topic: '',
    grade: '',
    content: '',
    type: 'concept' as 'concept' | 'example' | 'strategy'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);

  const topics = [
    'Fractions', 'Decimals', 'Percentages', 'Basic Algebra', 'Word Problems', 'Geometry Basics'
  ];

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.topic || !uploadForm.grade || !uploadForm.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newItem: CurriculumItem = {
        id: Date.now().toString(),
        topic: uploadForm.topic,
        grade: uploadForm.grade,
        content: uploadForm.content,
        type: uploadForm.type,
        uploadDate: new Date().toLocaleDateString()
      };
      
      setCurriculumItems(prev => [newItem, ...prev]);
      
      setUploadForm({
        topic: '',
        grade: '',
        content: '',
        type: 'concept'
      });
      
      toast({
        title: "Upload Successful",
        description: "Curriculum content has been added to the knowledge base."
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'concept': return 'bg-blue-100 text-blue-800';
      case 'example': return 'bg-green-100 text-green-800';
      case 'strategy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Curriculum Management
        </h2>
        <p className="text-gray-600">Upload and manage curriculum content for the AI tutor</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Upload</TabsTrigger>
          <TabsTrigger value="pdf">PDF Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Content
                </CardTitle>
                <CardDescription>
                  Add new curriculum content to train and refine the tutor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="topic">Topic</Label>
                      <Select 
                        value={uploadForm.topic} 
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, topic: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select topic" />
                        </SelectTrigger>
                        <SelectContent>
                          {topics.map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="grade">Grade Level</Label>
                      <Select 
                        value={uploadForm.grade} 
                        onValueChange={(value) => setUploadForm(prev => ({ ...prev, grade: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type">Content Type</Label>
                    <Select 
                      value={uploadForm.type} 
                      onValueChange={(value: 'concept' | 'example' | 'strategy') => 
                        setUploadForm(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="concept">Concept Explanation</SelectItem>
                        <SelectItem value="example">Worked Example</SelectItem>
                        <SelectItem value="strategy">Teaching Strategy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={uploadForm.content}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter curriculum content, teaching strategies, examples, or explanations..."
                      className="mt-1 min-h-32"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Content
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Uploads
                </CardTitle>
                <CardDescription>
                  {curriculumItems.length} items in knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {curriculumItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No curriculum content uploaded yet</p>
                      <p className="text-sm">Start by uploading your first content item</p>
                    </div>
                  ) : (
                    curriculumItems.map(item => (
                      <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{item.topic}</Badge>
                            <Badge variant="outline">{item.grade}</Badge>
                            <Badge className={getTypeColor(item.type)}>
                              {item.type}
                            </Badge>
                          </div>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Uploaded: {item.uploadDate}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pdf" className="space-y-6">
          <PDFUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CurriculumUpload;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Bot,
  BarChart3,
  BookOpen,
  Settings,
  Plus
} from 'lucide-react';
import { ObjectUploader } from './ObjectUploader';
import { GRADE_LEVELS } from '../../../shared/schema';

interface Document {
  id: number;
  title: string;
  description?: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  gradeLevel: string;
  subject: string;
  topic?: string;
  difficulty: string;
  contentType: string;
  tags: string[];
  isProcessed: boolean;
  processingStatus: string;
  isValidated: boolean;
  contentQualityScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
}

interface AITrainingSession {
  id: number;
  sessionName: string;
  description?: string;
  gradeLevel?: string;
  subject?: string;
  modelProvider: string;
  modelType: string;
  trainingObjective: string;
  totalDocuments: number;
  status: string;
  progressPercent: string;
  trainingAccuracy?: string;
  validationScore?: string;
  createdAt: string;
}

const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<AITrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  
  // Upload form state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    gradeLevel: '',
    subject: '',
    topic: '',
    difficulty: 'medium',
    categoryId: '',
    contentType: '',
    tags: '',
    schoolId: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const documentsPerPage = 20;

  useEffect(() => {
    loadDocuments();
    loadCategories();
    loadTrainingSessions();
  }, [currentPage, searchTerm, selectedGrade, selectedSubject, selectedContentType]);

  const loadDocuments = async () => {
    try {
      const params = new URLSearchParams({
        limit: documentsPerPage.toString(),
        offset: ((currentPage - 1) * documentsPerPage).toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedGrade && { gradeLevel: selectedGrade }),
        ...(selectedSubject && { subject: selectedSubject }),
        ...(selectedContentType && { contentType: selectedContentType }),
      });

      const response = await fetch(`/api/admin/documents?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
        setTotalDocuments(data.pagination.total);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/document-categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTrainingSessions = async () => {
    try {
      const response = await fetch('/api/admin/ai-training', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrainingSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading training sessions:', error);
    }
  };

  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/admin/documents/upload-url', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL
    };
  };

  const handleUploadComplete = async (result: { successful: Array<{ uploadURL: string; file: File }> }) => {
    try {
      for (const { uploadURL, file } of result.successful) {
        const metadata = {
          ...uploadFormData,
          tags: uploadFormData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          categoryId: uploadFormData.categoryId ? parseInt(uploadFormData.categoryId) : undefined,
          schoolId: uploadFormData.schoolId ? parseInt(uploadFormData.schoolId) : undefined,
        };

        const formData = new FormData();
        formData.append('document', file);
        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch('/api/admin/documents/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to save document metadata for ${file.name}`);
        }
      }

      // Reset form and reload documents
      setUploadFormData({
        title: '',
        description: '',
        gradeLevel: '',
        subject: '',
        topic: '',
        difficulty: 'medium',
        categoryId: '',
        contentType: '',
        tags: '',
        schoolId: ''
      });
      setShowUploadDialog(false);
      loadDocuments();
      
      alert(`Successfully uploaded ${result.successful.length} document(s). Processing will begin shortly.`);
    } catch (error) {
      console.error('Error completing upload:', error);
      alert('Error completing upload. Please try again.');
    }
  };

  const startAITraining = async () => {
    // Get selected processed documents
    const processedDocs = documents.filter(doc => doc.isProcessed);
    if (processedDocs.length === 0) {
      alert('No processed documents available for training. Please upload and wait for documents to be processed first.');
      return;
    }

    const sessionName = prompt('Enter training session name:');
    if (!sessionName) return;

    const gradeLevel = prompt('Target grade level (optional):');
    const subject = prompt('Target subject (optional):');

    try {
      const response = await fetch('/api/admin/ai-training', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionName,
          description: `Training session for ${gradeLevel || 'all grades'} ${subject || 'all subjects'}`,
          gradeLevel,
          subject,
          modelProvider: 'openai',
          modelType: 'gpt-4',
          trainingObjective: 'question_generation',
          documentIds: processedDocs.slice(0, 10).map(doc => doc.id), // Limit to 10 docs for demo
        })
      });

      if (response.ok) {
        loadTrainingSessions();
        alert('AI training session started successfully!');
      } else {
        throw new Error('Failed to start training session');
      }
    } catch (error) {
      console.error('Error starting AI training:', error);
      alert('Error starting AI training session.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalPages = Math.ceil(totalDocuments / documentsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and manage curriculum documents for AI model training</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Curriculum Documents</DialogTitle>
                <DialogDescription>
                  Upload course materials, textbooks, and curriculum documents for AI model training
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Document Metadata Form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={uploadFormData.title}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter document title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contentType">Content Type</Label>
                    <Select onValueChange={(value) => setUploadFormData(prev => ({ ...prev, contentType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="textbook">Textbook</SelectItem>
                        <SelectItem value="worksheet">Worksheet</SelectItem>
                        <SelectItem value="curriculum_standard">Curriculum Standard</SelectItem>
                        <SelectItem value="assessment">Assessment Guide</SelectItem>
                        <SelectItem value="lesson_plan">Lesson Plan</SelectItem>
                        <SelectItem value="reference_material">Reference Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the document content and purpose"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Select onValueChange={(value) => setUploadFormData(prev => ({ ...prev, gradeLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
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
                          <SelectLabel>Caribbean Primary</SelectLabel>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_INFANT_1}>Infant 1</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_INFANT_2}>Infant 2</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_1}>Standard 1</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_2}>Standard 2</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_3}>Standard 3</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_4}>Standard 4</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_STANDARD_5}>Standard 5 - SEA/11+/PEP</SelectItem>
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Caribbean Secondary</SelectLabel>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_1}>Form 1</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_2}>Form 2</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_3}>Form 3</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_4}>Form 4 - CSEC Prep</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_FORM_5}>Form 5 - CSEC Exams</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_LOWER_6TH}>Lower 6th Form</SelectItem>
                          <SelectItem value={GRADE_LEVELS.CARIBBEAN_UPPER_6TH}>Upper 6th Form</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={(value) => setUploadFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Mathematics</SelectItem>
                        <SelectItem value="english">English Language</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="social_studies">Social Studies</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="geography">Geography</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="chemistry">Chemistry</SelectItem>
                        <SelectItem value="biology">Biology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select onValueChange={(value) => setUploadFormData(prev => ({ ...prev, difficulty: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic">Topic (Optional)</Label>
                    <Input
                      id="topic"
                      value={uploadFormData.topic}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Specific topic within subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Comma-separated tags for searchability"
                    />
                  </div>
                </div>

                {/* File Upload Component */}
                <div className="border-t pt-4">
                  <ObjectUploader
                    maxNumberOfFiles={10}
                    maxFileSize={52428800} // 50MB
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    accept=".pdf,.doc,.docx,.txt,.md,.json,.xml"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files to Upload
                  </ObjectUploader>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={startAITraining} variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Start AI Training
          </Button>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Grade Level</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger>
                      <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All grades</SelectItem>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="Grade 1">Grade 1</SelectItem>
                      <SelectItem value="Form 1">Form 1</SelectItem>
                      {/* Add more grades as needed */}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All subjects</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Content Type</Label>
                  <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="textbook">Textbook</SelectItem>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                      <SelectItem value="curriculum_standard">Curriculum Standard</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document List */}
          <div className="grid gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{document.title}</h3>
                        <Badge variant="outline" className={getStatusColor(document.processingStatus)}>
                          {getStatusIcon(document.processingStatus)}
                          <span className="ml-1">{document.processingStatus}</span>
                        </Badge>
                        {document.isValidated && (
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Validated
                          </Badge>
                        )}
                      </div>
                      
                      {document.description && (
                        <p className="text-gray-600 mb-3">{document.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{document.gradeLevel}</Badge>
                        <Badge variant="secondary">{document.subject}</Badge>
                        <Badge variant="secondary">{document.contentType.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{document.difficulty}</Badge>
                        {document.topic && <Badge variant="outline">{document.topic}</Badge>}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>{document.mimeType}</span>
                        <span>Uploaded: {new Date(document.createdAt).toLocaleDateString()}</span>
                        {document.contentQualityScore && (
                          <span>Quality Score: {document.contentQualityScore}%</span>
                        )}
                      </div>

                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {document.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Training Sessions
              </CardTitle>
              <CardDescription>
                Track AI model training sessions using curriculum documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{session.sessionName}</h3>
                      <Badge variant="outline" className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Documents:</span>
                        <span className="ml-1">{session.totalDocuments}</span>
                      </div>
                      <div>
                        <span className="font-medium">Model:</span>
                        <span className="ml-1">{session.modelProvider} {session.modelType}</span>
                      </div>
                      <div>
                        <span className="font-medium">Progress:</span>
                        <span className="ml-1">{session.progressPercent}%</span>
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{new Date(session.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {session.trainingAccuracy && (
                      <div className="mt-2 text-sm text-green-600">
                        Training Accuracy: {session.trainingAccuracy}% | 
                        Validation Score: {session.validationScore}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocuments}</div>
                <p className="text-xs text-gray-600">Across all grade levels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(doc => doc.isProcessed).length}
                </div>
                <p className="text-xs text-gray-600">Ready for AI training</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {trainingSessions.length}
                </div>
                <p className="text-xs text-gray-600">AI customization runs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManagement;
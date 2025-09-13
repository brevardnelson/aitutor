import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessedPDF {
  fileName: string;
  extractedText: string;
  categories: {
    topic: string;
    grade: string;
    contentType: string;
    keyPoints: string[];
    difficulty: string;
    prerequisites: string[];
  };
  processedAt: string;
  status: string;
}

const PDFUpload: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPDFs, setProcessedPDFs] = useState<ProcessedPDF[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file.",
        variant: "destructive"
      });
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Simulate PDF text extraction
    // In a real implementation, you would use a PDF parsing library
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Sample educational content extracted from ${file.name}. This content discusses mathematical concepts including fractions, decimals, and basic arithmetic operations. Students will learn to understand numerator and denominator relationships, convert between different number formats, and solve practical problems using these concepts.`);
      }, 1000);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    
    try {
      // Extract text from PDF
      const pdfContent = await extractTextFromPDF(selectedFile);
      
      // Send to LLM for categorization
      const response = await fetch(
        'https://ydcbxqkwuufyjwuzxvpo.supabase.co/functions/v1/dc11eca3-173c-4ab2-a795-bb8ba05f8ccd',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pdfContent,
            fileName: selectedFile.name
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const processedData: ProcessedPDF = await response.json();
      setProcessedPDFs(prev => [processedData, ...prev]);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "PDF Processed Successfully",
        description: `Content from ${processedData.fileName} has been categorized and added to the knowledge base.`
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "There was an error processing the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF Knowledge Base Upload
          </CardTitle>
          <CardDescription>
            Upload PDF files to extract and automatically categorize content using AI for the tutor's knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pdf-upload">Select PDF File</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              The AI will analyze the PDF content and categorize it by topic, grade level, and learning objectives.
            </p>
          </div>
          
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <Badge variant="outline">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</Badge>
              </div>
              <Button 
                onClick={handleUpload}
                disabled={isProcessing}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process & Categorize
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {processedPDFs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              AI-Processed PDFs
            </CardTitle>
            <CardDescription>
              {processedPDFs.length} PDF{processedPDFs.length !== 1 ? 's' : ''} analyzed and categorized by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {processedPDFs.map((pdf, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{pdf.fileName}</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <Badge variant="outline" className="bg-white">{pdf.status}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">AI-Detected Topic:</span>
                      <Badge className="ml-2 bg-blue-600">{pdf.categories.topic}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Grade Level:</span>
                      <Badge variant="outline" className="ml-2">{pdf.categories.grade}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Content Type:</span>
                      <Badge variant="secondary" className="ml-2">{pdf.categories.contentType}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Difficulty:</span>
                      <Badge className={`ml-2 ${getDifficultyColor(pdf.categories.difficulty)}`}>
                        {pdf.categories.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">AI-Identified Learning Points:</span>
                    <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                      {pdf.categories.keyPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-600">Prerequisites:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {pdf.categories.prerequisites.map((prereq, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">{prereq}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400">
                    AI Analysis Completed: {new Date(pdf.processedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFUpload;
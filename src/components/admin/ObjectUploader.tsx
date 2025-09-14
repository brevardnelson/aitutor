import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; file: File }> }) => void;
  buttonClassName?: string;
  children: ReactNode;
  accept?: string; // File type restrictions
}

/**
 * A file upload component that renders as a button and provides upload functionality
 * for curriculum documents and course materials.
 * 
 * Features:
 * - Drag and drop file upload
 * - Progress tracking
 * - File type validation
 * - Multiple file support
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed (default: 5)
 * @param props.maxFileSize - Maximum file size in bytes (default: 50MB)
 * @param props.onGetUploadParameters - Function to get upload parameters
 * @param props.onComplete - Callback when upload is complete
 * @param props.buttonClassName - Optional CSS class for button
 * @param props.children - Button content
 * @param props.accept - Accepted file types
 */
export function ObjectUploader({
  maxNumberOfFiles = 5,
  maxFileSize = 52428800, // 50MB default for documents
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  accept = ".pdf,.doc,.docx,.txt,.md,.json,.xml"
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadResults, setUploadResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    addFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      // Check file size
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB.`);
        return false;
      }
      
      // Check file type if accept is specified
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const mimeType = file.type;
        
        const isValidType = acceptedTypes.some(acceptType => 
          acceptType === fileExtension || 
          (acceptType.startsWith('.') === false && mimeType.includes(acceptType))
        );
        
        if (!isValidType) {
          alert(`File type ${fileExtension} is not supported. Accepted types: ${accept}`);
          return false;
        }
      }
      
      return true;
    });

    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxNumberOfFiles) {
      alert(`Cannot add more files. Maximum ${maxNumberOfFiles} files allowed.`);
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results: Array<{ uploadURL: string; file: File }> = [];
    const newUploadResults: Record<string, 'pending' | 'success' | 'error'> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${file.name}-${i}`;
      
      try {
        newUploadResults[fileId] = 'pending';
        setUploadResults({ ...newUploadResults });

        // Get upload parameters
        const { url } = await onGetUploadParameters();
        
        // Upload file with progress tracking
        const xhr = new XMLHttpRequest();
        
        await new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: progress
              }));
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              results.push({ uploadURL: url, file });
              newUploadResults[fileId] = 'success';
              resolve(xhr.response);
            } else {
              newUploadResults[fileId] = 'error';
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
            setUploadResults({ ...newUploadResults });
          });

          xhr.addEventListener('error', () => {
            newUploadResults[fileId] = 'error';
            setUploadResults({ ...newUploadResults });
            reject(new Error('Upload failed'));
          });

          xhr.open('PUT', url);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
        
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        newUploadResults[fileId] = 'error';
        setUploadResults({ ...newUploadResults });
      }
    }

    setUploading(false);
    
    if (results.length > 0) {
      onComplete?.({ successful: results });
    }
  };

  const resetUploader = () => {
    setFiles([]);
    setUploadProgress({});
    setUploadResults({});
    setShowModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <Button onClick={() => setShowModal(true)} className={buttonClassName}>
        {children}
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Upload Documents</h2>
              <Button variant="ghost" size="sm" onClick={resetUploader}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <CardContent className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supported: PDF, DOC, DOCX, TXT, MD, JSON, XML
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Max {maxNumberOfFiles} files, {Math.round(maxFileSize / (1024 * 1024))}MB each
                </p>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept={accept}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Selected Files:</h3>
                  {files.map((file, index) => {
                    const fileId = `${file.name}-${index}`;
                    const progress = uploadProgress[fileId] || 0;
                    const result = uploadResults[fileId];
                    
                    return (
                      <div key={fileId} className="flex items-center gap-3 p-3 border rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          
                          {/* Progress Bar */}
                          {uploading && result === 'pending' && (
                            <Progress value={progress} className="mt-1 h-1" />
                          )}
                        </div>
                        
                        {/* Status Icons */}
                        <div className="flex items-center gap-2">
                          {result === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {result === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {!uploading && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload Actions */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetUploader}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadFiles}
                  disabled={files.length === 0 || uploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
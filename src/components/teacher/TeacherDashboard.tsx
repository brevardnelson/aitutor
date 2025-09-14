// Main Teacher Dashboard Component

import React, { useState, useEffect } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

import { ClassOverview } from './ClassOverview';
import { StudentProgress } from './StudentProgress'; 
import { PerformanceAnalytics } from './PerformanceAnalytics';
import { GamificationDashboard } from './GamificationDashboard';
import { teacherAPI, TeacherClass } from '@/lib/teacher-api';

export const TeacherDashboard: React.FC = () => {
  const { user, currentSchool, hasRole } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load teacher's classes on component mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Auto-select first class when classes are loaded
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass]);

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teacherClasses = await teacherAPI.getClasses();
      setClasses(teacherClasses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassChange = (classId: string) => {
    const selected = classes.find(c => c.id.toString() === classId);
    setSelectedClass(selected || null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please sign in to continue</h2>
          <p className="text-gray-600 mt-2">You need to be authenticated to access the teacher dashboard</p>
        </div>
      </div>
    );
  }

  if (!hasRole('teacher')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need teacher permissions to access this dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Teacher Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {user.primaryRole.replace('_', ' ').toUpperCase()}
                </Badge>
                {currentSchool && (
                  <Badge variant="secondary">
                    {currentSchool.name}
                  </Badge>
                )}
                {selectedClass && (
                  <Badge variant="default">
                    {selectedClass.name} - {selectedClass.subject}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {user.full_name}</span>
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading your classes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Classes</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadClasses} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Classes Assigned</h3>
            <p className="mt-1 text-gray-500">
              You don't have any classes assigned yet. Contact your administrator to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Class Selection */}
            <div className="mb-6">
              <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                id="class-select"
                value={selectedClass?.id || ''}
                onChange={(e) => handleClassChange(e.target.value)}
                className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} - {cls.subject} (Grade {cls.grade_level})
                  </option>
                ))}
              </select>
            </div>

            {selectedClass && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Class Overview
                  </TabsTrigger>
                  
                  <TabsTrigger value="students" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Student Progress
                  </TabsTrigger>

                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Performance Analytics
                  </TabsTrigger>

                  <TabsTrigger value="gamification" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Gamification
                  </TabsTrigger>
                </TabsList>

                {/* Class Overview Tab */}
                <TabsContent value="overview">
                  <ClassOverview classId={selectedClass.id} />
                </TabsContent>

                {/* Student Progress Tab */}
                <TabsContent value="students">
                  <StudentProgress classId={selectedClass.id} />
                </TabsContent>

                {/* Performance Analytics Tab */}
                <TabsContent value="analytics">
                  <PerformanceAnalytics classId={selectedClass.id} />
                </TabsContent>

                {/* Gamification Tab */}
                <TabsContent value="gamification">
                  <GamificationDashboard classId={selectedClass.id} />
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </div>
    </div>
  );
};
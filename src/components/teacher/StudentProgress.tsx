// Student Progress Component - Individual Student Tracking

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  RefreshCw,
  Activity,
  BookOpen,
  Award
} from 'lucide-react';

import { teacherAPI, StudentsProgress as StudentsProgressData } from '@/lib/teacher-api';

interface StudentProgressProps {
  classId: number;
}

export const StudentProgress: React.FC<StudentProgressProps> = ({ classId }) => {
  const [data, setData] = useState<StudentsProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  useEffect(() => {
    loadStudentsProgress();
  }, [classId]);

  const loadStudentsProgress = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const progress = await teacherAPI.getStudentsProgress(classId);
      setData(progress);
      // Auto-select first student if available
      if (progress.students.length > 0) {
        setSelectedStudent(progress.students[0].studentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load student progress');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading student progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Progress</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadStudentsProgress} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.students.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Students Enrolled</h3>
        <p className="mt-1 text-gray-500">
          This class doesn't have any students enrolled yet.
        </p>
      </div>
    );
  }

  const selectedStudentData = data.students.find(s => s.studentId === selectedStudent);

  return (
    <div className="space-y-6">
      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{data.classInfo.name}</CardTitle>
          <CardDescription>
            {data.classInfo.subject} • Grade {data.classInfo.grade_level} • {data.students.length} Students
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Students</CardTitle>
              <CardDescription>Click on a student to view detailed progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.students.map((student) => (
                  <div
                    key={student.studentId}
                    onClick={() => setSelectedStudent(student.studentId)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStudent === student.studentId
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={student.analytics.engagementStreak >= 7 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {student.analytics.engagementStreak} day streak
                          </Badge>
                          <span className="text-xs text-gray-600">
                            {Math.round(student.analytics.accuracyRate)}% accuracy
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {student.analytics.totalSessions}
                        </div>
                        <div className="text-xs text-gray-600">sessions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudentData ? (
            <div className="space-y-6">
              {/* Student Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedStudentData.studentName}
                      </CardTitle>
                      <CardDescription>{selectedStudentData.email}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Last Active</div>
                      <div className="text-sm font-medium">
                        {selectedStudentData.analytics.lastActive 
                          ? new Date(selectedStudentData.analytics.lastActive).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Time</CardTitle>
                    <Clock className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(selectedStudentData.analytics.totalTimeSpent)} min
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                    <Activity className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedStudentData.analytics.totalSessions}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                    <Target className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(selectedStudentData.analytics.accuracyRate)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Streak</CardTitle>
                    <Award className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedStudentData.analytics.engagementStreak}
                    </div>
                    <p className="text-xs text-gray-600">days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedStudentData.analytics.recentActivity.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No recent activity recorded
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedStudentData.analytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(activity.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {activity.sessionsCompleted} sessions completed
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {Math.round(activity.timeSpent)} min
                            </div>
                            <div className="text-xs text-gray-600">
                              {Math.round(activity.averageAccuracy)}% accuracy
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Topic Mastery */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Topic Mastery
                  </CardTitle>
                  <CardDescription>
                    Areas of strength and opportunities for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStudentData.analytics.topicMastery.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      No topic mastery data available yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedStudentData.analytics.topicMastery.map((topic, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{topic.topic}</span>
                            <span className="text-sm text-gray-600">
                              {Math.round(topic.masteryLevel)}% mastery
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                topic.masteryLevel >= 80 ? 'bg-green-500' :
                                topic.masteryLevel >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(topic.masteryLevel, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{topic.sessionsCompleted} sessions</span>
                            <span>{Math.round(topic.timeSpent)} min spent</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <User className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-gray-600 mt-2">Select a student to view detailed progress</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
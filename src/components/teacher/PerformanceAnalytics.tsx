// Performance Analytics Component - Interactive Charts and Visualizations

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users,
  RefreshCw,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

import { teacherAPI, StudentsProgress, ClassOverview } from '@/lib/teacher-api';

interface PerformanceAnalyticsProps {
  classId: number;
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ classId }) => {
  const [classData, setClassData] = useState<ClassOverview | null>(null);
  const [studentsData, setStudentsData] = useState<StudentsProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [classId]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load both class overview and student progress data
      const [overview, students] = await Promise.all([
        teacherAPI.getClassOverview(classId),
        teacherAPI.getStudentsProgress(classId)
      ]);
      
      setClassData(overview);
      setStudentsData(students);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!classData || !studentsData) {
    return null;
  }

  // Calculate performance insights
  const studentsWithLowAccuracy = studentsData.students.filter(s => s.analytics.accuracyRate < 65);
  const studentsWithLowEngagement = studentsData.students.filter(s => s.analytics.engagementStreak < 3);
  const topPerformers = studentsData.students
    .filter(s => s.analytics.accuracyRate >= 80 && s.analytics.totalSessions >= 5)
    .sort((a, b) => b.analytics.accuracyRate - a.analytics.accuracyRate)
    .slice(0, 5);

  const classAverageAccuracy = studentsData.students.reduce((sum, s) => sum + s.analytics.accuracyRate, 0) / studentsData.students.length;
  const classAverageTimeSpent = studentsData.students.reduce((sum, s) => sum + s.analytics.totalTimeSpent, 0) / studentsData.students.length;

  return (
    <div className="space-y-6">
      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Performance Analytics - {classData.classInfo.name}
          </CardTitle>
          <CardDescription>
            {classData.classInfo.subject} • Grade {classData.classInfo.grade_level} • Comprehensive performance insights
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Class Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights & Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Class Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Class Average Accuracy</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(classAverageAccuracy)}%
                </div>
                <p className="text-xs text-gray-600">across all students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {classData.analytics.activeStudents.weekly}
                </div>
                <p className="text-xs text-gray-600">this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(classAverageTimeSpent)} min
                </div>
                <p className="text-xs text-gray-600">per student</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                <Award className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {topPerformers.length}
                </div>
                <p className="text-xs text-gray-600">students excelling</p>
              </CardContent>
            </Card>
          </div>

          {/* Topic Performance Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance Overview</CardTitle>
              <CardDescription>
                Most practiced topics and their performance levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classData.analytics.topicsPracticed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No topic data available yet
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classData.analytics.topicsPracticed.map((topic, index) => (
                    <div key={topic.topic} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                        <Badge 
                          variant={topic.averageAccuracy >= 75 ? 'default' : topic.averageAccuracy >= 60 ? 'secondary' : 'destructive'}
                        >
                          {Math.round(topic.averageAccuracy)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {topic.sessionCount} sessions completed
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            topic.averageAccuracy >= 75 ? 'bg-green-500' :
                            topic.averageAccuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(topic.averageAccuracy, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Student Performance Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Distribution</CardTitle>
              <CardDescription>
                How your students are performing across different metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsData.students.map((student) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-gray-900">{student.studentName}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {Math.round(student.analytics.accuracyRate)}%
                        </div>
                        <div className="text-xs text-gray-600">accuracy</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {student.analytics.totalSessions}
                        </div>
                        <div className="text-xs text-gray-600">sessions</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {student.analytics.engagementStreak}
                        </div>
                        <div className="text-xs text-gray-600">day streak</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights & Alerts Tab */}
        <TabsContent value="insights" className="space-y-6">
          {/* Alerts and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students Needing Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Students Needing Support
                </CardTitle>
                <CardDescription>
                  Students who may benefit from additional attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {studentsWithLowAccuracy.length === 0 && studentsWithLowEngagement.length === 0 ? (
                  <div className="text-center py-6 text-green-600">
                    ✅ All students are performing well!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentsWithLowAccuracy.map((student) => (
                      <div key={`accuracy-${student.studentId}`} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                        <span className="text-sm">{student.studentName}</span>
                        <Badge variant="secondary">
                          Low accuracy ({Math.round(student.analytics.accuracyRate)}%)
                        </Badge>
                      </div>
                    ))}
                    {studentsWithLowEngagement.map((student) => (
                      <div key={`engagement-${student.studentId}`} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-sm">{student.studentName}</span>
                        <Badge variant="secondary">
                          Low engagement ({student.analytics.engagementStreak} days)
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Award className="h-5 w-5" />
                  Top Performers
                </CardTitle>
                <CardDescription>
                  Students excelling in their studies
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topPerformers.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    No top performers identified yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topPerformers.map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm">{student.studentName}</span>
                        </div>
                        <Badge variant="default">
                          {Math.round(student.analytics.accuracyRate)}% accuracy
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommendations
              </CardTitle>
              <CardDescription>
                Actionable insights to improve class performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classAverageAccuracy < 70 && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">📚 Class Performance Alert</h4>
                    <p className="text-sm text-red-700">
                      Class average accuracy is below 70%. Consider reviewing fundamental concepts and providing additional practice sessions.
                    </p>
                  </div>
                )}
                
                {classData.analytics.activeStudents.weekly < (classData.classInfo.student_count * 0.6) && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">📈 Engagement Opportunity</h4>
                    <p className="text-sm text-yellow-700">
                      Less than 60% of students were active this week. Consider implementing engagement strategies or reaching out to inactive students.
                    </p>
                  </div>
                )}

                {topPerformers.length >= 3 && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">🌟 Success Story</h4>
                    <p className="text-sm text-green-700">
                      You have {topPerformers.length} top performers! Consider having them mentor struggling students or provide them with advanced challenges.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 General Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Schedule regular check-ins with students showing low engagement</li>
                    <li>• Celebrate achievements to maintain motivation</li>
                    <li>• Use topic performance data to plan targeted review sessions</li>
                    <li>• Encourage peer learning between top performers and struggling students</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
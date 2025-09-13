// Class Overview Component - Analytics Dashboard

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  Target, 
  BookOpen,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';

import { teacherAPI, ClassOverview as ClassOverviewData } from '@/lib/teacher-api';

interface ClassOverviewProps {
  classId: number;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({ classId }) => {
  const [data, setData] = useState<ClassOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClassOverview();
  }, [classId]);

  const loadClassOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const overview = await teacherAPI.getClassOverview(classId);
      setData(overview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class overview');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading class overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Overview</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadClassOverview} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { classInfo, analytics } = data;

  return (
    <div className="space-y-6">
      {/* Class Information Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{classInfo.name}</CardTitle>
              <CardDescription>
                {classInfo.subject} • Grade {classInfo.grade_level} • {classInfo.school_name}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {classInfo.student_count} Students
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.activeStudents.daily}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Daily: {analytics.activeStudents.daily}</div>
                <div>Weekly: {analytics.activeStudents.weekly}</div>
                <div>Monthly: {analytics.activeStudents.monthly}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Time Spent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(analytics.averageTimeSpent)} min
            </div>
            <p className="text-xs text-gray-600">per session</p>
          </CardContent>
        </Card>

        {/* Overall Accuracy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(analytics.overallAccuracy)}%
            </div>
            <p className="text-xs text-gray-600">class average</p>
          </CardContent>
        </Card>

        {/* Curriculum Coverage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Curriculum Coverage</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(analytics.curriculumCoverage)}%
            </div>
            <p className="text-xs text-gray-600">topics covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Practiced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Most Practiced Topics (Last 7 Days)
          </CardTitle>
          <CardDescription>
            Topics your students have been working on recently
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topicsPracticed.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No practice sessions recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.topicsPracticed.map((topic, index) => (
                <div key={topic.topic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{topic.topic}</h4>
                      <p className="text-sm text-gray-600">
                        {topic.sessionCount} sessions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round(topic.averageAccuracy)}%
                    </div>
                    <p className="text-xs text-gray-600">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Engagement Level</h4>
              <p className="text-sm text-blue-700">
                {analytics.activeStudents.daily > (classInfo.student_count * 0.7) 
                  ? "🔥 High engagement - Most students are actively participating!"
                  : analytics.activeStudents.daily > (classInfo.student_count * 0.4)
                  ? "📈 Moderate engagement - Consider motivating inactive students"
                  : "⚠️ Low engagement - Action needed to re-engage students"
                }
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Learning Progress</h4>
              <p className="text-sm text-green-700">
                {analytics.overallAccuracy >= 80
                  ? "✅ Excellent performance - Students are mastering concepts well"
                  : analytics.overallAccuracy >= 65
                  ? "👍 Good progress - Some topics may need reinforcement"
                  : "📚 Focus needed - Consider additional practice or review sessions"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
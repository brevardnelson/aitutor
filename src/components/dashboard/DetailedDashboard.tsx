import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Brain, 
  Award, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity,
  BookOpen,
  Trophy,
  ArrowLeft,
  Download
} from 'lucide-react';
import { dashboardService } from '../../services/dashboard-service';
import type { DashboardSummary } from '../../types/dashboard-metrics';

interface DetailedDashboardProps {
  childId: string;
  childName: string;
  subject: string;
  onBack: () => void;
}

const DetailedDashboard: React.FC<DetailedDashboardProps> = ({ 
  childId, 
  childName, 
  subject, 
  onBack 
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Use real data from database
        const data = await dashboardService.generateDashboardSummary(childId, subject);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        // Fallback to sample data if real data fails
        const sampleData = dashboardService.generateSampleData(childId, subject);
        setDashboardData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [childId, subject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load dashboard data</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const formatSubjectName = (subjectName: string) => {
    return subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{childName}'s {formatSubjectName(subject)} Progress</h1>
              <p className="text-gray-600 mt-1">Comprehensive learning analytics and insights</p>
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">This Week</p>
                  <p className="text-2xl font-bold">{formatTime(dashboardData.engagement.totalLearningTime)}</p>
                  <p className="text-xs text-blue-200">{dashboardData.engagement.sessionsCompleted} sessions</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Accuracy Rate</p>
                  <p className="text-2xl font-bold">{dashboardData.performance.accuracyRate}%</p>
                  <div className="flex items-center gap-1 text-xs text-green-200">
                    {dashboardData.performance.improvementTrend > 0 ? (
                      <>
                        <TrendingUp className="h-3 w-3" />
                        +{dashboardData.performance.improvementTrend}%
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3" />
                        {dashboardData.performance.improvementTrend}%
                      </>
                    )}
                  </div>
                </div>
                <Target className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Progress</p>
                  <p className="text-2xl font-bold">{dashboardData.progress.curriculumProgress}%</p>
                  <p className="text-xs text-purple-200">{dashboardData.progress.topicsCovered.length} topics covered</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Exam Readiness</p>
                  <p className="text-2xl font-bold">{dashboardData.examReadiness.overallScore}%</p>
                  <p className="text-xs text-orange-200">Common Entrance</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Engagement & Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement & Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-700">{dashboardData.engagement.daysActive}</div>
                    <div className="text-sm text-blue-600">Days Active This Week</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-700">{dashboardData.engagement.currentStreak}</div>
                    <div className="text-sm text-green-600">Day Learning Streak</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Session Duration</span>
                    <span className="font-medium">{formatTime(dashboardData.engagement.averageSessionDuration)}</span>
                  </div>
                  <Progress value={(dashboardData.engagement.averageSessionDuration / 45) * 100} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: 45 minutes</div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Time Per Topic</h4>
                  <div className="space-y-2">
                    {Object.entries(dashboardData.engagement.timePerTopic).map(([topic, time]) => (
                      <div key={topic} className="flex justify-between items-center">
                        <span className="text-sm">{topic}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${Math.min((time / Math.max(...Object.values(dashboardData.engagement.timePerTopic))) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{formatTime(time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance & Mastery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.performance.difficultyProgression.easy}</div>
                    <div className="text-sm text-gray-600">Easy Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{dashboardData.performance.difficultyProgression.medium}</div>
                    <div className="text-sm text-gray-600">Medium Problems</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{dashboardData.performance.difficultyProgression.hard}</div>
                    <div className="text-sm text-gray-600">Hard Problems</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Strongest Areas</h4>
                    <div className="space-y-1">
                      {dashboardData.performance.strongestAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">Areas for Improvement</h4>
                    <div className="space-y-1">
                      {dashboardData.performance.weakestAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Interaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Tutor Interaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-700">{dashboardData.aiInteraction.hintsPerSession.toFixed(1)}</div>
                    <div className="text-sm text-purple-600">Hints per Session</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-700">{dashboardData.aiInteraction.avgAttemptsBeforeCorrect.toFixed(1)}</div>
                    <div className="text-sm text-indigo-600">Avg Attempts</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Step-by-Step Engagement</span>
                    <span className="font-medium">{dashboardData.aiInteraction.stepByStepEngagement}%</span>
                  </div>
                  <Progress value={dashboardData.aiInteraction.stepByStepEngagement} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>AI Intervention Rate</span>
                    <span className="font-medium">{dashboardData.aiInteraction.aiInterventionRate}%</span>
                  </div>
                  <Progress 
                    value={dashboardData.aiInteraction.aiInterventionRate} 
                    className="h-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">Lower is better (indicates independence)</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts, Goals, Achievements */}
          <div className="space-y-6">
            
            {/* Active Alerts */}
            {dashboardData.activeAlerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData.activeAlerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'medium' ? 'bg-orange-50 border-orange-500' :
                        'bg-yellow-50 border-yellow-500'
                      }`}
                    >
                      <h5 className="font-medium text-sm">{alert.title}</h5>
                      <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                      {alert.actionRequired && (
                        <Button size="sm" variant="outline" className="mt-2 text-xs">
                          Take Action
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Current Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.recentGoals.map((goal) => (
                  <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-sm">{goal.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                      </Badge>
                    </div>
                    <Progress value={(goal.currentValue / goal.targetValue) * 100} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{goal.currentValue} / {goal.targetValue}</span>
                      <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.progress.recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="text-2xl">{achievement.badgeIcon}</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{achievement.title}</h5>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{achievement.points} pts</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.achievedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exam Readiness Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Exam Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-700">{dashboardData.examReadiness.overallScore}%</div>
                  <div className="text-sm text-blue-600">Overall Readiness</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Estimated ready by: {new Date(dashboardData.examReadiness.estimatedReadinessDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Topic Breakdown</h5>
                  <div className="space-y-2">
                    {Object.entries(dashboardData.examReadiness.topicScores).map(([topic, score]) => (
                      <div key={topic} className="flex justify-between items-center">
                        <span className="text-sm">{topic}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedDashboard;
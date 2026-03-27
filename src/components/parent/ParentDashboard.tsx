// Dedicated Parent Dashboard - Full-featured monitoring of children's learning

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BarChart3,
  TrendingUp,
  Trophy,
  User,
  Clock,
  Target,
  Flame,
  Star,
  Award,
  BookOpen,
  Activity,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Medal,
  Crown,
  Zap,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChildSummary {
  id: number;
  name: string;
  age: number;
  gradeLevel: string;
  sessionsThisWeek: number;
  totalSessions: number;
  accuracy: number;
  totalXP: number;
  level: number;
  weeklyXP: number;
  lastActive: string | null;
  streak: number;
}

interface OverviewKPIs {
  totalChildren: number;
  sessionsThisWeek: number;
  avgAccuracy: number;
  totalXP: number;
}

interface TopicMastery {
  topic: string;
  subject: string;
  sessionsCompleted: number;
  masteryLevel: number;
  timeSpent: number;
}

interface RecentActivity {
  date: string;
  sessionsCompleted: number;
  timeSpent: number;
  averageAccuracy: number;
}

interface AccuracyOverTime {
  week: string;
  accuracy: number;
}

interface SubjectCoverage {
  subject: string;
  sessions: number;
  timeSpent: number;
}

interface ChildAnalytics {
  totalSessions: number;
  accuracyRate: number;
  totalTimeSpent: number;
  engagementStreak: number;
  lastActive: string | null;
  topicMastery: TopicMastery[];
  recentActivity: RecentActivity[];
  accuracyOverTime: AccuracyOverTime[];
  subjectCoverage: SubjectCoverage[];
  areasNeedingAttention: TopicMastery[];
}

interface XPData {
  totalXP: number;
  currentLevel: number;
  weeklyXP: number;
  availableXP: number;
  xpToNextLevel: number;
}

interface BadgeData {
  id: number;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  earnedAt: string | null;
}

interface ChallengeData {
  challengeId: number;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  metric: string;
  isCompleted: boolean;
  endDate: string;
  xpReward: number;
  progress: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = localStorage.getItem('caribbeanAI_token') || '';
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include', headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-gray-600 mt-2">{message}</p>
    </div>
  </div>
);

const ErrorCard: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
      <p className="text-red-600 mb-4 text-sm">{message}</p>
      <Button onClick={onRetry} variant="outline" className="flex items-center gap-2 mx-auto">
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  </div>
);

// ─── Tab: Children Overview ────────────────────────────────────────────────────

const ChildrenOverviewTab: React.FC<{
  children: ChildSummary[];
  kpis: OverviewKPIs;
  onSelectChild: (child: ChildSummary) => void;
}> = ({ children, kpis, onSelectChild }) => {
  const getTierColor = (level: number) => {
    if (level >= 10) return 'text-purple-600';
    if (level >= 5) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.totalChildren}</div>
            <p className="text-xs text-gray-600">registered learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions This Week</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.sessionsThisWeek}</div>
            <p className="text-xs text-gray-600">across all children</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Accuracy</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis.avgAccuracy}%</div>
            <p className="text-xs text-gray-600">overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP Earned</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{kpis.totalXP.toLocaleString()}</div>
            <p className="text-xs text-gray-600">combined experience</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-child Summary Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Children</h3>
        {children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
              <p className="text-gray-600">
                Add your children from the main dashboard to start monitoring their progress here.
              </p>
              <Button className="mt-4" onClick={() => window.location.href = '/'}>
                Go to Main Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map(child => (
              <Card key={child.id} className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectChild(child)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <CardDescription>Age {child.age} · {child.gradeLevel.replace('-', ' ').toUpperCase()}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Quick stats */}
                  <div className="grid grid-cols-4 gap-1 text-center text-sm">
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <Star className="h-3 w-3 text-yellow-500 mx-auto mb-1" />
                      <div className="font-bold text-yellow-700 text-xs">{child.totalXP}</div>
                      <div className="text-xs text-yellow-600">XP</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <Target className="h-3 w-3 text-green-500 mx-auto mb-1" />
                      <div className="font-bold text-green-700 text-xs">{child.accuracy}%</div>
                      <div className="text-xs text-green-600">Accuracy</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <Flame className="h-3 w-3 text-orange-500 mx-auto mb-1" />
                      <div className="font-bold text-orange-700 text-xs">{child.streak}d</div>
                      <div className="text-xs text-orange-600">Streak</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2">
                      <Activity className="h-3 w-3 text-blue-500 mx-auto mb-1" />
                      <div className="font-bold text-blue-700 text-xs">{child.sessionsThisWeek}</div>
                      <div className="text-xs text-blue-600">This Wk</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className={`font-semibold ${getTierColor(child.level)}`}>
                      Level {child.level}
                    </span>
                    <span>
                      {child.lastActive
                        ? `Last active: ${new Date(child.lastActive).toLocaleDateString()}`
                        : 'No activity yet'}
                    </span>
                  </div>

                  <Button size="sm" variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); onSelectChild(child); }}>
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab: Child Progress ───────────────────────────────────────────────────────

const ChildProgressTab: React.FC<{
  children: ChildSummary[];
  selectedChildId: number | null;
  onChildSelect: (id: number) => void;
}> = ({ children, selectedChildId, onChildSelect }) => {
  const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchJSON<{ analytics: ChildAnalytics }>(`/api/parent/children/${selectedChildId}/analytics`)
      .then(d => { if (!cancelled) setAnalytics(d.analytics); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load progress'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedChildId, retryCount]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Child Selector Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Child</CardTitle>
            <CardDescription>Choose a child to view their progress</CardDescription>
          </CardHeader>
          <CardContent>
            {children.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No children added yet</p>
            ) : (
              <div className="space-y-2">
                {children.map(child => (
                  <div
                    key={child.id}
                    onClick={() => onChildSelect(child.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChildId === child.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{child.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {child.totalSessions} sessions · {child.accuracy}% accuracy
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Panel */}
      <div className="lg:col-span-3">
        {!selectedChildId ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <User className="mx-auto h-8 w-8 text-gray-400" />
                <p className="text-gray-600 mt-2">Select a child to view their progress</p>
              </div>
            </CardContent>
          </Card>
        ) : loading ? (
          <LoadingSpinner message="Loading child progress..." />
        ) : error ? (
          <ErrorCard message={error} onRetry={() => setRetryCount(c => c + 1)} />
        ) : analytics ? (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{analytics.totalSessions}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{analytics.accuracyRate}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{analytics.totalTimeSpent} min</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Streak</CardTitle>
                  <Flame className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{analytics.engagementStreak}</div>
                  <p className="text-xs text-gray-600">days</p>
                </CardContent>
              </Card>
            </div>

            {/* Topic Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Topic Mastery
                </CardTitle>
                <CardDescription>Progress across all topics practiced</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.topicMastery.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No topic data available yet</div>
                ) : (
                  <div className="space-y-4">
                    {analytics.topicMastery.slice(0, 10).map((topic, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-gray-900">{topic.topic}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{topic.subject}</Badge>
                          </div>
                          <span className="text-sm text-gray-600">{topic.masteryLevel}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              topic.masteryLevel >= 80 ? 'bg-green-500' :
                              topic.masteryLevel >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(topic.masteryLevel, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{topic.sessionsCompleted} sessions</span>
                          <span>{topic.timeSpent} min spent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Activity (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No recent activity</div>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(activity.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-sm text-gray-600">{activity.sessionsCompleted} sessions</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{activity.timeSpent} min</div>
                          <div className="text-xs text-gray-500">{activity.averageAccuracy}% accuracy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ─── Tab: Performance Analytics ────────────────────────────────────────────────

const PerformanceAnalyticsTab: React.FC<{
  children: ChildSummary[];
  selectedChildId: number | null;
  onChildSelect: (id: number) => void;
}> = ({ children, selectedChildId, onChildSelect }) => {
  const [analytics, setAnalytics] = useState<ChildAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!selectedChildId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchJSON<{ analytics: ChildAnalytics }>(`/api/parent/children/${selectedChildId}/analytics`)
      .then(d => { if (!cancelled) setAnalytics(d.analytics); })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load analytics'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedChildId, retryCount]);

  return (
    <div className="space-y-6">
      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">View analytics for:</span>
          <div className="flex gap-2 flex-wrap">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => onChildSelect(child.id)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  selectedChildId === child.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedChildId ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-gray-600 mt-2">Select a child to view their analytics</p>
            </div>
          </CardContent>
        </Card>
      ) : loading ? (
        <LoadingSpinner message="Loading analytics..." />
      ) : error ? (
        <ErrorCard message={error} onRetry={() => setRetryCount(c => c + 1)} />
      ) : analytics ? (
        <>
          {/* Accuracy over time - visual bars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Accuracy Over Time (Last 30 Days)
              </CardTitle>
              <CardDescription>Weekly accuracy performance</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.accuracyOverTime.length === 0 ? (
                <div className="text-center py-6 text-gray-500">Not enough data yet</div>
              ) : (
                <div className="space-y-3">
                  {analytics.accuracyOverTime.map((week, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Week of {new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="font-medium">{week.accuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            week.accuracy >= 80 ? 'bg-green-500' :
                            week.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(week.accuracy, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Coverage
              </CardTitle>
              <CardDescription>Time spent per subject area</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.subjectCoverage.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No subject data yet</div>
              ) : (
                <div className="space-y-4">
                  {analytics.subjectCoverage.map((subject, i) => {
                    const maxTime = Math.max(...analytics.subjectCoverage.map(s => s.timeSpent));
                    const pct = maxTime > 0 ? Math.round((subject.timeSpent / maxTime) * 100) : 0;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium capitalize text-gray-900">{subject.subject}</span>
                          <span className="text-gray-600">{subject.sessions} sessions · {subject.timeSpent} min</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-blue-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Spent Per Topic */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Spent Per Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topicMastery.length === 0 ? (
                <div className="text-center py-6 text-gray-500">No topic data yet</div>
              ) : (
                <div className="space-y-3">
                  {[...analytics.topicMastery]
                    .sort((a, b) => b.timeSpent - a.timeSpent)
                    .slice(0, 8)
                    .map((topic, i) => {
                      const maxTime = Math.max(...analytics.topicMastery.map(t => t.timeSpent));
                      const pct = maxTime > 0 ? Math.round((topic.timeSpent / maxTime) * 100) : 0;
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-32 text-sm text-gray-700 truncate" title={topic.topic}>{topic.topic}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="text-xs text-gray-500 w-16 text-right">{topic.timeSpent} min</div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas Needing Attention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-5 w-5" />
                Areas Needing Attention
              </CardTitle>
              <CardDescription>Topics with mastery below 60% after multiple sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.areasNeedingAttention.length === 0 ? (
                <div className="text-center py-6 text-green-600 font-medium">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  All practiced topics are performing well!
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.areasNeedingAttention.map((topic, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{topic.topic}</span>
                        <Badge variant="outline" className="ml-2 text-xs">{topic.subject}</Badge>
                        <div className="text-xs text-gray-500 mt-1">{topic.sessionsCompleted} sessions attempted</div>
                      </div>
                      <Badge variant="destructive">{topic.masteryLevel}% mastery</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

// ─── Tab: Gamification Summary ─────────────────────────────────────────────────

const GamificationSummaryTab: React.FC<{
  children: ChildSummary[];
}> = ({ children }) => {
  const [gamData, setGamData] = useState<Record<number, { xp: XPData; badges: BadgeData[]; challenges: ChallengeData[] }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = async () => {
    if (children.length === 0) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.all(
        children.map(child =>
          fetchJSON<{ xp: XPData; badges: BadgeData[]; challenges: ChallengeData[] }>(
            `/api/parent/children/${child.id}/gamification`
          ).then(d => ({ id: child.id, data: d }))
        )
      );
      const map: Record<number, { xp: XPData; badges: BadgeData[]; challenges: ChallengeData[] }> = {};
      for (const r of results) map[r.id] = r.data;
      setGamData(map);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  const childIds = children.map(c => c.id).join(',');
  useEffect(() => { loadAll(); }, [childIds]);

  if (loading) return <LoadingSpinner message="Loading gamification data..." />;
  if (error) return <ErrorCard message={error} onRetry={loadAll} />;

  if (children.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
          <p className="text-gray-600">Add children to see their gamification progress.</p>
        </CardContent>
      </Card>
    );
  }

  // Build sibling leaderboard
  const leaderboard = children.map(child => ({
    ...child,
    totalXP: gamData[child.id]?.xp?.totalXP || 0,
    level: gamData[child.id]?.xp?.currentLevel || 1,
    badgeCount: gamData[child.id]?.badges?.length || 0,
  })).sort((a, b) => b.totalXP - a.totalXP);

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-orange-100 text-orange-800',
      silver: 'bg-gray-100 text-gray-800',
      gold: 'bg-yellow-100 text-yellow-800',
      platinum: 'bg-blue-100 text-blue-800',
      diamond: 'bg-purple-100 text-purple-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Sibling Leaderboard */}
      {children.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Family Leaderboard
            </CardTitle>
            <CardDescription>How your children compare to each other</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((child, index) => (
                <div key={child.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{child.name}</div>
                    <div className="text-xs text-gray-500">Level {child.level} · {child.badgeCount} badges</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-600 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {child.totalXP.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Per-child Gamification */}
      {children.map(child => {
        const data = gamData[child.id];
        if (!data) return null;
        const { xp, badges, challenges } = data;
        const xpPct = xp.xpToNextLevel > 0
          ? Math.min(100, Math.round(((xp.totalXP % (xp.currentLevel * 100)) / (xp.currentLevel * 100)) * 100))
          : 100;

        return (
          <Card key={child.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {child.name}
                </CardTitle>
                <Badge variant="secondary" className="text-sm px-3">
                  Level {xp.currentLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* XP Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Experience Points</span>
                  </div>
                  <span className="text-sm text-gray-600">{xp.totalXP.toLocaleString()} XP total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                  <div className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${xpPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{xp.weeklyXP} XP this week</span>
                  <span>{xp.xpToNextLevel} XP to Level {xp.currentLevel + 1}</span>
                </div>
              </div>

              {/* Badges */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Medal className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Badges ({badges.length})</span>
                </div>
                {badges.length === 0 ? (
                  <p className="text-gray-500 text-sm">No badges earned yet. Keep learning!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.slice(0, 8).map(badge => (
                      <div
                        key={badge.id}
                        title={`${badge.name}: ${badge.description}`}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTierBadge(badge.tier)}`}
                      >
                        <span>{badge.icon}</span>
                        {badge.name}
                      </div>
                    ))}
                    {badges.length > 8 && (
                      <div className="flex items-center px-2 py-1 rounded-full text-xs text-gray-500 bg-gray-100">
                        +{badges.length - 8} more
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Challenges */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Active Weekly Challenges</span>
                </div>
                {challenges.length === 0 ? (
                  <p className="text-gray-500 text-sm">No active challenges right now.</p>
                ) : (
                  <div className="space-y-3">
                    {challenges.map(challenge => (
                      <div key={challenge.challengeId} className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900">{challenge.title}</span>
                          {challenge.isCompleted ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Done
                            </Badge>
                          ) : (
                            <Badge variant="outline">{challenge.progress}%</Badge>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full ${challenge.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${challenge.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{challenge.currentValue} / {challenge.targetValue} {challenge.metric.replace('_', ' ')}</span>
                          <span>+{challenge.xpReward} XP reward</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ─── Main ParentDashboard ─────────────────────────────────────────────────────

export const ParentDashboard: React.FC = () => {
  const { user: jwtUser, isLoading: jwtLoading } = useAuth();

  const isParent = !jwtLoading && !!jwtUser && jwtUser.primaryRole === 'parent';

  const [activeTab, setActiveTab] = useState('overview');
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [kpis, setKpis] = useState<OverviewKPIs>({ totalChildren: 0, sessionsThisWeek: 0, avgAccuracy: 0, totalXP: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const loadCalledRef = useRef(false);

  const loadOverview = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchJSON<{ children: ChildSummary[]; kpis: OverviewKPIs }>('/api/parent/overview');
      setChildren(data.children);
      setKpis(data.kpis);
      if (data.children.length > 0 && !selectedChildId) {
        setSelectedChildId(data.children[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (jwtLoading) return;
    if (isParent && !loadCalledRef.current) {
      loadCalledRef.current = true;
      loadOverview();
    } else if (!isParent) {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwtLoading, isParent]);

  const handleSelectChildFromOverview = (child: ChildSummary) => {
    setSelectedChildId(child.id);
    setActiveTab('progress');
  };

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (jwtLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!jwtUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Please sign in to continue</h2>
          <Button className="mt-4" onClick={() => window.location.href = '/'}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  if (!isParent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">This dashboard is for parent accounts only.</p>
          <p className="text-sm text-gray-400 mt-1">Signed in as: {jwtUser.email} ({jwtUser.primaryRole})</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/'}>Back to Home</Button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Parent Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">PARENT</Badge>
                <span className="text-sm text-gray-500">{kpis.totalChildren} {kpis.totalChildren === 1 ? 'child' : 'children'} registered</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {jwtUser.fullName}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingSpinner message="Loading your dashboard..." />
        ) : error ? (
          <ErrorCard message={error} onRetry={() => { loadCalledRef.current = false; loadOverview(); }} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Children Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Child Progress</span>
                <span className="sm:hidden">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Performance Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="gamification" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline">Gamification Summary</span>
                <span className="sm:hidden">Gamification</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ChildrenOverviewTab
                children={children}
                kpis={kpis}
                onSelectChild={handleSelectChildFromOverview}
              />
            </TabsContent>

            <TabsContent value="progress">
              <ChildProgressTab
                children={children}
                selectedChildId={selectedChildId}
                onChildSelect={setSelectedChildId}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <PerformanceAnalyticsTab
                children={children}
                selectedChildId={selectedChildId}
                onChildSelect={setSelectedChildId}
              />
            </TabsContent>

            <TabsContent value="gamification">
              <GamificationSummaryTab children={children} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

// Teacher Gamification Dashboard - XP, Badges, Challenges, and Leaderboards

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Target, 
  TrendingUp,
  Users,
  Star,
  Award,
  AlertTriangle,
  Crown,
  Zap,
  CheckCircle,
  RefreshCw,
  Gift,
  Calendar
} from 'lucide-react';

interface GamificationDashboardProps {
  classId: number;
}

// Updated interfaces to match backend response structure
interface StudentGamificationData {
  studentId: number;
  studentName: string;
  xp: {
    totalXP: number;
    currentLevel: number;
    xpToNextLevel: number;
    weeklyXP: number;
  };
  badges: {
    totalBadges: number;
    recentBadges: Array<{
      id: number;
      name: string;
      category: string;
      earnedAt: string;
    }>;
  };
  challenges: {
    weeklyProgress: number;
    completedChallenges: number;
    currentStreak: number;
  };
  leaderboardPosition: {
    weeklyXPRank: number;
    badgeCountRank: number;
    challengeRank: number;
  };
  lastActive: string;
}

// Backend API response structure
interface GamificationApiResponse {
  success: boolean;
  classInfo: {
    id: number;
    name: string;
    subject: string;
    gradeLevel: string;
  };
  summary: {
    totalStudents: number;
    averageXP: number;
    totalBadgesEarned: number;
    challengeParticipation: number;
    activeStudents: number;
  };
  topPerformers: Array<{
    studentId: number;
    studentName: string;
    xp: number;
    badges: number;
    level: number;
  }>;
  needsAttention: Array<{
    studentId: number;
    studentName: string;
    reasons: string[];
  }>;
  leaderboard: {
    entries: Array<{
      rank: number;
      studentId: number;
      studentName: string;
      currentValue: number;
      trendDirection: string | null;
    }>;
    period: {
      start: string;
      end: string;
    } | null;
  };
  students: Array<{
    studentId: number;
    studentName: string;
    xp: {
      totalXP: number;
      currentLevel: number;
      weeklyXP: number;
      xpToNextLevel: number;
    };
    badges: {
      totalBadges: number;
      recentBadges: Array<any>;
    };
    challenges: {
      weeklyProgress: number;
      completedChallenges: number;
      currentStreak: number;
    };
    leaderboardPosition: {
      weeklyXPRank: number;
      badgeCountRank: number;
      challengeRank: number;
    };
    lastActive: string;
  }>;
}

interface ClassGamificationSummary {
  totalStudents: number;
  averageXP: number;
  totalBadgesEarned: number;
  challengeParticipation: number;
  activeStudents: number;
  topPerformers: Array<{
    studentId: number;
    studentName: string;
    xp: number;
    badges: number;
    level: number;
  }>;
  needsAttention: Array<{
    studentId: number;
    studentName: string;
    reasons: string[];
  }>;
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ classId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentsData, setStudentsData] = useState<StudentGamificationData[]>([]);
  const [classSummary, setClassSummary] = useState<ClassGamificationSummary | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [apiData, setApiData] = useState<GamificationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGamificationData();
  }, [classId]);

  const loadGamificationData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the single aggregate endpoint instead of N+1 API calls
      const response = await fetch(`/api/teacher/class/${classId}/gamification`, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('caribbeanAI_rbac_session') || '{}').token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load gamification data');
      }

      const data: GamificationApiResponse = await response.json();
      setApiData(data);

      // Transform API response data to match frontend interfaces
      const studentGamificationData: StudentGamificationData[] = data.students.map((student, index) => {
        // Calculate leaderboard positions from the leaderboard entries
        const leaderboardRank = data.leaderboard.entries.findIndex(entry => entry.studentId === student.studentId) + 1;
        
        return {
          studentId: student.studentId,
          studentName: student.studentName,
          xp: {
            totalXP: student.xp.totalXP,
            currentLevel: student.xp.currentLevel,
            xpToNextLevel: student.xp.xpToNextLevel,
            weeklyXP: student.xp.weeklyXP
          },
          badges: {
            totalBadges: student.badges.totalBadges,
            recentBadges: student.badges.recentBadges.map((badge: any) => ({
              id: badge.id || 0,
              name: badge.name || 'Badge',
              category: badge.category || 'general',
              earnedAt: badge.earnedAt || new Date().toISOString()
            }))
          },
          challenges: {
            weeklyProgress: student.challenges.weeklyProgress,
            completedChallenges: student.challenges.completedChallenges,
            currentStreak: student.challenges.currentStreak
          },
          leaderboardPosition: {
            weeklyXPRank: leaderboardRank || 0,
            badgeCountRank: 0, // Could be enhanced with badge-based leaderboard
            challengeRank: 0   // Could be enhanced with challenge-based leaderboard
          },
          lastActive: student.lastActive
        };
      });

      setStudentsData(studentGamificationData);

      // Use the class summary from the API response
      setClassSummary({
        totalStudents: data.summary.totalStudents,
        averageXP: data.summary.averageXP,
        totalBadgesEarned: data.summary.totalBadgesEarned,
        challengeParticipation: data.summary.challengeParticipation,
        activeStudents: data.summary.activeStudents,
        topPerformers: data.topPerformers,
        needsAttention: data.needsAttention
      });

      // Use leaderboard data from the aggregate response
      setLeaderboardData(data.leaderboard);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
    } finally {
      setIsLoading(false);
    }
  };

  const awardBadgeToStudent = async (studentId: number, badgeId: number) => {
    try {
      const response = await fetch('/api/gamification/badges/award', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('caribbeanAI_rbac_session') || '{}').token}`
        },
        body: JSON.stringify({
          studentId,
          badgeId,
          metadata: { awardedBy: 'teacher', reason: 'Teacher recognition' }
        })
      });

      if (response.ok) {
        loadGamificationData(); // Refresh data
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading gamification data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Gamification Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadGamificationData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Gamification Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6" />
              Gamification Dashboard
            </h2>
            <p className="text-purple-100 mt-1">
              Track student engagement through XP, badges, challenges, and leaderboards
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{classSummary?.totalStudents || 0}</div>
            <div className="text-purple-100">Active Students</div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Medal className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* XP Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average XP</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(classSummary?.averageXP || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Class average experience points
                </p>
              </CardContent>
            </Card>

            {/* Badges Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
                <Medal className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classSummary?.totalBadgesEarned || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Badges earned by class
                </p>
              </CardContent>
            </Card>

            {/* Challenge Participation */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Challenge Rate</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(classSummary?.challengeParticipation || 0)}%</div>
                <p className="text-xs text-muted-foreground">
                  Weekly participation rate
                </p>
              </CardContent>
            </Card>

            {/* Needs Attention */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classSummary?.needsAttention.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Students needing support
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
              <CardDescription>
                Students leading in XP and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classSummary?.topPerformers.map((student, index) => (
                  <div key={student.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-gray-600">{student.xp} XP • {student.badges} badges</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Level {Math.floor(student.xp / 100) + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5" />
                  Student Badge Collections
                </CardTitle>
                <CardDescription>
                  Track which students have earned which badges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentsData.map(student => (
                    <div key={student.studentId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{student.studentName}</h4>
                        <Badge variant="outline">
                          {student.badges.totalBadges} badges
                        </Badge>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {student.badges.recentBadges.map(badge => (
                          <Badge key={badge.id} variant="secondary" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {badge.name}
                          </Badge>
                        ))}
                        {student.badges.recentBadges.length === 0 && (
                          <p className="text-gray-500 text-sm">No badges earned yet</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Class Leaderboards
              </CardTitle>
              <CardDescription>
                Weekly XP rankings for your class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardData?.entries && leaderboardData.entries.length > 0 ? (
                <div className="space-y-3">
                  {leaderboardData.entries.map((entry: any, index: number) => (
                    <div key={entry.studentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-medium">{entry.studentName}</p>
                          <p className="text-sm text-gray-600">{entry.currentValue} XP this week</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={index < 3 ? 'default' : 'secondary'}>
                          {entry.trendDirection === 'up' && '↗️'}
                          {entry.trendDirection === 'down' && '↘️'}
                          {entry.trendDirection === 'same' && '→'}
                          {entry.trendDirection === 'new' && '🆕'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No leaderboard data available yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Weekly Challenges
              </CardTitle>
              <CardDescription>
                Monitor student participation in weekly challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsData.map(student => (
                  <div key={student.studentId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{student.studentName}</h4>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {student.challenges.weeklyProgress}% progress
                        </Badge>
                        <Badge variant="secondary">
                          {student.challenges.currentStreak} day streak
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${student.challenges.weeklyProgress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
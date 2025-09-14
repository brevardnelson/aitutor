// Parent badges display component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, TrendingUp, Target, Gift, Trophy, Book, ChevronRight } from 'lucide-react';

interface ParentBadge {
  id: number;
  type: string;
  title: string;
  description: string;
  badgeIcon: string;
  earnedAt: string;
  studentName: string;
}

interface EngagementData {
  studentId: number;
  studentName: string;
  engagementScore: number;
  engagementLevel: string;
  totalLogins: number;
  weeklyLogins: number;
}

interface ParentBadgesProps {
  userId: number;
}

const ParentBadges: React.FC<ParentBadgesProps> = ({ userId }) => {
  const [badges, setBadges] = useState<ParentBadge[]>([]);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchParentBadges();
  }, [userId]);

  const fetchParentBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parent/badges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges || []);
        setEngagement(data.engagement || []);
      }
    } catch (error) {
      console.error('Failed to fetch parent badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEngagementLevelColor = (level: string) => {
    switch (level) {
      case 'champion': return 'bg-purple-100 text-purple-800';
      case 'super_parent': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEngagementLevelIcon = (level: string) => {
    switch (level) {
      case 'champion': return <Trophy className="h-4 w-4" />;
      case 'super_parent': return <Award className="h-4 w-4" />;
      case 'active': return <TrendingUp className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const displayedBadges = showAll ? badges : badges.slice(0, 6);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engagement Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Engagement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {engagement.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Start engaging with your children's learning to see your progress!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {engagement.map(child => (
                <div key={child.studentId} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{child.studentName}</h4>
                    <Badge className={`${getEngagementLevelColor(child.engagementLevel)} flex items-center gap-1`}>
                      {getEngagementLevelIcon(child.engagementLevel)}
                      {child.engagementLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Engagement Score</span>
                      <span className="font-medium">{child.engagementScore}/100</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, child.engagementScore)}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                      <div>
                        <p className="text-gray-600">Total Logins</p>
                        <p className="font-medium">{child.totalLogins}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">This Week</p>
                        <p className="font-medium">{child.weeklyLogins}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parent Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Badges ({badges.length})
            </div>
            {badges.length > 6 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="text-sm flex items-center gap-1"
              >
                {showAll ? 'Show Less' : 'Show All'}
                <ChevronRight className="h-3 w-3" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <h3 className="font-medium text-lg mb-2">No badges yet</h3>
              <p className="text-sm">Keep supporting your children's learning journey!</p>
              <p className="text-xs mt-2">
                You'll earn badges for goals set, consistent engagement, and celebrating achievements.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="p-4 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3">{badge.badgeIcon}</div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {badge.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {badge.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{badge.studentName}</span>
                      <span>{formatDate(badge.earnedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {badges.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Keep It Up!</h4>
              </div>
              <p className="text-sm text-blue-800">
                Your engagement makes a real difference in your children's learning success. 
                Continue setting goals, celebrating achievements, and staying involved!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentBadges;
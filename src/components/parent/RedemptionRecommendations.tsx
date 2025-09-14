// Point redemption recommendations component for parents
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, DollarSign, TrendingUp, BookOpen, Palette, Zap, Users, Gamepad2, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface RewardRecommendation {
  id: string;
  name: string;
  description: string;
  category: 'educational' | 'creative' | 'physical' | 'social' | 'digital';
  xpCost: number;
  confidence: number;
  reasoning: string[];
  priority: 'high' | 'medium' | 'low';
  ageAppropriate: boolean;
  benefits: string[];
  parentGuidance: string;
}

interface Student {
  id: number;
  studentName: string;
  currentXP: number;
  currentLevel: number;
}

interface RedemptionRecommendationsProps {
  studentId: number;
}

const RedemptionRecommendations: React.FC<RedemptionRecommendationsProps> = ({ studentId }) => {
  const [recommendations, setRecommendations] = useState<RewardRecommendation[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [studentId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/parent/recommendations/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setStudent(data.student);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackRecommendationChoice = async (recommendationId: string, chosen: boolean) => {
    try {
      await fetch(`/api/parent/recommendations/${studentId}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recommendationId,
          chosen
        })
      });
    } catch (error) {
      console.error('Failed to track recommendation choice:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'educational': return <BookOpen className="h-4 w-4" />;
      case 'creative': return <Palette className="h-4 w-4" />;
      case 'physical': return <Zap className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'digital': return <Gamepad2 className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'educational': return 'bg-blue-100 text-blue-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'physical': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-yellow-100 text-yellow-800';
      case 'digital': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canAfford = (cost: number) => {
    return student ? student.currentXP >= cost : false;
  };

  const handleRecommendationSelect = (recommendationId: string) => {
    setSelectedRecommendation(recommendationId);
    trackRecommendationChoice(recommendationId, true);
  };

  const toggleExpanded = (recommendationId: string) => {
    setExpandedCard(expandedCard === recommendationId ? null : recommendationId);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Reward Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Smart Reward Suggestions
            {student && (
              <Badge className="bg-green-100 text-green-800">
                {student.currentXP} XP Available
              </Badge>
            )}
          </div>
          {student && (
            <div className="text-sm text-gray-600">
              Level {student.currentLevel} • {student.studentName}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="font-medium text-lg mb-2">No recommendations available</h3>
            <p className="text-sm">Recommendations will appear based on your child's learning progress.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">How Recommendations Work</h4>
              </div>
              <p className="text-sm text-blue-800">
                These suggestions are based on {student?.studentName}'s learning patterns, progress, and interests. 
                Educational rewards are prioritized to reinforce positive learning habits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map(recommendation => {
                const affordable = canAfford(recommendation.xpCost);
                const isExpanded = expandedCard === recommendation.id;
                
                return (
                  <div
                    key={recommendation.id}
                    className={`border rounded-lg transition-all duration-200 ${
                      affordable 
                        ? 'border-green-200 bg-green-50/50 hover:bg-green-50' 
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(recommendation.category)}
                          <Badge className={getCategoryColor(recommendation.category)}>
                            {recommendation.category}
                          </Badge>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-lg font-bold ${affordable ? 'text-green-600' : 'text-gray-600'}`}>
                            {recommendation.xpCost} XP
                          </div>
                          <div className="text-xs text-gray-500">
                            {recommendation.confidence}% match
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {recommendation.name}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {recommendation.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        {recommendation.benefits.slice(0, 3).map((benefit, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(recommendation.id)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                        >
                          {isExpanded ? 'Less Details' : 'More Details'}
                          {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                        </Button>

                        <div className="flex items-center gap-2">
                          {affordable ? (
                            <Button
                              size="sm"
                              onClick={() => handleRecommendationSelect(recommendation.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Good Choice
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" disabled>
                              Need {recommendation.xpCost - (student?.currentXP || 0)} more XP
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Why This Recommendation?</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {recommendation.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <Star className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Parent Guidance</h4>
                            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                              {recommendation.parentGuidance}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                            <div className="flex flex-wrap gap-1">
                              {recommendation.benefits.map((benefit, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Recommendation Tips</h4>
              </div>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Educational rewards build lasting learning habits</li>
                <li>• Consider your child's current interests and challenges</li>
                <li>• Balance digital rewards with physical and creative options</li>
                <li>• Celebrate achievements to maintain motivation</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RedemptionRecommendations;
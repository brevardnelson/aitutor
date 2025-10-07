import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, BookOpen, TrendingUp, LogOut, Trophy, Bell } from 'lucide-react';
import AddChildForm from './AddChildForm';
import ChildCard from './ChildCard';
import UnenrolledChildCard from './UnenrolledChildCard';
import DetailedDashboard from './DetailedDashboard';
import ParentNotifications from '../parent/ParentNotifications';
import ParentBadges from '../parent/ParentBadges';
import RedemptionRecommendations from '../parent/RedemptionRecommendations';

interface DashboardProps {
  onStartLearning: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartLearning }) => {
  const { user } = useAuth();
  const { children, selectedSubject, isLoadingChildren } = useAppContext();
  const [showAddChild, setShowAddChild] = React.useState(false);
  const [showDetailedDashboard, setShowDetailedDashboard] = React.useState(false);
  const [selectedChildForAnalytics, setSelectedChildForAnalytics] = React.useState<{id: number, name: string} | null>(null);
  const [activeTab, setActiveTab] = React.useState<'children' | 'gamification'>('children');
  
  // Get subject-specific children
  const currentSubject = selectedSubject || 'math';
  const enrolledChildren = children.filter(child => child.subjects?.includes(currentSubject));
  const unenrolledChildren = children.filter(child => !child.subjects?.includes(currentSubject));

  const handleViewAnalytics = (childId: number, childName: string) => {
    setSelectedChildForAnalytics({ id: childId, name: childName });
    setShowDetailedDashboard(true);
  };

  const handleBackFromAnalytics = () => {
    setShowDetailedDashboard(false);
    setSelectedChildForAnalytics(null);
  };

  if (!user) return null;

  // Show detailed dashboard if selected
  if (showDetailedDashboard && selectedChildForAnalytics) {
    return (
      <DetailedDashboard
        childId={selectedChildForAnalytics.id}
        childName={selectedChildForAnalytics.name}
        subject={currentSubject}
        onBack={handleBackFromAnalytics}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.fullName}!</h1>
            <p className="text-gray-600 mt-1">Manage your children's learning journey</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              disabled
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Curriculum
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()} // Simple logout for now
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Children</p>
                  <p className="text-3xl font-bold">{children.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Active Sessions</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Avg Progress</p>
                  <p className="text-3xl font-bold">78%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setActiveTab('children')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'children'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="h-4 w-4" />
              My Children
            </button>
            
            <button
              onClick={() => setActiveTab('gamification')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'gamification'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Achievement Center
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'children' ? (
          <div>
            {/* Subject Header */}
            <div className="mb-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {currentSubject} Learning Dashboard
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your children's progress in {currentSubject}
                </p>
              </div>
            </div>

            {/* Children Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Children</h2>
                <Button 
                  onClick={() => setShowAddChild(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Child
                </Button>
              </div>

              {children.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-dashed border-2 border-gray-300">
                  <CardContent className="p-12 text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
                    <p className="text-gray-600 mb-4">Add your first child to start their learning journey</p>
                    <Button 
                      onClick={() => setShowAddChild(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Add Your First Child
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {/* Enrolled Children */}
                  {enrolledChildren.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Ready to Learn {currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledChildren.map(child => (
                          <ChildCard 
                            key={child.id} 
                            child={child} 
                            onStartLearning={onStartLearning}
                            onViewAnalytics={handleViewAnalytics}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Unenrolled Children */}
                  {unenrolledChildren.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Add to {currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unenrolledChildren.map(child => (
                          <UnenrolledChildCard key={child.id} child={child} subject={currentSubject} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* If no children in current subject but has children */}
                  {enrolledChildren.length === 0 && unenrolledChildren.length === 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-dashed border-2 border-gray-300">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No children in {currentSubject} yet
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Add your existing children to {currentSubject} or create new ones
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Gamification Tab
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Parent Notifications */}
              <ParentNotifications userId={user.id} />
              
              {/* Parent Badges */}
              <ParentBadges userId={user.id} />
            </div>
            
            {/* Redemption Recommendations for each child */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900">Smart Reward Recommendations</h3>
              {children.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                  {children.map(child => (
                    <RedemptionRecommendations
                      key={child.id}
                      studentId={child.id}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Children Added Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Add children to see personalized reward recommendations
                    </p>
                    <Button
                      onClick={() => setShowAddChild(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Child
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Add Child Modal */}
        {showAddChild && (
          <AddChildForm onClose={() => setShowAddChild(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
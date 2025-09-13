import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  onSignOut?: () => void;
  onBackToSubjects?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, onSignOut, onBackToSubjects }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    if (onSignOut) onSignOut();
  };

  const handleBackToSubjects = () => {
    if (onBackToSubjects) onBackToSubjects();
  };

  // Only show layout header if user is authenticated
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      {/* Header with user info and logout */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Caribbean AI Tutor
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.full_name} ({user.role})
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToSubjects}
              >
                Change Subject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
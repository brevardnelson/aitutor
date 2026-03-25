import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';

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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <PublicHeader />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Caribbean AI Tutor</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user.fullName} ({user.primaryRole})
              </span>
              {(user.primaryRole === 'system_admin' || user.primaryRole === 'school_admin') && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
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

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default AppLayout;

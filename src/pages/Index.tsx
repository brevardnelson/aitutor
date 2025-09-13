
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import AuthForm from '@/components/auth/AuthForm';
import SubjectSelector from '@/components/SubjectSelector';
import Dashboard from '@/components/dashboard/Dashboard';
import TutorInterface from '@/components/tutor/TutorInterface';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { type Subject } from '@/lib/ai-service';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'tutor' | 'curriculum'>('auth');

  const handleSubjectSelect = (subjectId: string) => {
    console.log('Subject selected:', subjectId);
    const subject = subjectId as Subject;
    setSelectedSubject(subject);
    if (subject === 'math') {
      console.log('Setting view to dashboard');
      setCurrentView('dashboard'); // Go to existing math dashboard
    } else {
      // For other subjects, go directly to tutor interface
      console.log('Setting view to tutor for subject:', subject);
      setCurrentView('tutor');
    }
  };

  const handleAuthSuccess = () => {
    // Force re-render to show subject selector
    setCurrentView('auth');
    setSelectedSubject(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignOutFromLayout = () => {
    setCurrentView('auth');
    setSelectedSubject(null);
  };

  const handleBackToSubjects = () => {
    setCurrentView('auth');
    setSelectedSubject(null);
  };

  // If not authenticated, show auth form
  if (!user) {
    return (
      <AppLayout>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </AppLayout>
    );
  }

  // If authenticated but no subject selected, show subject selector
  if (!selectedSubject && currentView === 'auth') {
    return (
      <AppLayout onSignOut={handleSignOutFromLayout}>
        <SubjectSelector user={user} onSubjectSelect={handleSubjectSelect} />
      </AppLayout>
    );
  }

  // Show subject content based on current view
  return (
    <AppProvider>
      <AppNavigationBridge currentView={currentView} setCurrentView={setCurrentView}>
        <AppLayout onSignOut={handleSignOutFromLayout} onBackToSubjects={handleBackToSubjects}>
          {(() => {
            switch (currentView) {
              case 'dashboard':
                return <Dashboard />;
              case 'tutor':
                return <TutorInterface subject={selectedSubject || 'math'} />;
              case 'curriculum':
                return (
                  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">Curriculum Upload</h1>
                      <p className="text-gray-600">Feature coming soon...</p>
                    </div>
                  </div>
                );
              default:
                return <SubjectSelector user={user} onSubjectSelect={handleSubjectSelect} />;
            }
          })()}
        </AppLayout>
      </AppNavigationBridge>
    </AppProvider>
  );
};

// Bridge component to sync AppContext navigation with Index navigation
const AppNavigationBridge: React.FC<{ 
  children: React.ReactNode; 
  currentView: string; 
  setCurrentView: (view: 'auth' | 'dashboard' | 'tutor' | 'curriculum') => void;
}> = ({ children, currentView, setCurrentView }) => {
  const { currentView: appContextView } = useAppContext();
  
  React.useEffect(() => {
    if (appContextView !== currentView) {
      console.log('AppContext view changed to:', appContextView);
      setCurrentView(appContextView as 'auth' | 'dashboard' | 'tutor' | 'curriculum');
    }
  }, [appContextView, currentView, setCurrentView]);
  
  return <>{children}</>;
};

export default Index;


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
  const [localSelectedSubject, setLocalSelectedSubject] = useState<Subject | null>(null);
  const [currentView, setCurrentView] = useState<'auth' | 'dashboard' | 'tutor' | 'curriculum'>('auth');

  const handleSubjectSelect = (subjectId: string) => {
    console.log('Subject selected:', subjectId);
    const subject = subjectId as Subject;
    setLocalSelectedSubject(subject);
    
    // Always go to dashboard first to allow child management
    console.log('Setting view to dashboard for subject:', subject);
    setCurrentView('dashboard');
  };

  const handleAuthSuccess = () => {
    // Force re-render to show subject selector
    setCurrentView('auth');
    setLocalSelectedSubject(null);
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
    setLocalSelectedSubject(null);
  };

  const handleBackToSubjects = () => {
    setCurrentView('auth');
    setLocalSelectedSubject(null);
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
  if (!localSelectedSubject && currentView === 'auth') {
    return (
      <AppLayout onSignOut={handleSignOutFromLayout}>
        <SubjectSelector user={user} onSubjectSelect={handleSubjectSelect} />
      </AppLayout>
    );
  }

  // Show subject content based on current view
  return (
    <AppProvider>
      <SubjectSync selectedSubject={localSelectedSubject} />
      <AppLayout onSignOut={handleSignOutFromLayout} onBackToSubjects={handleBackToSubjects}>
        {(() => {
          switch (currentView) {
            case 'dashboard':
              return <Dashboard onStartLearning={() => setCurrentView('tutor')} />;
            case 'tutor':
              return <TutorContent />;
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
    </AppProvider>
  );
};

// Component to render tutor interface with proper subject from AppContext
const TutorContent: React.FC = () => {
  const { selectedSubject } = useAppContext();
  
  // Ensure we have a valid subject, fallback to 'math' if none selected
  const subject = (selectedSubject as Subject) || 'math';
  return <TutorInterface subject={subject} />;
};

// Sync selected subject with AppContext
const SubjectSync: React.FC<{ selectedSubject: Subject | null }> = ({ selectedSubject }) => {
  const { setSubject, clearSubject } = useAppContext();
  
  React.useEffect(() => {
    if (selectedSubject) {
      setSubject(selectedSubject);
    } else {
      clearSubject();
    }
  }, [selectedSubject, setSubject, clearSubject]);
  
  return null;
};

export default Index;

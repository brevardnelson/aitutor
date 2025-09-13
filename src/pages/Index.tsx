
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import AppLayout from '@/components/AppLayout';
import AuthForm from '@/components/auth/AuthForm';
import SubjectSelector from '@/components/SubjectSelector';
import Dashboard from '@/components/dashboard/Dashboard';
import TutorInterface from '@/components/tutor/TutorInterface';
import { AppProvider } from '@/contexts/AppContext';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { currentView, setView } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    if (subjectId === 'math') {
      setView('dashboard'); // Go to existing math dashboard
    }
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

  // If not authenticated, show auth form
  if (!user) {
    return (
      <AppLayout>
        <AuthForm onAuthSuccess={() => setView('auth')} />
      </AppLayout>
    );
  }

  // If authenticated but no subject selected, show subject selector
  if (!selectedSubject && currentView === 'auth') {
    return (
      <AppLayout>
        <SubjectSelector user={user} onSubjectSelect={handleSubjectSelect} />
      </AppLayout>
    );
  }

  // Show subject content based on current view
  return (
    <AppLayout>
      {(() => {
        switch (currentView) {
          case 'dashboard':
            return <Dashboard />;
          case 'tutor':
            return <TutorInterface />;
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
  );
};

const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;

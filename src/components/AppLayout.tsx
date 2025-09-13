import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import LoginForm from './auth/LoginForm';
import Dashboard from './dashboard/Dashboard';
import TutorInterface from './tutor/TutorInterface';

const AppLayout: React.FC = () => {
  const { currentView } = useAppContext();

  switch (currentView) {
    case 'auth':
      return <LoginForm />;
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
      return <LoginForm />;
  }
};

export default AppLayout;
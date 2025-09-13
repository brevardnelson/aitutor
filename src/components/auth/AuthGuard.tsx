// Authentication guard component

import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { RBACLoginForm } from './RBACLoginForm';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useRBAC();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return fallback || <RBACLoginForm />;
  }

  return <>{children}</>;
};

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default AuthGuard;
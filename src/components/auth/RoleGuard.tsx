// Role-based route guard component

import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import type { UserRole } from '@/types/auth';

interface RoleGuardProps {
  roles: UserRole[];
  schoolId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  roles,
  schoolId,
  fallback = <AccessDenied />,
  children,
}) => {
  const { hasAnyRole } = useRBAC();

  if (!hasAnyRole(roles, schoolId)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permissions: string[];
  schoolId?: number;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  schoolId,
  fallback = <AccessDenied />,
  children,
}) => {
  const { hasPermission } = useRBAC();

  const hasRequiredPermission = permissions.some(permission => 
    hasPermission(permission, schoolId)
  );

  if (!hasRequiredPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const AccessDenied: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this section.
        </p>
        <p className="text-sm text-gray-500">
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
};

export default RoleGuard;
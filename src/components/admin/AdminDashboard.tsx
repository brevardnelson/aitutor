// Main Admin Dashboard Component

import React, { useState } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { RoleGuard, PermissionGuard } from '@/components/auth/RoleGuard';
import { PERMISSIONS } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, School, GraduationCap, UserPlus, Building } from 'lucide-react';

import { SchoolManagement } from './SchoolManagement';
import { UserManagement } from './UserManagement';
import { SystemOverview } from './SystemOverview';

export const AdminDashboard: React.FC = () => {
  const { user, currentSchool, availableSchools, hasRole } = useRBAC();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return <div>Please sign in to continue.</div>;
  }

  const isSystemAdmin = hasRole('system_admin');
  const isSchoolAdmin = hasRole('school_admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {user.primaryRole.replace('_', ' ').toUpperCase()}
                </Badge>
                {currentSchool && (
                  <Badge variant="secondary">
                    {currentSchool.name}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Welcome, {user.full_name}</span>
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Overview
            </TabsTrigger>
            
            <RoleGuard roles={['system_admin']} fallback={null}>
              <TabsTrigger value="schools" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                Schools
              </TabsTrigger>
            </RoleGuard>

            <RoleGuard roles={['system_admin', 'school_admin']} fallback={null}>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </RoleGuard>

            <RoleGuard roles={['system_admin', 'school_admin', 'teacher']} fallback={null}>
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Classes
              </TabsTrigger>
            </RoleGuard>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <SystemOverview />
          </TabsContent>

          {/* Schools Tab (System Admin Only) */}
          <TabsContent value="schools">
            <RoleGuard roles={['system_admin']}>
              <SchoolManagement />
            </RoleGuard>
          </TabsContent>

          {/* Users Tab (System Admin, School Admin) */}
          <TabsContent value="users">
            <PermissionGuard permissions={[PERMISSIONS.MANAGE_TEACHERS, PERMISSIONS.MANAGE_PARENTS, PERMISSIONS.MANAGE_STUDENTS]}>
              <UserManagement />
            </PermissionGuard>
          </TabsContent>

          {/* Classes Tab (School Admin, Teachers) */}
          <TabsContent value="classes">
            <RoleGuard roles={['system_admin', 'school_admin', 'teacher']}>
              <div className="text-center py-12">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Class Management</h3>
                <p className="mt-1 text-gray-500">Coming soon - Manage classes and student assignments</p>
              </div>
            </RoleGuard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
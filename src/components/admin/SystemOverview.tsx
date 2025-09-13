// System Overview Dashboard Component

import React from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { School, Users, GraduationCap, BookOpen } from 'lucide-react';

export const SystemOverview: React.FC = () => {
  const { user, availableSchools, hasRole } = useRBAC();

  const isSystemAdmin = hasRole('system_admin');
  const isSchoolAdmin = hasRole('school_admin');

  // Mock data for now - in production, this would come from API
  const stats = {
    totalSchools: availableSchools.length || 0,
    totalUsers: 0,
    totalClasses: 0,
    totalStudents: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Caribbean AI Tutor Platform</CardTitle>
          <CardDescription>
            Multi-institutional learning management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">Signed in as:</p>
              <p className="font-medium">{user?.full_name}</p>
              <Badge variant="outline" className="mt-1">
                {user?.primaryRole.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {user?.roles && user.roles.length > 1 && (
              <div>
                <p className="text-sm text-gray-600">Additional roles:</p>
                <div className="flex gap-1 mt-1">
                  {user.roles.slice(1).map((role, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {role.role.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSystemAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Schools</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchools}</div>
              <p className="text-xs text-muted-foreground">
                Active institutions
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Teachers, parents, students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active classes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled learners
            </p>
          </CardContent>
        </Card>
      </div>

      {/* School Information */}
      {availableSchools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Schools</CardTitle>
            <CardDescription>
              Schools you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableSchools.map((school) => (
                <div key={school.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{school.name}</h4>
                    {school.address && (
                      <p className="text-sm text-gray-600">{school.address}</p>
                    )}
                  </div>
                  <Badge variant={school.isActive ? 'default' : 'secondary'}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Quick action buttons will be available here for common tasks like:
            </p>
            <ul className="mt-2 text-sm text-gray-400 space-y-1">
              <li>• Add new users</li>
              <li>• Create classes</li>
              <li>• Invite teachers</li>
              <li>• View system reports</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;
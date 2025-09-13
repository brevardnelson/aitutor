// User Management Component for Admins

import React, { useState } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Mail, Phone, GraduationCap, User } from 'lucide-react';
import type { UserRole } from '@/types/auth';

export const UserManagement: React.FC = () => {
  const { currentSchool, inviteUser, hasRole } = useRBAC();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('teachers');

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'teacher' as UserRole,
  });

  const isSystemAdmin = hasRole('system_admin');
  const isSchoolAdmin = hasRole('school_admin');

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError(null);

    try {
      const result = await inviteUser({
        ...inviteData,
        schoolId: currentSchool?.id,
      });

      if (result.success) {
        setSuccess(`Invitation sent to ${inviteData.email} as ${inviteData.role.replace('_', ' ')}`);
        setInviteData({ email: '', role: 'teacher' });
        setIsInviteDialogOpen(false);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsInviting(false);
    }
  };

  const handleInputChange = (field: keyof typeof inviteData, value: string) => {
    setInviteData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const availableRoles: { role: UserRole; label: string; description: string }[] = [
    { role: 'teacher', label: 'Teacher', description: 'Can manage classes and students' },
    { role: 'parent', label: 'Parent', description: 'Can manage their children' },
    { role: 'student', label: 'Student', description: 'Can access learning materials' },
  ];

  if (isSystemAdmin) {
    availableRoles.unshift(
      { role: 'school_admin', label: 'School Admin', description: 'Can manage the entire school' }
    );
  }

  // Mock user data for demonstration
  const mockUsers = {
    teachers: [],
    parents: [],
    students: [],
  };

  const renderUserList = (userType: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </CardTitle>
        <CardDescription>
          Manage {userType} in {currentSchool?.name || 'your school'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No {userType}</h3>
          <p className="mt-1 text-gray-500">
            Invite {userType} to get started
          </p>
          <Button 
            className="mt-4" 
            onClick={() => {
              setInviteData(prev => ({
                ...prev,
                role: userType === 'teachers' ? 'teacher' : 
                      userType === 'parents' ? 'parent' : 'student'
              }));
              setIsInviteDialogOpen(true);
            }}
          >
            Invite {userType.slice(0, -1)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (!currentSchool && !isSystemAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No School Selected</h3>
          <p className="mt-1 text-gray-500">
            Please select a school to manage users
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
          <p className="text-gray-600">
            Manage users in {currentSchool?.name || 'the system'}
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleInviteUser}>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {currentSchool?.name || 'the platform'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    disabled={isInviting}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-role">Role *</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                    disabled={isInviting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(({ role, label, description }) => (
                        <SelectItem key={role} value={role}>
                          <div>
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-gray-500">{description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting || !inviteData.email}>
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {success && (
        <Alert>
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* User Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teachers" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="parents" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Parents
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          {renderUserList('teachers', <GraduationCap className="h-5 w-5" />)}
        </TabsContent>

        <TabsContent value="parents">
          {renderUserList('parents', <User className="h-5 w-5" />)}
        </TabsContent>

        <TabsContent value="students">
          {renderUserList('students', <Users className="h-5 w-5" />)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
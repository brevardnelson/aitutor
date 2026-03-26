// User Management Component for Admins

import React, { useState, useEffect } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { rbacAuthAPI, AdminUser } from '@/lib/rbac-auth-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Mail, GraduationCap, User, Loader2, AlertCircle } from 'lucide-react';
import type { UserRole } from '@/types/auth';

const ROLE_COLORS: Record<string, string> = {
  system_admin: 'bg-red-100 text-red-800',
  school_admin: 'bg-purple-100 text-purple-800',
  teacher: 'bg-blue-100 text-blue-800',
  parent: 'bg-green-100 text-green-800',
  student: 'bg-yellow-100 text-yellow-800',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function RoleBadge({ role }: { role: string }) {
  const colorClass = ROLE_COLORS[role] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {role.replace(/_/g, ' ')}
    </span>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  const activeRoles = user.roles.filter(r => r.isActive);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 font-semibold text-sm">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3 flex-wrap justify-end">
        {activeRoles.length > 0
          ? activeRoles.map(r => <RoleBadge key={r.role} role={r.role} />)
          : <RoleBadge role="no role" />}
        <span className="text-xs text-gray-400 hidden sm:block ml-1">{formatDate(user.createdAt)}</span>
      </div>
    </div>
  );
}

function UserList({
  users,
  roleFilter,
  emptyLabel,
  icon,
  schoolName,
  onInvite,
}: {
  users: AdminUser[];
  roleFilter: string | null;
  emptyLabel: string;
  icon: React.ReactNode;
  schoolName: string;
  onInvite: () => void;
}) {
  const filtered = roleFilter
    ? users.filter(u => u.roles.some(r => r.role === roleFilter && r.isActive))
    : users;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {emptyLabel}s
          <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
        </CardTitle>
        <CardDescription>All {emptyLabel.toLowerCase()}s in {schoolName}</CardDescription>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No {emptyLabel.toLowerCase()}s yet</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={onInvite}>
              <Plus className="h-4 w-4 mr-1" />
              Invite {emptyLabel}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(u => <UserRow key={u.id} user={u} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const UserManagement: React.FC = () => {
  const { currentSchool, inviteUser, hasRole } = useRBAC();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'teacher' as UserRole,
  });

  const isSystemAdmin = hasRole('system_admin');
  const isSchoolAdmin = hasRole('school_admin');

  useEffect(() => {
    async function loadUsers() {
      setIsLoading(true);
      setFetchError(null);
      try {
        let result;
        if (isSystemAdmin) {
          result = await rbacAuthAPI.getUsers();
        } else if (isSchoolAdmin && currentSchool?.id) {
          result = await rbacAuthAPI.getSchoolUsers(currentSchool.id);
        } else {
          setFetchError('No school selected or insufficient permissions');
          setIsLoading(false);
          return;
        }

        if (result.success && result.users) {
          setUsers(result.users);
        } else {
          setFetchError(result.error || 'Failed to load users');
        }
      } catch {
        setFetchError('Unexpected error loading users');
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, [isSystemAdmin, isSchoolAdmin, currentSchool?.id]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError(null);

    try {
      const result = await inviteUser({
        ...inviteData,
        schoolId: currentSchool?.id,
      });

      if (result.success) {
        setInviteSuccess(`Invitation sent to ${inviteData.email} as ${inviteData.role.replace('_', ' ')}`);
        setInviteData({ email: '', role: 'teacher' });
        setIsInviteDialogOpen(false);
      } else {
        setInviteError(result.error || 'Failed to send invitation');
      }
    } catch {
      setInviteError('An unexpected error occurred');
    } finally {
      setIsInviting(false);
    }
  };

  const availableRoles: { role: UserRole; label: string; description: string }[] = [
    { role: 'teacher', label: 'Teacher', description: 'Can manage classes and students' },
    { role: 'parent', label: 'Parent', description: 'Can manage their children' },
    { role: 'student', label: 'Student', description: 'Can access learning materials' },
  ];
  if (isSystemAdmin) {
    availableRoles.unshift({ role: 'school_admin', label: 'School Admin', description: 'Can manage the entire school' });
  }

  const schoolName = currentSchool?.name || (isSystemAdmin ? 'the system' : 'your school');

  if (!currentSchool && !isSystemAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No School Selected</h3>
          <p className="mt-1 text-gray-500">Please select a school to manage users</p>
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
          <p className="text-gray-600">Manage users in {schoolName}</p>
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
                {inviteError && (
                  <Alert variant="destructive">
                    <AlertDescription>{inviteError}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address *</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={inviteData.email}
                    onChange={e => { setInviteData(prev => ({ ...prev, email: e.target.value })); setInviteError(null); }}
                    required
                    disabled={isInviting}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-role">Role *</Label>
                  <Select
                    value={inviteData.role}
                    onValueChange={value => setInviteData(prev => ({ ...prev, role: value as UserRole }))}
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
                <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)} disabled={isInviting}>
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
      {inviteSuccess && (
        <Alert>
          <AlertDescription className="text-green-800">{inviteSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Loading / Error */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-3 text-gray-500">Loading users…</span>
        </div>
      ) : fetchError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UserList
              users={users}
              roleFilter={null}
              emptyLabel="User"
              icon={<Users className="h-5 w-5" />}
              schoolName={schoolName}
              onInvite={() => setIsInviteDialogOpen(true)}
            />
          </TabsContent>

          <TabsContent value="teachers">
            <UserList
              users={users}
              roleFilter="teacher"
              emptyLabel="Teacher"
              icon={<GraduationCap className="h-5 w-5" />}
              schoolName={schoolName}
              onInvite={() => { setInviteData(prev => ({ ...prev, role: 'teacher' })); setIsInviteDialogOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="parents">
            <UserList
              users={users}
              roleFilter="parent"
              emptyLabel="Parent"
              icon={<User className="h-5 w-5" />}
              schoolName={schoolName}
              onInvite={() => { setInviteData(prev => ({ ...prev, role: 'parent' })); setIsInviteDialogOpen(true); }}
            />
          </TabsContent>

          <TabsContent value="students">
            <UserList
              users={users}
              roleFilter="student"
              emptyLabel="Student"
              icon={<Users className="h-5 w-5" />}
              schoolName={schoolName}
              onInvite={() => { setInviteData(prev => ({ ...prev, role: 'student' })); setIsInviteDialogOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default UserManagement;

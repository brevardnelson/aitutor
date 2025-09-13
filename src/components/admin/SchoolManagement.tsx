// School Management Component for System Admins

import React, { useState } from 'react';
import { useRBAC } from '@/contexts/RBACContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Building as SchoolIcon, MapPin, Phone, Mail } from 'lucide-react';
import type { School } from '@/types/auth';

export const SchoolManagement: React.FC = () => {
  const { availableSchools, createSchool, refreshSchools } = useRBAC();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const result = await createSchool(newSchool);
      if (result.success) {
        setSuccess(`School "${newSchool.name}" created successfully!`);
        setNewSchool({ name: '', address: '', phone: '', email: '' });
        setIsCreateDialogOpen(false);
        await refreshSchools();
      } else {
        setError(result.error || 'Failed to create school');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: keyof typeof newSchool, value: string) => {
    setNewSchool(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">School Management</h2>
          <p className="text-gray-600">Manage schools across the platform</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateSchool}>
              <DialogHeader>
                <DialogTitle>Create New School</DialogTitle>
                <DialogDescription>
                  Add a new school to the platform
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="school-name">School Name *</Label>
                  <Input
                    id="school-name"
                    value={newSchool.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    disabled={isCreating}
                    placeholder="Enter school name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-address">Address</Label>
                  <Input
                    id="school-address"
                    value={newSchool.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={isCreating}
                    placeholder="Enter school address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-phone">Phone</Label>
                  <Input
                    id="school-phone"
                    type="tel"
                    value={newSchool.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={isCreating}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school-email">Email</Label>
                  <Input
                    id="school-email"
                    type="email"
                    value={newSchool.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isCreating}
                    placeholder="Enter school email"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !newSchool.name}>
                  {isCreating ? 'Creating...' : 'Create School'}
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

      {/* Schools List */}
      {availableSchools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableSchools.map((school) => (
            <Card key={school.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <SchoolIcon className="h-5 w-5" />
                    {school.name}
                  </CardTitle>
                  <Badge variant={school.isActive ? 'default' : 'secondary'}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {school.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {school.address}
                  </div>
                )}
                {school.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    {school.phone}
                  </div>
                )}
                {school.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {school.email}
                  </div>
                )}
                
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Manage Users
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <SchoolIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Schools</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first school</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Create School
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchoolManagement;
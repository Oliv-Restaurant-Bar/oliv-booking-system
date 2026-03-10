'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Search, MoreVertical, Edit2, Trash2, Plus, X, Check, Users, Eye, RefreshCw, Download } from 'lucide-react';
import { Modal } from '../user/Modal';
import { ConfirmationModal } from '../user/ConfirmationModal';
import { Button } from '../user/Button';
import { StatusDropdown } from './StatusDropdown';
import { Input } from '@/components/ui/input';
import { ValidatedInput } from '@/components/ui/validated-input';
import { SkeletonTable } from '@/components/ui/skeleton-loaders';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { canModifyUser } from '@/lib/auth/rbac';
import { userNameSchema, userEmailSchema, userPasswordSchema } from '@/lib/validation/schemas';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'read_only';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export function UserManagementPage({ currentUser }: { currentUser: any }) {
  const [users, setUsers] = useState<User[]>([]);

  // Robust check for super_admin role - handle both direct user object and session object
  const user = currentUser?.user || currentUser;
  const isSuperAdmin = user?.role === 'super_admin' || user?.metadata?.role === 'super_admin';
  const currentUserId = user?.id; // Get current user ID for comparison
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('read_only');
  const [formStatus, setFormStatus] = useState<User['status']>('Active');
  const [formPassword, setFormPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  // Role options for dropdown (matching schema roles)
  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin', icon: Shield },
    { value: 'admin', label: 'Admin', icon: User },
    { value: 'moderator', label: 'Moderator', icon: Users },
    { value: 'read_only', label: 'Read Only', icon: Eye },
  ];

  // Status options for dropdown
  const statusOptions = [
    { value: 'Active', label: 'Active', dotColor: '#10b981' },
    { value: 'Inactive', label: 'Inactive', dotColor: '#ef4444' },
  ];

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('read_only');
    setFormStatus('Active');
    setFormPassword('');
    setErrors({});
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate name
    const nameResult = userNameSchema.safeParse(formName);
    if (!nameResult.success) {
      newErrors.name = nameResult.error.errors[0].message;
    }

    // Validate email
    const emailResult = userEmailSchema.safeParse(formEmail);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Validate password only if provided
    if (formPassword) {
      const passwordResult = userPasswordSchema.safeParse(formPassword);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add user
  const handleAddUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          password: formPassword || 'defaultPassword123',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      await fetchUsers();
      toast.success('User added successfully');
      setIsAddUserModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error adding user:', err);
      toast.error(err.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);

    // Show helpful message for self-edit
    if (user.id === currentUserId) {
      toast.info('You can edit your profile information, but cannot change your role or status.');
    }

    setIsEditUserModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedUser) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          emailVerified: formStatus === 'Active',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      await fetchUsers();
      toast.success('User updated successfully');
      setIsEditUserModalOpen(false);
      resetForm();
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      await fetchUsers();
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'bg-primary/10 text-primary';
      case 'admin':
        return 'bg-secondary/10 text-secondary';
      case 'moderator':
        return 'bg-accent text-accent-foreground';
      case 'read_only':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: User['role']) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      case 'read_only':
        return 'Read Only';
      default:
        return role;
    }
  };

  const getStatusBadgeColor = (status: User['status']) => {
    return status === 'Active'
      ? 'bg-green-50 text-green-700'
      : 'bg-red-50 text-red-700';
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="w-full flex-1">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => {
                  const excelData = filteredUsers.map(user => ({
                    'Name': user.name,
                    'Email': user.email,
                    'Role': getRoleLabel(user.role),
                    'Status': user.status,
                    'Created At': new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                  }));

                  // Create worksheet
                  const worksheet = XLSX.utils.json_to_sheet(excelData);

                  // Create workbook
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

                  // Generate and download file
                  XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
                className="sm:w-auto"
              >
                Export
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="sm:w-auto"
                >
                  Add User
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={fetchUsers}
                disabled={loading}
                className="sm:w-auto"
                title="Refresh"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1">
              <SkeletonTable rows={10} columns={5} hasActions />
            </div>
          )}

        {/* Users Table */}
        {!loading && (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-foreground hidden md:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Role
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden sm:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Created
                    </th>
                    {isSuperAdmin && (
                      <th className="text-right px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                          No users found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getRoleBadgeColor(user.role)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                            <Shield className="w-3.5 h-3.5" />
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`inline-flex px-3 py-1 rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-base)' }}>
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        {/* Actions column - show edit/delete based on permissions */}
                        {(isSuperAdmin || user.id === currentUserId) && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit button - always show for own profile */}
                              <button
                                onClick={() => handleEditClick(user)}
                                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                title={user.id === currentUserId ? "Edit my profile" : "Edit user"}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete button - never show for own profile, only for super_admins on other users */}
                              {isSuperAdmin && user.id !== currentUserId && (
                                <button
                                  onClick={() => handleDeleteClick(user)}
                                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          resetForm();
        }}
        icon={Users}
        title="Add New User"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => {
              setIsAddUserModalOpen(false);
              resetForm();
              setError(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleAddUser}
              disabled={!formName.trim() || !formEmail.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <ValidatedInput
            label="Name"
            type="text"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="Enter full name"
            maxLength={50}
            showCharacterCount
            error={errors.name}
            required
          />

          <ValidatedInput
            label="Email"
            type="email"
            value={formEmail}
            onChange={(e) => {
              setFormEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="user@restaurant.com"
            maxLength={255}
            showCharacterCount
            error={errors.email}
            helperText="Must be a valid email address"
            required
          />

          <ValidatedInput
            label="Password (optional - will use default if empty)"
            type="password"
            value={formPassword}
            onChange={(e) => {
              setFormPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            placeholder="Enter password"
            maxLength={100}
            showCharacterCount
            error={errors.password}
            helperText="Min. 8 characters"
            showPasswordToggle
          />

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Role
            </label>
            <StatusDropdown
              options={roleOptions}
              value={formRole}
              onChange={(value) => setFormRole(value as User['role'])}
              placeholder="Select role"
              className="w-full"
            />
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          resetForm();
          setSelectedUser(null);
        }}
        icon={Edit2}
        title={selectedUser?.id === currentUserId ? "Edit My Profile" : "Edit User"}
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => {
              setIsEditUserModalOpen(false);
              resetForm();
              setSelectedUser(null);
              setError(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Check}
              onClick={handleSaveEdit}
              disabled={!formName.trim() || !formEmail.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <ValidatedInput
            label="Name"
            type="text"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: undefined });
            }}
            placeholder="Enter full name"
            maxLength={50}
            showCharacterCount
            error={errors.name}
            required
          />

          <ValidatedInput
            label="Email"
            type="email"
            value={formEmail}
            onChange={(e) => {
              setFormEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="user@restaurant.com"
            maxLength={255}
            showCharacterCount
            error={errors.email}
            helperText="Must be a valid email address"
            required
          />

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Role
            </label>
            <StatusDropdown
              options={roleOptions}
              value={formRole}
              onChange={(value) => setFormRole(value as User['role'])}
              placeholder="Select role"
              className="w-full"
              disabled={selectedUser?.id === currentUserId} // Disable role change for own profile
            />
            {selectedUser?.id === currentUserId && (
              <p className="text-xs text-muted-foreground mt-1">You cannot change your own role</p>
            )}
          </div>

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Status
            </label>
            <StatusDropdown
              options={statusOptions}
              value={formStatus}
              onChange={(value) => setFormStatus(value as User['status'])}
              placeholder="Select status"
              className="w-full"
              disabled={selectedUser?.id === currentUserId} // Disable status change for own profile
            />
            {selectedUser?.id === currentUserId && (
              <p className="text-xs text-muted-foreground mt-1">You cannot deactivate your own account</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        confirmText={isSubmitting ? 'Deleting...' : 'Delete User'}
        confirmIcon="delete"
      />
    </div>
  );
}

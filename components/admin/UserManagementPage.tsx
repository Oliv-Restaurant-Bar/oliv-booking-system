'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { userFirstNameSchema, userLastNameSchema, userEmailSchema, userPasswordSchema } from '@/lib/validation/schemas';
import { useTranslation as useGenericTranslation, useCommonTranslation, useButtonTranslation, useMessageTranslation } from '@/lib/i18n/client';
import { useLocale } from 'next-intl';
import { formatDateWithLocale } from '@/lib/utils/date';
import { useSystemTimezone } from '@/lib/hooks/useSystemTimezone';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'read_only';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export function UserManagementPage({ currentUser }: { currentUser: any }) {
  // Translation hooks
  const t = useGenericTranslation('user');
  const commonT = useCommonTranslation();
  const buttonT = useButtonTranslation();
  const messageT = useMessageTranslation();
  const locale = useLocale();
  const { timezone } = useSystemTimezone();

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
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('read_only');
  const [formStatus, setFormStatus] = useState<User['status']>('Active');
  const [formPassword, setFormPassword] = useState('');

  // Touched fields for real-time validation
  const [touched, setTouched] = useState<{
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    password?: boolean;
  }>({});

  // Validation errors
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  }>({});

  const getRoleLabel = (role: User['role']) => {
    try {
      return t(`roles.${role}`);
    } catch {
      return role;
    }
  };

  const getStatusLabel = (status: User['status']) => {
    try {
      return t(`status.${status.toLowerCase()}`);
    } catch {
      return status;
    }
  };

  // Role options for dropdown (matching schema roles)
  const roleOptions = [
    { value: 'super_admin', label: getRoleLabel('super_admin'), icon: Shield },
    { value: 'admin', label: getRoleLabel('admin'), icon: User },
    { value: 'moderator', label: getRoleLabel('moderator'), icon: Users },
    { value: 'read_only', label: getRoleLabel('read_only'), icon: Eye },
  ];

  // Status options for dropdown
  const statusOptions = [
    { value: 'Active', label: getStatusLabel('Active'), dotColor: '#10b981' },
    { value: 'Inactive', label: getStatusLabel('Inactive'), dotColor: '#ef4444' },
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
      setError(t('toast.failedToLoad'));
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
  ).sort((a, b) => {
    // Sort current user to the top
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    // Otherwise maintain original order
    return 0;
  });

  // Real-time validation errors for touched fields
  const realtimeErrors = useMemo(() => {
    const newErrors: typeof errors = {};

    if (touched.firstName) {
      const firstNameResult = userFirstNameSchema.safeParse(formFirstName);
      if (!firstNameResult.success) newErrors.firstName = firstNameResult.error.errors[0].message;
    }

    if (touched.lastName) {
      const lastNameResult = userLastNameSchema.safeParse(formLastName);
      if (!lastNameResult.success) newErrors.lastName = lastNameResult.error.errors[0].message;
    }

    if (touched.email) {
      const emailResult = userEmailSchema.safeParse(formEmail);
      if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    }

    if (touched.password && formPassword) {
      const passwordResult = userPasswordSchema.safeParse(formPassword);
      if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    }

    return newErrors;
  }, [touched, formFirstName, formLastName, formEmail, formPassword]);

  // Merge real-time errors with submit errors (submit errors take precedence)
  const displayErrors = useMemo(() => {
    return { ...realtimeErrors, ...errors };
  }, [realtimeErrors, errors]);

  // Reset form
  const resetForm = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormRole('read_only');
    setFormStatus('Active');
    setFormPassword('');
    setErrors({});
    setTouched({});
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Validate first name
    const firstNameResult = userFirstNameSchema.safeParse(formFirstName);
    if (!firstNameResult.success) {
      newErrors.firstName = firstNameResult.error.errors[0].message;
    }

    // Validate last name
    const lastNameResult = userLastNameSchema.safeParse(formLastName);
    if (!lastNameResult.success) {
      newErrors.lastName = lastNameResult.error.errors[0].message;
    }

    // Validate email
    const emailResult = userEmailSchema.safeParse(formEmail);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Validate password
    if (formPassword || !selectedUser) { // Always required for new users, optional for existing unless provided
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
      const fullName = `${formFirstName.trim()} ${formLastName.trim()}`;
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: formEmail.trim(),
          role: formRole,
          password: formPassword.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      await fetchUsers();
      toast.success(t('toast.userAdded'));
      setIsAddUserModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error adding user:', err);
      toast.error(err.message || t('toast.failedToAdd'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);

    // Split name into first and last name
    const nameParts = user.name.split(' ');
    setFormFirstName(nameParts[0] || '');
    setFormLastName(nameParts.slice(1).join(' ') || '');

    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);

    // Show helpful message for self-edit
    if (user.id === currentUserId) {
      toast.info(t('restrictions.editOwnProfileInfo'));
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
      const fullName = `${formFirstName.trim()} ${formLastName.trim()}`;
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
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
      toast.success(t('toast.userUpdated'));
      setIsEditUserModalOpen(false);
      resetForm();
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast.error(err.message || t('toast.failedToUpdate'));
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
      toast.success(t('toast.userDeleted'));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || t('toast.failedToDelete'));
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
                placeholder={t('searchPlaceholder')}
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
                    [commonT('name')]: user.name,
                    [commonT('email')]: user.email,
                    [t('userRole')]: getRoleLabel(user.role),
                    [commonT('status')]: getStatusLabel(user.status),
                    [t('createdAt')]: formatDateWithLocale(user.createdAt, locale, { year: 'numeric', month: 'short', day: 'numeric' }, timezone),
                  }));

                  // Create worksheet
                  const worksheet = XLSX.utils.json_to_sheet(excelData);

                  // Create workbook
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, t('title'));

                  // Generate and download file
                  XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
                }}
                className="sm:w-auto"
              >
                {commonT('export')}
              </Button>
              {isSuperAdmin && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="sm:w-auto"
                >
                  {t('addNewUser')}
                </Button>
              )}
              {/* <Button
                variant="secondary"
                onClick={fetchUsers}
                disabled={loading}
                className="sm:w-auto"
                title={commonT('refresh')}
              >
                {commonT('refresh')}
              </Button> */}
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
                      {commonT('name')}
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {commonT('email')}
                    </th>
                    <th className="text-left px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {t('userRole')}
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden sm:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {commonT('status')}
                    </th>
                    <th className="text-left px-4 py-3 text-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {t('createdAt')}
                    </th>
                    <th className="text-center px-4 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {commonT('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                          {t('noUsersFound')}
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
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} title={user.name}>
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }} title={user.email}>
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getRoleBadgeColor(user.role)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }} title={getRoleLabel(user.role)}>
                            <Shield className="w-3.5 h-3.5" />
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`inline-flex px-3 py-1 rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }} title={getStatusLabel(user.status)}>
                            {getStatusLabel(user.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground hidden lg:table-cell" style={{ fontSize: 'var(--text-base)' }}>
                          {formatDateWithLocale(user.createdAt, locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }, timezone)}
                        </td>
                        {/* Actions column - show edit/delete based on permissions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit button - always show for own profile */}
                            <button
                              onClick={() => handleEditClick(user)}
                              disabled={user.id !== currentUserId && !isSuperAdmin}
                              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                              title={user.id === currentUserId ? t('editMyProfile') : t('editUser')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete button - never show for own profile, only for super_admins on other users */}
                            {isSuperAdmin && user.id !== currentUserId && (
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                                disabled={user.id !== currentUserId && !isSuperAdmin}
                                title={t('deleteUser')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
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
        title={t('addNewUser')}
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => {
              setIsAddUserModalOpen(false);
              resetForm();
              setError(null);
            }}>
              {buttonT('cancel')}
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleAddUser}
              disabled={!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || !formPassword.trim() || isSubmitting}
            >
              {isSubmitting ? t('adding') : t('addUser')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label={t('firstName')}
              type="text"
              value={formFirstName}
              onChange={(e) => {
                setFormFirstName(e.target.value);
                if (errors.firstName) setErrors({ ...errors, firstName: undefined });
              }}
              onBlur={() => {
                if (!touched.firstName) setTouched({ ...touched, firstName: true });
              }}
              placeholder={t('placeholders.firstName')}
              maxLength={20}
              showCharacterCount
              error={displayErrors.firstName}
              helperText={t('characterLimits.firstName')}
              required
            />

            <ValidatedInput
              label={t('lastName')}
              type="text"
              value={formLastName}
              onChange={(e) => {
                setFormLastName(e.target.value);
                if (errors.lastName) setErrors({ ...errors, lastName: undefined });
              }}
              onBlur={() => {
                if (!touched.lastName) setTouched({ ...touched, lastName: true });
              }}
              placeholder={t('placeholders.lastName')}
              maxLength={20}
              showCharacterCount
              error={displayErrors.lastName}
              helperText={t('characterLimits.lastName')}
              required
            />
          </div>

          <ValidatedInput
            label={t('email')}
            type="email"
            value={formEmail}
            onChange={(e) => {
              setFormEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            onBlur={() => {
              if (!touched.email) setTouched({ ...touched, email: true });
            }}
            placeholder={t('placeholders.email')}
            maxLength={255}
            showCharacterCount
            error={displayErrors.email}
            helperText={t('characterLimits.email')}
            required
          />

          <ValidatedInput
            label={t('password')}
            type="password"
            value={formPassword}
            onChange={(e) => {
              setFormPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            onBlur={() => {
              if (!touched.password) setTouched({ ...touched, password: true });
            }}
            placeholder={t('placeholders.password')}
            maxLength={100}
            showCharacterCount
            error={displayErrors.password}
            helperText={t('characterLimits.password')}
            showPasswordToggle
            required
          />

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('userRole')}
            </label>
            <StatusDropdown
              options={roleOptions}
              value={formRole}
              onChange={(value) => setFormRole(value as User['role'])}
              placeholder={commonT('select')}
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
        title={selectedUser?.id === currentUserId ? t('editMyProfile') : t('editUser')}
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => {
              setIsEditUserModalOpen(false);
              resetForm();
              setSelectedUser(null);
              setError(null);
            }}>
              {buttonT('cancel')}
            </Button>
            <Button
              variant="primary"
              icon={Check}
              onClick={handleSaveEdit}
              disabled={!formFirstName.trim() || !formLastName.trim() || !formEmail.trim() || isSubmitting}
            >
              {isSubmitting ? t('saving') : t('saveChanges')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label={t('firstName')}
              type="text"
              value={formFirstName}
              onChange={(e) => {
                setFormFirstName(e.target.value);
                if (errors.firstName) setErrors({ ...errors, firstName: undefined });
              }}
              onBlur={() => {
                if (!touched.firstName) setTouched({ ...touched, firstName: true });
              }}
              placeholder={t('placeholders.firstName')}
              maxLength={20}
              showCharacterCount
              error={displayErrors.firstName}
              helperText={t('characterLimits.firstName')}
              required
            />

            <ValidatedInput
              label={t('lastName')}
              type="text"
              value={formLastName}
              onChange={(e) => {
                setFormLastName(e.target.value);
                if (errors.lastName) setErrors({ ...errors, lastName: undefined });
              }}
              onBlur={() => {
                if (!touched.lastName) setTouched({ ...touched, lastName: true });
              }}
              placeholder={t('placeholders.lastName')}
              maxLength={20}
              showCharacterCount
              error={displayErrors.lastName}
              helperText={t('characterLimits.lastName')}
              required
            />
          </div>

          <ValidatedInput
            label={t('email')}
            type="email"
            value={formEmail}
            onChange={(e) => {
              setFormEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            onBlur={() => {
              if (!touched.email) setTouched({ ...touched, email: true });
            }}
            placeholder={t('placeholders.email')}
            maxLength={255}
            showCharacterCount
            error={displayErrors.email}
            helperText={t('characterLimits.email')}
            required
          />

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('userRole')}
            </label>
            <StatusDropdown
              options={roleOptions}
              value={formRole}
              onChange={(value) => setFormRole(value as User['role'])}
              placeholder={commonT('select')}
              className="w-full"
              disabled={selectedUser?.id === currentUserId} // Disable role change for own profile
            />
            {selectedUser?.id === currentUserId && (
              <p className="text-xs text-muted-foreground mt-1">{t('restrictions.cannotChangeOwnRole')}</p>
            )}
          </div>

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('userStatus')}
            </label>
            <StatusDropdown
              options={statusOptions}
              value={formStatus}
              onChange={(value) => setFormStatus(value as User['status'])}
              placeholder={commonT('select')}
              className="w-full"
              disabled={selectedUser?.id === currentUserId} // Disable status change for own profile
            />
            {selectedUser?.id === currentUserId && (
              <p className="text-xs text-muted-foreground mt-1">{t('restrictions.cannotDeactivateSelf')}</p>
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
        title={`${t('deleteUser')}: ${selectedUser?.name}`}
        message={messageT('deleteConfirm')}
        confirmText={isSubmitting ? t('saving') : t('deleteUser')}
        confirmIcon="delete"
      />
    </div>
  );
}

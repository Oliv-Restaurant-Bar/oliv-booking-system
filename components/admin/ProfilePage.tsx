'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Shield, Camera, Lock, Check, X, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { ValidatedInput } from '@/components/ui/validated-input';
import { changePassword } from '@/lib/actions/auth';
import { toast } from 'sonner';
import type { Session } from '@/lib/auth';
import { userFirstNameSchema, userLastNameSchema, userEmailSchema, userPhoneSchema, userPasswordSchema } from '@/lib/validation/schemas';

interface SessionWithRole extends Session {
  user: Session['user'] & {
    role: string;
  };
}

interface ProfilePageProps {
  session: Session;
}

export function ProfilePage({ session }: ProfilePageProps) {
  // Cast session to include role
  const sessionWithRole = session as SessionWithRole;

  // Split name into first and last name
  const nameParts = sessionWithRole.user.name?.split(' ') || ['', ''];

  // Profile state - initialize with session data
  const [profileData, setProfileData] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: sessionWithRole.user.email || '',
    phone: '', // Phone field not in database schema
    role: sessionWithRole.user.role || 'admin',
    avatar: sessionWithRole.user.image || '',
  });

  // Update profile data when session changes
  useEffect(() => {
    const nameParts = sessionWithRole.user.name?.split(' ') || ['', ''];
    setProfileData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: sessionWithRole.user.email || '',
      phone: profileData.phone, // Preserve phone number if set
      role: sessionWithRole.user.role || 'admin',
      avatar: sessionWithRole.user.image || '',
    });
  }, [sessionWithRole.user.name, sessionWithRole.user.email, sessionWithRole.user.role, sessionWithRole.user.image]);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    email: profileData.email,
    phone: profileData.phone,
  });

  // Track if form has been modified
  const [hasChanges, setHasChanges] = useState(false);

  // Loading state for profile save
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password change state
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [profileErrors, setProfileErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});

  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Check if form values differ from original profile data
  const hasFormChanged = () => {
    return (
      editForm.firstName !== profileData.firstName ||
      editForm.lastName !== profileData.lastName ||
      editForm.email !== profileData.email ||
      editForm.phone !== profileData.phone
    );
  };

  // Update hasChanges when editForm or profileData changes
  useEffect(() => {
    setHasChanges(hasFormChanged());
  }, [editForm, profileData]);

  // Format role for display
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleEditProfile = () => {
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
    });
    setProfileErrors({});
    setHasChanges(false);
    setIsEditProfileModalOpen(true);
  };

  const validateProfileForm = () => {
    const newErrors: typeof profileErrors = {};

    // Validate first name
    const firstNameResult = userFirstNameSchema.safeParse(editForm.firstName);
    if (!firstNameResult.success) {
      newErrors.firstName = firstNameResult.error.errors[0].message;
    }

    // Validate last name
    const lastNameResult = userLastNameSchema.safeParse(editForm.lastName);
    if (!lastNameResult.success) {
      newErrors.lastName = lastNameResult.error.errors[0].message;
    }

    // Validate email
    const emailResult = userEmailSchema.safeParse(editForm.email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Validate phone (optional)
    if (editForm.phone) {
      const phoneResult = userPhoneSchema.safeParse(editForm.phone);
      if (!phoneResult.success) {
        newErrors.phone = phoneResult.error.errors[0].message;
      }
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);

    try {
      // Call API to update profile
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const result = await response.json();

      // Update local state with saved data
      setProfileData({
        ...profileData,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
      });

      // Update session user name as well
      sessionWithRole.user.name = `${editForm.firstName.trim()} ${editForm.lastName.trim()}`.trim();

      setIsEditProfileModalOpen(false);
      toast.success(result.message || 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    // Clear previous messages
    const newErrors: typeof passwordErrors = {};
    setPasswordErrors(newErrors);
    setPasswordSuccess(false);

    // Validate current password not empty
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    const newPasswordResult = userPasswordSchema.safeParse(passwordForm.newPassword);
    if (!newPasswordResult.success) {
      newErrors.newPassword = newPasswordResult.error.errors[0].message;
    } else if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    }

    // Validate confirm password matches
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    } else if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({});
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
      console.error('Password change error:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-4 md:pt-6 pb-1 flex flex-col">
      <div className="w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col items-center">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden" style={{ fontSize: '48px', fontWeight: 'var(--font-weight-semibold)' }}>
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(profileData.firstName, profileData.lastName)
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-4 border-card hover:bg-primary transition-colors"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name and Role */}
              <h3 className="text-foreground text-center mb-1" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                {profileData.firstName} {profileData.lastName}
              </h3>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-primary" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
                  {formatRole(profileData.role)}
                </span>
              </div>

              {/* Contact Information */}
              <div className="w-full space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>
                      Email
                    </p>
                    <p className="text-foreground break-words" style={{ fontSize: 'var(--text-base)' }}>
                      {profileData.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>
                      Phone
                    </p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      {profileData.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={handleEditProfile}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                <User className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Change Password */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Change Password
                </h3>
              </div>

              <div className="space-y-4">
                <ValidatedInput
                  label="Current Password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value });
                    if (passwordErrors.currentPassword) setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
                  }}
                  placeholder="Enter current password"
                  error={passwordErrors.currentPassword}
                  showPasswordToggle
                  required
                />

                <ValidatedInput
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                    if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: undefined });
                  }}
                  placeholder="Enter new password"
                  maxLength={100}
                  showCharacterCount
                  error={passwordErrors.newPassword}
                  helperText="Min. 8 characters"
                  showPasswordToggle
                  required
                />

                <ValidatedInput
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => {
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value });
                    if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
                  }}
                  placeholder="Confirm new password"
                  error={passwordErrors.confirmPassword}
                  showPasswordToggle
                  required
                />

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-transparent rounded-full animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Copyright Footer */}
      <div className="text-center pt-8 pb-1 mt-auto">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        icon={User}
        title="Edit Profile"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => setIsEditProfileModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={isSavingProfile ? undefined : Check}
              onClick={handleSaveProfile}
              disabled={!hasChanges || isSavingProfile}
              className={!hasChanges || isSavingProfile ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSavingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ValidatedInput
              label="First Name"
              type="text"
              value={editForm.firstName}
              onChange={(e) => {
                setEditForm({ ...editForm, firstName: e.target.value });
                if (profileErrors.firstName) setProfileErrors({ ...profileErrors, firstName: undefined });
              }}
              placeholder="Enter first name"
              maxLength={30}
              showCharacterCount
              error={profileErrors.firstName}
              required
            />

            <ValidatedInput
              label="Last Name"
              type="text"
              value={editForm.lastName}
              onChange={(e) => {
                setEditForm({ ...editForm, lastName: e.target.value });
                if (profileErrors.lastName) setProfileErrors({ ...profileErrors, lastName: undefined });
              }}
              placeholder="Enter last name"
              maxLength={30}
              showCharacterCount
              error={profileErrors.lastName}
              required
            />
          </div>

          <ValidatedInput
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => {
              setEditForm({ ...editForm, email: e.target.value });
              if (profileErrors.email) setProfileErrors({ ...profileErrors, email: undefined });
            }}
            placeholder="Enter email address"
            maxLength={255}
            showCharacterCount
            error={profileErrors.email}
            helperText="Must be a valid email address"
            required
          />

          <ValidatedInput
            label="Phone"
            type="tel"
            value={editForm.phone}
            onChange={(e) => {
              setEditForm({ ...editForm, phone: e.target.value });
              if (profileErrors.phone) setProfileErrors({ ...profileErrors, phone: undefined });
            }}
            placeholder="Enter phone number"
            maxLength={20}
            showCharacterCount
            error={profileErrors.phone}
            helperText="Optional"
          />
        </div>
      </Modal>
    </div >
  );
}
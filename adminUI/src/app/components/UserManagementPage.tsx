import { useState } from 'react';
import { User, Mail, Shield, Search, MoreVertical, Edit2, Trash2, Plus, X, Check, Users, Eye } from 'lucide-react';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { Button } from './Button';
import { StatusDropdown } from './StatusDropdown';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Staff' | 'Viewer';
  status: 'Active' | 'Inactive';
  createdAt: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@restaurant.com',
    role: 'Admin',
    status: 'Active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@restaurant.com',
    role: 'Manager',
    status: 'Active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Mike Thompson',
    email: 'mike.thompson@restaurant.com',
    role: 'Staff',
    status: 'Active',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@restaurant.com',
    role: 'Viewer',
    status: 'Inactive',
    createdAt: '2024-01-05',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@restaurant.com',
    role: 'Staff',
    status: 'Active',
    createdAt: '2024-02-28',
  },
];

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<User['role']>('Staff');
  const [formStatus, setFormStatus] = useState<User['status']>('Active');

  // Role options for dropdown
  const roleOptions = [
    { value: 'Admin', label: 'Admin', icon: Shield },
    { value: 'Manager', label: 'Manager', icon: User },
    { value: 'Staff', label: 'Staff', icon: Users },
    { value: 'Viewer', label: 'Viewer', icon: Eye },
  ];

  // Status options for dropdown
  const statusOptions = [
    { value: 'Active', label: 'Active', dotColor: '#10b981' },
    { value: 'Inactive', label: 'Inactive', dotColor: '#ef4444' },
  ];

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
    setFormRole('Staff');
    setFormStatus('Active');
  };

  // Add user
  const handleAddUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setIsAddUserModalOpen(false);
    resetForm();
  };

  // Edit user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsEditUserModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser) {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, name: formName, email: formEmail, role: formRole, status: formStatus }
          : user
      ));
      setIsEditUserModalOpen(false);
      resetForm();
      setSelectedUser(null);
    }
  };

  // Delete user
  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'Admin':
        return 'bg-primary/10 text-primary';
      case 'Manager':
        return 'bg-secondary/10 text-secondary';
      case 'Staff':
        return 'bg-accent text-accent-foreground';
      case 'Viewer':
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
    <div className="min-h-full bg-background px-4 md:px-8 pt-4 md:pt-6 pb-1 flex flex-col">
      <div className="w-full flex-1">
        {/* Search Bar */}
        <div className="bg-card border border-border rounded-xl p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)', minHeight: '44px' }}
              />
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddUserModalOpen(true)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-3 md:px-6 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Name
                  </th>
                  <th className="text-left px-3 md:px-6 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Email
                  </th>
                  <th className="text-left px-3 md:px-6 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Role
                  </th>
                  <th className="text-left px-3 md:px-6 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Status
                  </th>
                  <th className="text-left px-3 md:px-6 py-3 text-foreground hidden sm:table-cell" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Created
                  </th>
                  <th className="text-right px-3 md:px-6 py-3 text-foreground" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 md:px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <span className="text-foreground whitespace-nowrap" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getRoleBadgeColor(user.role)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          <Shield className="w-3.5 h-3.5" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 md:px-6 py-4 text-muted-foreground hidden sm:table-cell" style={{ fontSize: 'var(--text-base)' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center pt-8 pb-1 mt-auto">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
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
            }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={handleAddUser}
              disabled={!formName.trim() || !formEmail.trim()}
            >
              Add User
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Email *
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@restaurant.com"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

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
        title="Edit User"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" icon={X} onClick={() => {
              setIsEditUserModalOpen(false);
              resetForm();
              setSelectedUser(null);
            }}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              icon={Check} 
              onClick={handleSaveEdit}
              disabled={!formName.trim() || !formEmail.trim()}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Name *
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}>
              Email *
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="user@restaurant.com"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

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
            />
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
        confirmText="Delete User"
        confirmIcon='delete'
      />
    </div>
  );
}
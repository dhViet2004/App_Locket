import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

interface User {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  username?: string;
  displayName?: string;
}

interface UserManagementProps {
  onBack?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());

  // Mock data for development - replace with API call
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call when endpoint is available
        // const response = await adminAPI.getUsers();
        // setUsers(response.data.users);

        // Mock data for now
        const mockUsers: User[] = [
          {
            _id: '1',
            email: 'user1@example.com',
            role: 'user',
            isActive: true,
            username: 'user1',
            displayName: 'User One'
          },
          {
            _id: '2',
            email: 'user2@example.com',
            role: 'user',
            isActive: false,
            username: 'user2',
            displayName: 'User Two'
          },
          {
            _id: '3',
            email: 'admin@example.com',
            role: 'admin',
            isActive: true,
            username: 'admin',
            displayName: 'Admin User'
          },
          {
            _id: '4',
            email: 'user3@example.com',
            role: 'user',
            isActive: true,
            username: 'user3',
            displayName: 'User Three'
          },
          {
            _id: '5',
            email: 'user4@example.com',
            role: 'user',
            isActive: false,
            username: 'user4',
            displayName: 'User Four'
          }
        ];
        setUsers(mockUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user._id.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchLower))
    );
  });

  // Handle toggle ban/unban with optimistic update
  const handleToggleBan = async (userId: string) => {
    const user = users.find(u => u._id === userId);
    if (!user) return;

    const isCurrentlyBanned = !user.isActive;
    const newStatus = !isCurrentlyBanned;

    // Optimistic update - update UI immediately
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === userId ? { ...u, isActive: newStatus } : u
      )
    );

    // Mark user as updating
    setUpdatingUsers(prev => new Set(prev).add(userId));

    try {
      if (isCurrentlyBanned) {
        // Unban user
        await adminAPI.unbanUser(userId);
      } else {
        // Ban user
        await adminAPI.banUser(userId);
      }
      // API call successful, state already updated optimistically
    } catch (err) {
      // Revert optimistic update on error
      setUsers(prevUsers =>
        prevUsers.map(u =>
          u._id === userId ? { ...u, isActive: !newStatus } : u
        )
      );
      setError(err instanceof Error ? err.message : 'Failed to update user status');
      // Show error message for a few seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      // Remove from updating set
      setUpdatingUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Banned
        </span>
      );
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      superadmin: 'bg-indigo-100 text-indigo-800',
      user: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[role] || roleColors.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>
              Total: <strong className="text-gray-900">{users.length}</strong>
            </span>
            <span>
              Active: <strong className="text-green-600">{users.filter(u => u.isActive).length}</strong>
            </span>
            <span>
              Banned: <strong className="text-red-600">{users.filter(u => !u.isActive).length}</strong>
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by ID, Email, Role, Username, or Display Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No users found matching your search.' : 'No users available.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{user._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.displayName && (
                        <div className="text-xs text-gray-500">{user.displayName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.isActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleToggleBan(user._id)}
                        disabled={updatingUsers.has(user._id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          user.isActive
                            ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {updatingUsers.has(user._id) ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : user.isActive ? (
                          'Ban User'
                        ) : (
                          'Unban User'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;

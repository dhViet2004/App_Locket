import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import Pagination from '../components/common/Pagination';
import { Search, MoreVertical, Shield, Ban, CheckCircle, Mail, Trash2, Eye } from 'lucide-react';

const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

  return isDarkMode;
};

export default function UsersPage() {
    const isDarkMode = useDarkMode();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        loadUsers();
    }, [page]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getUsers({ page, limit });
            // Backend response format: { success: true, data: { items: [], pagination: {} } }
            setUsers(response.data?.items || []);
            setTotalPages(response.data?.pagination?.totalPages || 1);
            setTotal(response.data?.pagination?.total || 0);
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (userId, isActive) => {
        const isBanned = !isActive;
        if (!confirm(`Are you sure you want to ${isBanned ? 'unban' : 'ban'} this user?`)) return;
        try {
            if (isBanned) {
                await adminAPI.unbanUser(userId);
            } else {
                await adminAPI.banUser(userId);
            }
            // Update local state instead of reloading
            setUsers(users.map(user => 
                user._id === userId 
                    ? { ...user, isActive: !isBanned }
                    : user
            ));
        } catch (error) {
            console.error('Failed to toggle ban status:', error);
            alert('Failed to update user status. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: '2-digit'
        }).replace(/ /g, '\n');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>User Management</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>User Status</p>
            </div>

            <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
                {loading ? (
                    <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                                    <th className="px-6 py-5">#</th>
                                    <th className="px-6 py-5">Avatar</th>
                                    <th className="px-6 py-5">Name</th>
                                    <th className="px-6 py-5">Email</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Joined Date</th>
                                    <th className="px-6 py-5">Role</th>
                                    <th className="px-6 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                                {users.map((user, index) => (
                                    <tr key={user._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>#{index + 1 + (page - 1) * limit}</td>
                                        <td className="px-6 py-4">
                                            <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-[#1E2532] border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'} flex items-center justify-center font-bold border transition-colors`}>
                                                {user.avatarUrl ? (
                                                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    user.username?.charAt(0).toUpperCase() || 'U'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-bold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} cursor-pointer transition-colors`}>
                                                {user.displayName || user.username}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} transition-colors`}>
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-md text-xs font-bold ${user.isActive !== false
                                                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                {user.isActive !== false ? 'Active' : 'Banned'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-700'} whitespace-pre-line transition-colors`}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium w-16 transition-colors`}>{user.role || 'USER'}</span>
                                                <div className={`w-20 h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden transition-colors`}>
                                                    <div
                                                        className={`h-full rounded-full ${user.role === 'ADMIN' ? 'bg-purple-500 w-full' :
                                                                user.role === 'MODERATOR' ? 'bg-blue-500 w-2/3' : 'bg-blue-600/60 w-1/3'
                                                            }`}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleBan(user._id, user.isActive)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${user.isActive === false
                                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'
                                                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'
                                                    }`}
                                                title={user.isActive === false ? 'Unban user' : 'Ban user'}
                                            >
                                                {user.isActive === false ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Unban
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban className="w-4 h-4" />
                                                        Ban
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className={`p-6 border-t ${isDarkMode ? 'border-gray-800/50' : 'border-gray-200'} flex justify-end transition-colors`}>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        total={total}
                        limit={limit}
                        onPageChange={setPage}
                        darkMode={isDarkMode}
                    />
                </div>
            </div>
        </div>
    );
}

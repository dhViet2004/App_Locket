import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Edit2,
  X,
  CheckCircle,
  AlertCircle,
  Shield,
  Camera
} from 'lucide-react';
import { adminAPI } from '../lib/api';

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

export default function ProfilePage() {
  const isDarkMode = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Profile info
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    username: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Email change
  const [emailData, setEmailData] = useState({
    password: '',
    newEmail: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const adminName = localStorage.getItem('adminName') || 'Admin';
    setProfile({
      displayName: adminName,
      email: localStorage.getItem('adminEmail') || '',
      phone: localStorage.getItem('adminPhone') || '',
      username: adminName,
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.updateProfile({
        displayName: profile.displayName,
        phone: profile.phone,
      });

      if (profile.displayName) localStorage.setItem('adminName', profile.displayName);
      if (profile.phone) localStorage.setItem('adminPhone', profile.phone);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setSaving(false);
      return;
    }

    try {
      await adminAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await adminAPI.changeEmail({
        password: emailData.password,
        newEmail: emailData.newEmail,
      });

      localStorage.setItem('adminEmail', emailData.newEmail);
      setProfile({ ...profile, email: emailData.newEmail });
      setMessage({ type: 'success', text: 'Email changed successfully!' });
      setEmailData({ password: '', newEmail: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change email.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>My Profile</h1>
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Account Settings</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-xl border ${message.type === 'success'
            ? isDarkMode 
              ? 'bg-green-500/10 border-green-500/20 text-green-500'
              : 'bg-green-50 border-green-200 text-green-600'
            : isDarkMode
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : 'bg-red-50 border-red-200 text-red-600'
          } flex items-center gap-3 animate-fade-in-up transition-colors`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card */}
          <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-8 shadow-xl relative overflow-hidden transition-colors`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${isDarkMode ? 'bg-blue-600/5' : 'bg-blue-50'} rounded-full blur-3xl transition-colors`}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center shadow-lg transition-colors`}>
                    <User className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Personal Information</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Update your basic profile details</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-[#1E2532] text-blue-400 hover:bg-gray-700' : 'bg-gray-100 text-blue-600 hover:bg-gray-200'} rounded-xl transition-all font-bold text-sm transition-colors`}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={profile.displayName}
                      onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Enter display name"
                    />
                  </div>

                  <div>
                    <label className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-300 text-gray-500'} border rounded-xl cursor-not-allowed transition-colors`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-300 text-gray-500'} border rounded-xl cursor-not-allowed transition-colors`}
                  />
                  <p className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-500'} mt-2 transition-colors`}>To change email, use the "Change Email" section.</p>
                </div>

                <div>
                  <label className={`flex items-center gap-2 text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    placeholder="Enter phone number"
                  />
                </div>

                {isEditing && (
                  <div className={`flex items-center gap-3 pt-6 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        loadProfile();
                        setMessage({ type: '', text: '' });
                      }}
                      className={`flex items-center gap-2 px-6 py-2.5 ${isDarkMode ? 'bg-[#1E2532] text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} rounded-xl transition-all font-bold transition-colors`}
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Change Password Card */}
          <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-8 shadow-xl relative overflow-hidden transition-colors`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${isDarkMode ? 'bg-purple-600/5' : 'bg-purple-50'} rounded-full blur-3xl transition-colors`}></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center shadow-lg transition-colors`}>
                  <Lock className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Change Password</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Ensure your account is secure</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`}
                      placeholder="Min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all`}
                      placeholder="Re-enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Change Email & Info */}
        <div className="space-y-6">
          <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-8 shadow-xl relative overflow-hidden transition-colors`}>
            <div className={`absolute top-0 right-0 w-64 h-64 ${isDarkMode ? 'bg-orange-600/5' : 'bg-orange-50'} rounded-full blur-3xl transition-colors`}></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} border flex items-center justify-center shadow-lg transition-colors`}>
                  <Mail className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Change Email</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Update your email address</p>
                </div>
              </div>

              <form onSubmit={handleEmailChange} className="space-y-6">
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={emailData.password}
                    onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all`}
                    placeholder="Enter password to confirm"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>
                    New Email
                  </label>
                  <input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all`}
                    placeholder="Enter new email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-900/20 disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  {saving ? 'Updating...' : 'Update Email'}
                </button>
              </form>
            </div>
          </div>

          {/* Account Status Card */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-[#1E2532] to-[#151A25] border-gray-800' : 'bg-gradient-to-br from-gray-50 to-white border-gray-200'} rounded-2xl border p-6 shadow-xl transition-colors`}>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2 transition-colors`}>
              <Shield className="w-5 h-5 text-green-500" />
              Account Status
            </h3>
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium transition-colors`}>Role</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold border border-blue-500/20">
                  Administrator
                </span>
              </div>
              <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium transition-colors`}>Status</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-lg text-xs font-bold border border-green-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

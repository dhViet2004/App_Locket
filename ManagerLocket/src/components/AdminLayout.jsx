import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Megaphone,
  Moon,
  Sun,
  Search,
  Bell,
  LogOut,
  RotateCcw,
  BarChart3,
  FileCheck,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/posts', label: 'Posts', icon: FileText },
  { path: '/admin/plans', label: 'Plans', icon: CreditCard },
  { path: '/admin/ads', label: 'Ads', icon: Megaphone },
  { path: '/admin/refunds', label: 'Refunds', icon: RotateCcw },
  { path: '/admin/reports/revenue', label: 'Reports', icon: BarChart3 },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileCheck },
  { path: '/admin/profile', label: 'Profile', icon: User },
];

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const adminName = localStorage.getItem('adminName') || 'Alex Turner';
  const adminRole = 'Admin';
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const bgColor = isDarkMode ? 'bg-[#0B0E14]' : 'bg-gray-50';
  const sidebarBg = isDarkMode ? 'bg-[#151A25]' : 'bg-white';
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const borderColor = isDarkMode ? 'border-gray-800/50' : 'border-gray-200';

  return (
    <div className={`h-screen w-full ${bgColor} flex font-sans ${textColor} overflow-hidden transition-colors duration-300`}>
      {/* Sidebar - Fixed Position */}
      <aside className={`fixed top-0 left-0 h-screen w-64 ${sidebarBg} flex flex-col border-r ${borderColor} z-30 shadow-xl transition-colors duration-300`}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <div>
            <h1 className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg leading-tight transition-colors`}>SocialAdmin</h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} transition-colors`}>Management Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : isDarkMode ? 'text-gray-500 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Dark Mode Toggle & Logout */}
        <div className="p-4 mt-auto flex-shrink-0 space-y-2">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-blue-400 transition-colors rounded-xl hover:bg-blue-500/10 group"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-5 h-5 group-hover:text-blue-400" />
                <span className="font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 group-hover:text-blue-400" />
                <span className="font-medium">Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper - Offset by sidebar width */}
      <div className="flex flex-col min-w-0 h-screen relative overflow-hidden" style={{ marginLeft: '256px', width: 'calc(100% - 256px)', flex: '1 1 auto' }}>
        {/* Top Header - Sticky */}
        <header className={`h-20 flex items-center justify-between px-8 ${isDarkMode ? 'bg-[#0B0E14]/90' : 'bg-white/90'} backdrop-blur-md sticky top-0 z-40 border-b ${borderColor} flex-shrink-0 transition-colors duration-300`}>
          {/* Search */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for users, posts, campaigns..."
                className={`w-full ${isDarkMode ? 'bg-[#151A25] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'} border text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${isDarkMode ? 'placeholder-gray-600' : 'placeholder-gray-400'}`}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 ml-4">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors hover:bg-gray-800 rounded-lg">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0E14]"></span>
            </button>

            <div className={`flex items-center gap-3 pl-6 border-l ${borderColor}`}>
              <div className="text-right hidden md:block">
                <div className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold text-sm transition-colors`}>{adminName}</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} transition-colors`}>{adminRole}</div>
              </div>
              <Link to="/admin/profile" className="w-10 h-10 rounded-full bg-[#FFEAD1] flex items-center justify-center text-orange-600 font-bold border-2 border-[#151A25] hover:border-blue-500 transition-colors cursor-pointer">
                {adminName.charAt(0)}
              </Link>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full" style={{ padding: '32px' }}>
          <div className="w-full max-w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

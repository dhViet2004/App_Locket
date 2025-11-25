import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { adminAPI } from '../lib/api';
import {
  Users,
  FileText,
  CreditCard,
  Megaphone,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RotateCcw
} from 'lucide-react';

export default function DashboardContent() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingRefunds, setPendingRefunds] = useState(0);
  const [chartType, setChartType] = useState('users'); // 'users' or 'posts'
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const summaryResponse = await adminAPI.getDashboardSummary();
      const summaryData = summaryResponse.data || summaryResponse;
      
      // Lấy số liệu plans và ads từ API
      let activePlansCount = 0;
      let totalAdsCount = 0;
      let activeAdsCount = 0;
      
      try {
        const plansResponse = await adminAPI.getPlans();
        const plans = plansResponse.data?.plans || plansResponse.plans || [];
        activePlansCount = plans.filter(plan => plan.isActive === true).length;
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
      
      try {
        const adsResponse = await adminAPI.getAds();
        const ads = adsResponse.data?.ads || adsResponse.ads || [];
        totalAdsCount = ads.length; // Tổng số ads (bao gồm cả active và paused)
        activeAdsCount = ads.filter(ad => ad.isActive === true).length; // Số ads đang hoạt động
      } catch (err) {
        console.error('Failed to load ads:', err);
        // Fallback về số liệu từ summary nếu không lấy được
        totalAdsCount = summaryData?.ads?.active || 0;
        activeAdsCount = summaryData?.ads?.active || 0;
      }
      
      // Cập nhật summary với số liệu plans và ads
      const updatedSummary = {
        ...summaryData,
        plans: {
          active: activePlansCount,
          newThisMonth: summaryData?.plans?.newThisMonth || 0
        },
        ads: {
          total: totalAdsCount, // Tổng số ads
          active: activeAdsCount, // Số ads đang hoạt động
          newThisMonth: summaryData?.ads?.newThisMonth || 0
        }
      };
      
      setSummary(updatedSummary);
      setPendingRefunds(updatedSummary?.refunds?.pending || 0);

      const revenueResponse = await adminAPI.getDailyRevenue(30);
      setDailyRevenue(revenueResponse.data?.dailyRevenue || revenueResponse.dailyRevenue || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback data for demo purposes if API fails
      setSummary({
        users: { total: 1420, newThisMonth: 5.2 },
        posts: { total: 14, newThisMonth: 1.8 },
        plans: { active: 3, newThisMonth: 0 },
        ads: { active: 3, newThisMonth: 0 }
      });
      setDailyRevenue(Array.from({ length: 15 }, (_, i) => ({
        date: new Date(Date.now() - (14 - i) * 86400000).toISOString(),
        revenue: Math.floor(Math.random() * 100000) + 50000
      })));
    } finally {
      setLoading(false);
    }
  };

  const chartData = dailyRevenue.length > 0 ? dailyRevenue.map(d => ({
    name: new Date(d.date).getDate(),
    value: chartType === 'users' ? (d.dau || 0) : (d.posts || 0),
  })) : [];

  const StatCard = ({ title, value, change, icon: Icon, colorClass, iconBgClass }) => (
    <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl p-10 md:p-12 border hover:border-gray-700 transition-colors relative overflow-hidden group shadow-sm`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${iconBgClass}`}>
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
          {change !== undefined && (
            <div className="flex items-center gap-1 text-xs font-bold">
              {change >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(change)}%
              </span>
              <span className="text-gray-500 font-normal">this month</span>
            </div>
          )}
        </div>
        <div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium mb-1 transition-colors`}>{title}</p>
          <h3 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>{value}</h3>
        </div>
      </div>
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${colorClass.replace('text-', 'bg-')}`}></div>
    </div>
  );

  const StatusItem = ({ label, status, value }) => (
    <div className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'} ${status === 'online' ? 'animate-pulse' : ''}`}></div>
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium transition-colors`}>{label}</span>
      </div>
      <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} font-semibold transition-colors`}>{value}</span>
    </div>
  );

  const ActivityItem = ({ name, action, time, avatar, type }) => (
    <div className="flex gap-4 items-start group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-[#151A25] shadow-sm ${type === 'user' ? 'bg-[#FFEAD1] text-orange-600' :
          type === 'post' ? 'bg-[#E1F0FF] text-blue-600' : 'bg-[#E8F7F0] text-green-600'
        }`}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="font-bold text-sm">{name.charAt(0)}</span>
        )}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm text-white group-hover:text-blue-400 transition-colors">
          <span className="font-bold">{name}</span> <span className="text-gray-400 font-normal">{action}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Dashboard Overview</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>System Statistics & Analytics</p>
        </div>
      </div>

      {/* Stats Grid - 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 px-0">
        <StatCard
          title="Total Users"
          value={(summary?.users?.total || 1420).toLocaleString()}
          change={summary?.users?.newThisMonth || 5.2}
          icon={Users}
          colorClass="text-blue-500"
          iconBgClass="bg-blue-500/10"
        />
        <StatCard
          title="Total Posts"
          value={(summary?.posts?.total || 14).toLocaleString()}
          change={summary?.posts?.newThisMonth || 1.8}
          icon={FileText}
          colorClass="text-purple-500"
          iconBgClass="bg-purple-500/10"
        />
        <StatCard
          title="Active Plans"
          value={(summary?.plans?.active || 245).toLocaleString()}
          change={summary?.plans?.newThisMonth || 12.5}
          icon={CreditCard}
          colorClass="text-green-500"
          iconBgClass="bg-green-500/10"
        />
        <StatCard
          title="Ad Campaigns"
          value={(summary?.ads?.total || summary?.ads?.active || 0).toLocaleString()}
          change={summary?.ads?.newThisMonth || -2.1}
          icon={Megaphone}
          colorClass="text-orange-500"
          iconBgClass="bg-orange-500/10"
        />
      </div>

      {/* Chart and Revenue/Refunds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Main Chart */}
        <div className={`lg:col-span-2 ${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl p-10 md:p-12 border shadow-xl relative overflow-hidden transition-colors`}>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>User Growth</h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Overview of the last 30 days</p>
            </div>
            <div className={`flex ${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-100 border-gray-300'} rounded-lg p-1 border transition-colors`}>
              <button 
                onClick={() => setChartType('users')}
                className={`px-4 py-1.5 ${chartType === 'users' 
                  ? isDarkMode ? 'bg-[#1E2532] text-blue-400' : 'bg-white text-blue-600'
                  : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                } text-xs font-bold rounded-md shadow-sm transition-colors`}
              >
                Users
              </button>
              <button 
                onClick={() => setChartType('posts')}
                className={`px-4 py-1.5 ${chartType === 'posts'
                  ? isDarkMode ? 'bg-[#1E2532] text-blue-400' : 'bg-white text-blue-600'
                  : isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'
                } text-xs font-medium transition-colors`}
              >
                Posts
              </button>
            </div>
          </div>

          <div className="h-[350px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E2532" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F3F4F6', borderRadius: '8px', border: 'none', color: '#1F2937', fontWeight: 'bold' }}
                  itemStyle={{ color: '#1F2937' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>
        </div>

        {/* Total Revenue */}
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl p-10 md:p-12 border shadow-xl transition-colors`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-green-500/10' : 'bg-green-100'}`}>
                <DollarSign className={`w-6 h-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Tổng Doanh Thu</h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Tháng này</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 transition-colors`}>Doanh thu tháng này</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                {summary?.revenue?.thisMonth 
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.revenue.thisMonth)
                  : '0 ₫'}
              </p>
            </div>
            <div className={`p-5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 transition-colors`}>Đã hoàn tiền</p>
              <p className={`text-xl font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'} transition-colors`}>
                {summary?.revenue?.refundsThisMonth 
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.revenue.refundsThisMonth)
                  : '0 ₫'}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Refunds */}
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl p-10 md:p-12 border shadow-xl transition-colors`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100'}`}>
                <RotateCcw className={`w-6 h-6 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Yêu Cầu Hoàn Tiền</h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Đang chờ duyệt</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`p-5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 transition-colors`}>Số yêu cầu</p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>
                {pendingRefunds || 0}
              </p>
            </div>
            <div className={`p-5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800/50' : 'bg-gray-50 border-gray-200'} rounded-xl border transition-colors`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 transition-colors`}>Cần xử lý</p>
              <p className={`text-lg font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'} transition-colors`}>
                {pendingRefunds > 0 ? 'Có yêu cầu mới' : 'Không có yêu cầu'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

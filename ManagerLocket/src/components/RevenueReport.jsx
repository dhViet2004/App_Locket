import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { adminAPI } from '../lib/api';
import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';

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

export default function RevenueReport() {
  const isDarkMode = useDarkMode();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  const handleGetReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getRevenueReport(startDate, endDate);
      setReportData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  const chartData = reportData?.dailyDetails.map((day) => ({
    date: formatDate(day.day),
    'Subscription': day.subsNet || 0,
    'Ads': day.adsRevenue || 0,
    'Refunds': day.refunds || 0,
    'Total': day.totalRevenue || 0,
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Revenue Report</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Financial Overview</p>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-xl transition-colors`}>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-4 py-2.5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
            />
          </div>

          <div className="flex-1 w-full">
            <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2.5 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
            />
          </div>

          <button
            onClick={handleGetReport}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Loading...' : (
              <>
                <BarChart3 className="w-4 h-4" />
                Generate Report
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Chart */}
      {reportData && (
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-xl transition-colors`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2 transition-colors`}>
            <TrendingUp className="w-5 h-5 text-green-500" />
            Daily Revenue Trend
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1E2532' : '#E5E7EB'} vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#6B7280' : '#4B5563', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#6B7280' : '#4B5563', fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value;
                  }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1F2937' : '#F9FAFB', 
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #374151' : '1px solid #E5E7EB', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' 
                  }}
                  itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#1F2937', fontWeight: 600 }}
                  labelStyle={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', marginBottom: '8px' }}
                  formatter={(value) => formatCurrency(value, reportData.summary.currency)}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Subscription" stroke="#3B82F6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Ads" stroke="#10B981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Total" stroke="#8B5CF6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Refunds" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Table */}
      {reportData && (
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-6 shadow-xl transition-colors`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2 transition-colors`}>
            <DollarSign className="w-5 h-5 text-yellow-500" />
            Financial Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-50 border-gray-200'} border-b transition-colors`}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider transition-colors`}>Metric</th>
                  <th className={`px-6 py-4 text-right text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider transition-colors`}>Value</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800' : 'divide-gray-200'} transition-colors`}>
                <tr>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>Total Subscription Revenue</td>
                  <td className="px-6 py-4 text-sm text-blue-400 text-right font-bold">
                    {formatCurrency(reportData.dailyDetails.reduce((sum, day) => sum + (day.subsNet || 0), 0), reportData.summary.currency)}
                  </td>
                </tr>
                <tr>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>Total Ads Revenue</td>
                  <td className="px-6 py-4 text-sm text-green-400 text-right font-bold">
                    {formatCurrency(reportData.dailyDetails.reduce((sum, day) => sum + (day.adsRevenue || 0), 0), reportData.summary.currency)}
                  </td>
                </tr>
                <tr>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>Total Refunds</td>
                  <td className="px-6 py-4 text-sm text-red-400 text-right font-bold">
                    {formatCurrency(reportData.summary.totalRefunds, reportData.summary.currency)}
                  </td>
                </tr>
                <tr className={isDarkMode ? 'bg-[#1E2532]/50' : 'bg-gray-50'}>
                  <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>Net Revenue</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'} text-right font-bold text-lg transition-colors`}>
                    {formatCurrency(reportData.summary.totalNetRevenue, reportData.summary.currency)}
                  </td>
                </tr>
                <tr>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>Total Transactions</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-right font-medium transition-colors`}>
                    {reportData.summary.totalInvoices.toLocaleString('vi-VN')}
                  </td>
                </tr>
                <tr>
                  <td className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>Avg. Daily Revenue</td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-right font-medium transition-colors`}>
                    {formatCurrency(reportData.summary.averageDailyRevenue, reportData.summary.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && !error && (
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-12 text-center transition-colors`}>
          <div className={`w-16 h-16 ${isDarkMode ? 'bg-[#1E2532]' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4 transition-colors`}>
            <BarChart3 className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors`} />
          </div>
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 transition-colors`}>No Report Generated</h3>
          <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Select a date range and click "Generate Report" to view financial data.</p>
        </div>
      )}
    </div>
  );
}

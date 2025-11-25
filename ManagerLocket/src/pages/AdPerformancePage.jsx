import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import SelectDropdown from '../components/SelectDropdown';
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

export default function AdPerformancePage() {
  const [ads, setAds] = useState([]);
  const [selectedAdId, setSelectedAdId] = useState('');
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

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const response = await adminAPI.getAds();
      setAds(response.data?.ads || []);
    } catch (error) {
      console.error('Failed to load ads:', error);
    }
  };

  const handleGetReport = async () => {
    if (!selectedAdId || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getAdPerformanceReport(selectedAdId, startDate, endDate);
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không thể tải báo cáo');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const chartData = reportData?.dailyDetails?.map((day) => ({
    date: formatDate(day.day || day.date),
    Impressions: day.impressions || 0,
    Clicks: day.clicks || 0,
    CTR: day.ctr ? Number(day.ctr.toFixed(2)) : 0,
  })) || [];

  return (
    <div className="w-full max-w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ad Performance Report</h1>
        <p className="text-sm text-gray-600 mt-2">
          Báo cáo hiệu suất quảng cáo: Theo dõi số lần hiển thị (Impressions), số lần click (Clicks), và tỷ lệ click (CTR) của một quảng cáo cụ thể trong khoảng thời gian.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <SelectDropdown
              label="Chọn Quảng cáo *"
              value={selectedAdId}
              onChange={(value) => setSelectedAdId(value)}
              options={[
                { value: '', label: '-- Chọn quảng cáo --' },
                ...ads.map((ad) => ({
                  value: ad._id || ad.id,
                  label: `${ad.name} (${ad.placement})`,
                })),
              ]}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            onClick={handleGetReport}
            disabled={loading || !selectedAdId}
            className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Đang tải...' : 'Xem Báo cáo'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {reportData && (
        <>
          {/* Ad Info */}
          {reportData.ad && (
            <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin Quảng cáo</h2>
              <div className="flex items-center gap-4">
                {reportData.ad.imageUrl && (
                  <img
                    src={reportData.ad.imageUrl}
                    alt={reportData.ad.name}
                    className="w-24 h-16 object-cover rounded border-2 border-gray-200"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-900">{reportData.ad.name}</div>
                  <div className="text-sm text-gray-500">ID: {reportData.ad._id}</div>
                  <div className="text-sm text-gray-500">Vị trí: {reportData.ad.placement}</div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Chart */}
          <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ Hiệu suất</h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickFormatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Impressions" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Số lần hiển thị"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="Clicks" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Số lần click"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="CTR" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    name="CTR (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Tổng Impressions</div>
                <div className="text-3xl font-bold text-blue-900">
                  {reportData.summary?.totalImpressions?.toLocaleString('vi-VN') || 0}
                </div>
                <div className="text-xs text-blue-600 mt-2">Số lần quảng cáo được hiển thị</div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="text-sm font-medium text-green-600 uppercase tracking-wide mb-2">Tổng Clicks</div>
                <div className="text-3xl font-bold text-green-900">
                  {reportData.summary?.totalClicks?.toLocaleString('vi-VN') || 0}
                </div>
                <div className="text-xs text-green-600 mt-2">Số lần người dùng click vào quảng cáo</div>
              </div>
              <div className="bg-amber-50 p-6 rounded-lg border-2 border-amber-200">
                <div className="text-sm font-medium text-amber-600 uppercase tracking-wide mb-2">CTR (Click-Through Rate)</div>
                <div className="text-3xl font-bold text-amber-900">
                  {reportData.summary?.ctr?.toFixed(2) || 0}%
                </div>
                <div className="text-xs text-amber-600 mt-2">Tỷ lệ click = (Clicks / Impressions) × 100</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


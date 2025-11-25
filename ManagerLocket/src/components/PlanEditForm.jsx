import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import SelectDropdown from './SelectDropdown';

export default function PlanEditForm({ plan, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    interval: 'month',
    intervalCount: 1,
    trialDays: 0,
    features: {
      noAds: false,
      maxPostsPerDay: 0,
    },
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plan) {
      console.log('PlanEditForm: Plan received:', plan);
      console.log('PlanEditForm: Plan _id:', plan._id);
      console.log('PlanEditForm: Plan id:', plan.id);
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        price: plan.price || 0,
        interval: plan.interval || 'month',
        intervalCount: plan.intervalCount || 1,
        trialDays: plan.trialDays || 0,
        features: {
          noAds: plan.features?.noAds || false,
          maxPostsPerDay: plan.features?.maxPostsPerDay || 0,
        },
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
    }
  }, [plan]);

  // Validate plan exists and has ID
  if (!plan) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lỗi</h2>
          <p className="text-gray-700 mb-4">Không tìm thấy thông tin gói dịch vụ</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate plan ID - try both _id and id
    const planId = plan?._id || plan?.id;
    if (!planId) {
      setError('Không tìm thấy ID của gói dịch vụ. Vui lòng thử lại.');
      console.error('Plan object:', plan);
      console.error('Plan _id:', plan?._id);
      console.error('Plan id:', plan?.id);
      return;
    }

    setLoading(true);

    try {
      console.log('Updating plan with ID:', planId);
      console.log('Form data:', formData);
      await adminAPI.updatePlan(planId, formData);
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Không thể cập nhật gói dịch vụ';
      setError(errorMessage);
      console.error('Failed to update plan:', err);
      console.error('Plan ID used:', planId);
      console.error('Plan object:', plan);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureChange = (key, value) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [key]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 pt-28 animate-fade-in" style={{ zIndex: 9999, paddingTop: '7rem' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto animate-scale-in mt-4" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa Gói dịch vụ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Thông tin cơ bản
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên gói *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectDropdown
                label="Chu kỳ thanh toán *"
                value={formData.interval}
                onChange={(value) => setFormData({ ...formData, interval: value })}
                options={[
                  { value: 'day', label: 'Ngày' },
                  { value: 'week', label: 'Tuần' },
                  { value: 'month', label: 'Tháng' },
                  { value: 'year', label: 'Năm' },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số chu kỳ *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.intervalCount}
                  onChange={(e) => setFormData({ ...formData, intervalCount: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày dùng thử</label>
                <input
                  type="number"
                  min={0}
                  value={formData.trialDays}
                  onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Tính năng
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="noAds"
                  checked={formData.features.noAds}
                  onChange={(e) => handleFeatureChange('noAds', e.target.checked)}
                  className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="noAds" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Không có quảng cáo (No Ads)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số bài đăng tối đa mỗi ngày
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.features.maxPostsPerDay}
                  onChange={(e) => handleFeatureChange('maxPostsPerDay', Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="0 = không giới hạn"
                />
                <p className="text-xs text-gray-500 mt-1">0 = không giới hạn</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Gói đang hoạt động (Active)
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


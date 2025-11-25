import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import DatePicker from './DatePicker';
import SelectDropdown from './SelectDropdown';
import ImageUpload from './ImageUpload';

export default function AdManagementForm({ ad, onClose, onSuccess, mode = 'create' }) {
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    ctaText: '',
    placement: 'feed',
    isActive: true,
    startAt: null,
    endAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ad) {
      setFormData({
        name: ad.name || '',
        title: ad.title || '',
        description: ad.description || '',
        imageUrl: ad.imageUrl || '',
        targetUrl: ad.ctaUrl || ad.targetUrl || '',
        ctaText: ad.ctaText || '',
        placement: ad.placement || 'feed',
        isActive: ad.isActive !== undefined ? ad.isActive : true,
        startAt: ad.startAt || null,
        endAt: ad.endAt || null,
      });
    }
  }, [ad]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Tên quảng cáo không được để trống');
      return;
    }
    if (!formData.imageUrl.trim()) {
      setError('Hình ảnh quảng cáo không được để trống');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'edit' && ad?._id) {
        // Update existing ad
        await adminAPI.updateAd(ad._id, formData);
      } else {
        // Create new ad
        await adminAPI.createAd(formData);
      }

      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu quảng cáo');
      console.error('Failed to save ad:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center z-[9999] p-4 animate-fade-in" style={{ zIndex: 9999, paddingTop: '7rem' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto animate-scale-in mt-4" style={{ zIndex: 10000 }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'edit' ? 'Chỉnh sửa Quảng cáo' : 'Tạo Quảng cáo mới'}
          </h2>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên quảng cáo *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Back-to-school Promo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Tiêu đề quảng cáo"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nút CTA</label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  placeholder="VD: Mua ngay, Tìm hiểu thêm"
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
                placeholder="Mô tả quảng cáo"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">URL đích *</label>
              <input
                type="url"
                required
                value={formData.targetUrl}
                onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                placeholder="https://example.com/landing"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Hình ảnh
            </h3>
            <ImageUpload
              label="Hình ảnh quảng cáo *"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              onUrlChange={(url) => setFormData({ ...formData, imageUrl: url })}
              onUpload={async (file) => {
                try {
                  const response = await adminAPI.uploadAdImage(file);
                  return response.data?.imageUrl || response.imageUrl;
                } catch (err) {
                  console.error('Upload error:', err);
                  throw new Error(err.response?.data?.message || 'Không thể tải ảnh lên');
                }
              }}
            />
          </div>

          {/* Settings */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Cài đặt
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectDropdown
                label="Vị trí hiển thị *"
                value={formData.placement}
                onChange={(value) => setFormData({ ...formData, placement: value })}
                options={[
                  { value: 'feed', label: 'Feed' },
                  { value: 'splash', label: 'Splash Screen' },
                  { value: 'banner', label: 'Banner' },
                ]}
              />

              <SelectDropdown
                label="Trạng thái *"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(value) => setFormData({ ...formData, isActive: value === 'active' })}
                options={[
                  { value: 'active', label: 'Hoạt động' },
                  { value: 'inactive', label: 'Tạm dừng' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="Ngày bắt đầu"
                value={formData.startAt}
                onChange={(value) => setFormData({ ...formData, startAt: value })}
              />

              <DatePicker
                label="Ngày kết thúc"
                value={formData.endAt}
                onChange={(value) => setFormData({ ...formData, endAt: value })}
                min={formData.startAt}
              />
            </div>
          </div>

          {/* Stats (Read-only, only for edit mode) */}
          {mode === 'edit' && ad && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Thống kê
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Số lần hiển thị</label>
                  <p className="text-2xl font-bold text-gray-900">{ad.impressionCount || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Số lần click</label>
                  <p className="text-2xl font-bold text-gray-900">{ad.clickCount || 0}</p>
                </div>
              </div>
            </div>
          )}

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
              {loading ? 'Đang lưu...' : mode === 'edit' ? 'Cập nhật' : 'Tạo quảng cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


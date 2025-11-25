import apiClient from './axios';

// Admin API functions - matching backend controllers
export const adminAPI = {
  // Users
  getUsers: async (params) => {
    const response = await apiClient.get('/api/admin/users', { params });
    return response.data;
  },
  
  banUser: async (userId) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/ban`);
    return response.data;
  },
  
  unbanUser: async (userId) => {
    const response = await apiClient.put(`/api/admin/users/${userId}/unban`);
    return response.data;
  },

  // Posts
  getPosts: async (params) => {
    const response = await apiClient.get('/api/admin/posts', { params });
    return response.data;
  },
  
  deletePost: async (postId) => {
    const response = await apiClient.delete(`/api/admin/posts/${postId}`);
    return response.data;
  },

  // Plans
  getPlans: async () => {
    // Use admin endpoint to get all plans with full details including _id
    const response = await apiClient.get('/api/admin/plans');
    return response.data;
  },
  
  createPlan: async (planData) => {
    const response = await apiClient.post('/api/admin/plans', planData);
    return response.data;
  },
  
  updatePlan: async (planId, planData) => {
    const response = await apiClient.put(`/api/admin/plans/${planId}`, planData);
    return response.data;
  },
  
  deactivatePlan: async (planId) => {
    // Backend uses DELETE for deactivate
    const response = await apiClient.delete(`/api/admin/plans/${planId}`);
    return response.data;
  },
  
  activatePlan: async (planId) => {
    const response = await apiClient.put(`/api/admin/plans/${planId}/activate`);
    return response.data;
  },

  // Ads
  getAds: async () => {
    const response = await apiClient.get('/api/admin/ads');
    return response.data;
  },
  
  createAd: async (adData) => {
    const response = await apiClient.post('/api/admin/ads', adData);
    return response.data;
  },
  
  updateAd: async (adId, adData) => {
    // Update full ad data (if backend supports it)
    // For now, we'll use createAd endpoint pattern
    const response = await apiClient.put(`/api/admin/ads/${adId}`, adData);
    return response.data;
  },
  
  updateAdStatus: async (adId, status) => {
    // Backend uses PUT /api/admin/ads/:adId/status with body { status: 'ACTIVE' | 'PAUSED' }
    const response = await apiClient.put(`/api/admin/ads/${adId}/status`, { status });
    return response.data;
  },
  
  deleteAd: async (adId) => {
    // TODO: Backend doesn't have DELETE endpoint for ads
    // Might need to use updateAdStatus with 'PAUSED' or create delete endpoint
    const response = await apiClient.put(`/api/admin/ads/${adId}/status`, { status: 'PAUSED' });
    return response.data;
  },

  // Refunds
  getPendingRefunds: async () => {
    const response = await apiClient.get('/api/admin/refunds/pending');
    return response.data;
  },
  
  processRefund: async (refundId, status, adminNote, externalRefundId) => {
    const response = await apiClient.put(
      `/api/admin/refunds/${refundId}/process`,
      { status, adminNote, externalRefundId }
    );
    return response.data;
  },

  // Reports
  getRevenueReport: async (startDate, endDate) => {
    const response = await apiClient.get('/api/admin/reports/revenue', {
      params: { startDate, endDate },
    });
    return response.data;
  },
  
  getAdPerformanceReport: async (adId, startDate, endDate) => {
    const response = await apiClient.get('/api/admin/reports/ad_performance', {
      params: { adId, startDate, endDate },
    });
    return response.data;
  },

  // Media Upload
  uploadAdImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post('/api/admin/upload/ad-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    const response = await apiClient.get('/api/admin/audit-logs', { params });
    return response.data;
  },
  
  getAuditLogById: async (logId) => {
    const response = await apiClient.get(`/api/admin/audit-logs/${logId}`);
    return response.data;
  },

  // Dashboard
  getDashboardSummary: async () => {
    const response = await apiClient.get('/api/admin/dashboard/summary');
    return response.data;
  },
  
  getDailyRevenue: async (days = 30) => {
    const response = await apiClient.get('/api/admin/dashboard/daily-revenue', {
      params: { days },
    });
    return response.data;
  },

  // Profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/users/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post('/api/users/change-password', passwordData);
    return response.data;
  },

  changeEmail: async (emailData) => {
    const response = await apiClient.post('/api/users/change-email', emailData);
    return response.data;
  },
};

// Public API (no auth required)
export const publicAPI = {
  getPlans: async () => {
    const response = await apiClient.get('/api/plans');
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: async (identifier, password) => {
    const response = await apiClient.post('/api/auth/login', { identifier, password });
    return response.data;
  },
};

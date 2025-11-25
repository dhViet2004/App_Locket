const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('admin_token') || localStorage.getItem('token');
};

// API service for admin endpoints
export const adminAPI = {
  // Ban user
  banUser: async (userId: string): Promise<{ success: boolean; message: string; data: { user: { _id: string; isActive: boolean } } }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/ban`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to ban user' }));
      throw new Error(error.message || 'Failed to ban user');
    }

    return response.json();
  },

  // Unban user
  unbanUser: async (userId: string): Promise<{ success: boolean; message: string; data: { user: { _id: string; isActive: boolean } } }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/unban`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to unban user' }));
      throw new Error(error.message || 'Failed to unban user');
    }

    return response.json();
  },

  // Get users list (mock for now, replace with actual API when available)
  getUsers: async (): Promise<{ success: boolean; data: { users: any[] } }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // TODO: Replace with actual API endpoint when available
    // For now, return mock data structure
    return Promise.resolve({
      success: true,
      data: {
        users: []
      }
    });
  },

  // Get pending refunds
  getPendingRefunds: async (): Promise<{ success: boolean; data: { refunds: any[] } }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // TODO: Replace with actual API endpoint when available
    // For now, return mock data structure
    return Promise.resolve({
      success: true,
      data: {
        refunds: []
      }
    });
  },

  // Process refund (Approve or Reject)
  processRefund: async (
    refundId: string,
    status: 'APPROVED' | 'REJECTED',
    adminNote?: string,
    externalRefundId?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      refund: {
        _id: string;
        status: string;
        adminNote?: string;
        externalRefundId?: string;
        processedByAdminId?: string;
        refundedAt?: string;
      };
    };
  }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/refunds/${refundId}/process`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        ...(adminNote && { adminNote }),
        ...(externalRefundId && { externalRefundId }),
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to process refund' }));
      throw new Error(error.message || 'Failed to process refund');
    }

    return response.json();
  },

  // Get revenue report
  getRevenueReport: async (
    startDate: string,
    endDate: string
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      period: {
        startDate: string;
        endDate: string;
        days: number;
      };
      summary: {
        totalGrossRevenue: number;
        totalNetRevenue: number;
        totalRefunds: number;
        totalInvoices: number;
        averageDailyRevenue: number;
        currency: string;
      };
      dailyDetails: Array<{
        date: string;
        grossRevenue: number;
        netRevenue: number;
        refunds: number;
        invoices: number;
      }>;
    };
  }> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/admin/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to get revenue report' }));
      throw new Error(error.message || 'Failed to get revenue report');
    }

    return response.json();
  },
};


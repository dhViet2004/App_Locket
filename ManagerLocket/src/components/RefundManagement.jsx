import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import Pagination from './common/Pagination';
import { Eye, CheckCircle, XCircle, RotateCcw, FileText } from 'lucide-react';

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

export default function RefundManagement({ onBack }) {
  const isDarkMode = useDarkMode();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // ... (keep other state for modal logic if needed, simplified for brevity in this step)
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ adminNote: '', externalRefundId: '' });

  useEffect(() => {
    loadRefunds();
  }, [page]);

  const loadRefunds = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPendingRefunds();
      // Mock pagination
      const allRefunds = response.data?.refunds || response.refunds || [];
      setTotal(allRefunds.length);
      setTotalPages(Math.ceil(allRefunds.length / limit));
      setRefunds(allRefunds.slice((page - 1) * limit, page * limit));
    } catch (err) {
      console.error('Failed to load refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  // ... (keep handleViewAndProcess, handleCloseModal, handleApprove, handleReject logic)
  const handleViewAndProcess = (refund) => {
    setSelectedRefund(refund);
    setFormData({ adminNote: '', externalRefundId: '' });
    setIsModalOpen(true);
  };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedRefund(null); };

  const handleApprove = async () => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      await adminAPI.processRefund(selectedRefund._id, 'APPROVED', formData.adminNote, formData.externalRefundId);
      loadRefunds();
      handleCloseModal();
    } catch (e) { setError('Failed'); } finally { setProcessing(false); }
  };

  const handleReject = async () => {
    if (!selectedRefund) return;
    setProcessing(true);
    try {
      await adminAPI.processRefund(selectedRefund._id, 'REJECTED', formData.adminNote);
      loadRefunds();
      handleCloseModal();
    } catch (e) { setError('Failed'); } finally { setProcessing(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Refund Management</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Requests & Approvals</p>
        </div>
        <div className={`flex items-center gap-3 ${isDarkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-orange-100 border-orange-200'} px-4 py-2 rounded-xl border transition-colors`}>
          <span className={`text-sm font-bold ${isDarkMode ? 'text-orange-500' : 'text-orange-600'} transition-colors`}>Pending:</span>
          <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>{total}</span>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
        {loading ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading refunds...</div>
        ) : refunds.length === 0 ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} italic transition-colors`}>
            No refund requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                  <th className="px-6 py-5">Refund ID</th>
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Invoice</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                {refunds.map((refund) => (
                  <tr key={refund._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                    <td className={`px-6 py-4 font-mono text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>{refund._id?.slice(-8)}...</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>{refund.user?.displayName || refund.user?.username || 'N/A'}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>{refund.user?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-mono text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>{refund.invoiceId?.slice(-8)}...</div>
                        {refund.invoice?.planName && (
                          <div className={`text-xs font-bold ${isDarkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-100'} inline-block px-1.5 py-0.5 rounded mt-1 transition-colors`}>{refund.invoice.planName}</div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>
                      {formatCurrency(refund.amount, refund.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md ${refund.status === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : refund.status === 'APPROVED'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium text-xs transition-colors`}>
                      {formatDate(refund.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {refund.status === 'PENDING' && (
                        <button
                          onClick={() => handleViewAndProcess(refund)}
                          className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
                        >
                          Process
                        </button>
                      )}
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

      {/* Process Refund Modal */}
      {isModalOpen && selectedRefund && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={handleCloseModal}
        >
          <div
            className={`${isDarkMode ? 'bg-[#151A25] border-gray-800' : 'bg-white border-gray-200'} rounded-2xl border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in transition-colors`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-2 transition-colors`}>
                Process Refund Request
              </h2>
              <button onClick={handleCloseModal} className={`${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className={`col-span-2 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800' : 'bg-gray-50 border-gray-200'} p-4 rounded-xl border transition-colors`}>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Amount to Refund</label>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>{formatCurrency(selectedRefund.amount, selectedRefund.currency)}</div>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>User</label>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{selectedRefund.user?.displayName || 'N/A'}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>{selectedRefund.user?.email}</div>
                </div>
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Plan</label>
                  <div className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{selectedRefund.invoice?.planName || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Reason by User</label>
                  <div className={`p-4 ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-200'} rounded-xl text-sm italic border transition-colors`}>
                    "{selectedRefund.reasonByUser}"
                  </div>
                </div>
              </div>

              <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}>
                <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wide transition-colors`}>Admin Action</h3>
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mb-2 transition-colors`}>
                    Admin Note
                  </label>
                  <textarea
                    value={formData.adminNote}
                    onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
                    placeholder="Enter your note..."
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all`}
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className={`flex justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-800 bg-[#0B0E14]/50' : 'border-gray-200 bg-gray-50'} transition-colors`}>
              <button
                onClick={handleCloseModal}
                disabled={processing}
                className={`px-6 py-2.5 text-sm font-bold ${isDarkMode ? 'text-gray-400 bg-[#1E2532] hover:bg-gray-700' : 'text-gray-600 bg-gray-200 hover:bg-gray-300'} rounded-xl transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={processing}
                className="px-6 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

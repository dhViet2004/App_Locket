import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import Pagination from '../components/common/Pagination';
import {
  FileCheck,
  ArrowLeft,
  Eye
} from 'lucide-react';

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

export default function AuditLogsPage() {
  const isDarkMode = useDarkMode();
  const { id } = useParams();
  const [logs, setLogs] = useState([]);
  const [logDetail, setLogDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [filters, setFilters] = useState({
    actionType: '',
    targetResource: '',
  });

  useEffect(() => {
    if (id) {
      loadLogDetail(id);
    } else {
      loadLogs();
    }
  }, [id, page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAuditLogs({
        page,
        limit,
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.targetResource && { targetResource: filters.targetResource }),
      });
      setLogs(response.data.items || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotal(response.data.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogDetail = async (logId) => {
    setLoading(true);
    try {
      const response = await adminAPI.getAuditLogById(logId);
      setLogDetail(response.data);
    } catch (error) {
      console.error('Failed to load log detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (actionType) => {
    switch (actionType) {
      case 'CREATE': return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'BAN': return 'bg-orange-500/10 text-orange-500 border border-orange-500/20';
      default: return 'bg-gray-700/30 text-gray-400 border border-gray-700/50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (id && logDetail) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/audit-logs"
            className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-[#151A25] text-gray-400 hover:text-white border-gray-800' : 'bg-gray-100 text-gray-600 hover:text-gray-900 border-gray-300'} rounded-xl border transition-all font-bold text-sm transition-colors`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Logs
          </Link>
        </div>

        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden p-8 shadow-xl transition-colors`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-3 transition-colors`}>
            <FileCheck className="w-8 h-8 text-blue-500" />
            Log Detail <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-lg font-normal transition-colors`}>#{logDetail._id}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Action Type</label>
                <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${getActionBadgeColor(logDetail.actionType)}`}>
                  {logDetail.actionType}
                </span>
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Resource</label>
                <div className={`text-lg font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{logDetail.targetResource}</div>
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Target ID</label>
                <div className={`font-mono text-sm ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-700'} p-2 rounded border transition-colors`}>{logDetail.targetId}</div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Admin</label>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-[#1E2532] border-gray-700' : 'bg-gray-100 border-gray-300'} flex items-center justify-center text-blue-500 font-bold text-xs border transition-colors`}>
                    {(logDetail.adminId?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{logDetail.adminId?.username || logDetail.adminId || 'System'}</span>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-1 transition-colors`}>Timestamp</label>
                <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium transition-colors`}>{formatDate(logDetail.createdAt)}</div>
              </div>
            </div>
          </div>

          {logDetail.details && (
            <div className="mt-8">
              <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Additional Details</label>
              <pre className={`${isDarkMode ? 'bg-[#0B0E14] text-gray-300 border-gray-800' : 'bg-gray-50 text-gray-700 border-gray-300'} p-4 rounded-xl border overflow-x-auto text-sm font-mono transition-colors`}>
                {JSON.stringify(logDetail.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Audit Logs</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>System Activity</p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <select
              value={filters.actionType}
              onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
              className={`px-4 py-2.5 ${isDarkMode ? 'bg-[#151A25] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer transition-colors`}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="BAN">Ban</option>
            </select>
          </div>

          <div>
            <select
              value={filters.targetResource}
              onChange={(e) => setFilters({ ...filters, targetResource: e.target.value })}
              className={`px-4 py-2.5 ${isDarkMode ? 'bg-[#151A25] border-gray-800 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-xl text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none cursor-pointer transition-colors`}
            >
              <option value="">All Resources</option>
              <option value="USER">User</option>
              <option value="POST">Post</option>
              <option value="PLAN">Plan</option>
              <option value="AD">Ad</option>
              <option value="REFUND">Refund</option>
            </select>
          </div>
        </div>
      </div>

      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
        {loading ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} italic transition-colors`}>
            No logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                  <th className="px-6 py-5 w-16">#</th>
                  <th className="px-6 py-5">Admin</th>
                  <th className="px-6 py-5">Action</th>
                  <th className="px-6 py-5">Resource</th>
                  <th className="px-6 py-5">Target ID</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                {logs.map((log, index) => (
                  <tr key={log._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium transition-colors`}>#{index + 1 + (page - 1) * limit}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-[#1E2532] border-gray-700 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-600'} flex items-center justify-center font-bold text-xs border transition-colors`}>
                          {(log.adminId?.username || 'S').charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{log.adminId?.username || log.adminId || 'System'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${getActionBadgeColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors`}>{log.targetResource}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-xs ${isDarkMode ? 'text-gray-500 bg-[#0B0E14] border-gray-800' : 'text-gray-600 bg-gray-50 border-gray-300'} px-2 py-1 rounded border transition-colors`}>{log.targetId?.substring(0, 8)}...</span>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium transition-colors`}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/audit-logs/${log._id}`}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${isDarkMode ? 'bg-[#1E2532] hover:bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'} transition-colors`}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
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
    </div>
  );
}

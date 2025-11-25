import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import AdManagementForm from '../components/AdManagementForm';
import Pagination from '../components/common/Pagination';
import { Edit, Play, Pause, Megaphone, Plus } from 'lucide-react';

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

export default function AdsPageNew() {
  const isDarkMode = useDarkMode();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadAds();
  }, [page]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAds();
      // Mock pagination for now as API might return all
      const allAds = response.data?.ads || [];
      setTotal(allAds.length);
      setTotalPages(Math.ceil(allAds.length / limit));
      setAds(allAds.slice((page - 1) * limit, page * limit));
    } catch (error) {
      console.error('Failed to load ads:', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adId, currentStatus) => {
    try {
      const newStatus = currentStatus ? 'PAUSED' : 'ACTIVE';
      await adminAPI.updateAdStatus(adId, newStatus);
      loadAds();
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  const calculateCTR = (ad) => {
    if (!ad.impressionCount || ad.impressionCount === 0) return 0;
    return ((ad.clickCount || 0) / ad.impressionCount * 100).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Ads Management</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Campaigns & Placements</p>
        </div>
        <button
          onClick={() => {
            setEditingAd(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-900/20"
        >
          <Plus className="w-5 h-5" />
          Create New Ad
        </button>
      </div>

      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
        {loading ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading ads...</div>
        ) : ads.length === 0 ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} italic transition-colors`}>
            No ads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                  <th className="px-6 py-5">Image</th>
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Placement</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Statistics</th>
                  <th className="px-6 py-5">Priority</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                {ads.map((ad) => (
                  <tr key={ad._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                    <td className="px-6 py-4">
                      <div className={`w-20 h-14 rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700 bg-[#1E2532]' : 'border-gray-300 bg-gray-100'} flex items-center justify-center transition-colors`}>
                        {ad.imageUrl && ad.imageUrl.trim() ? (
                          <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover" onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }} />
                        ) : null}
                        <span className={`${ad.imageUrl && ad.imageUrl.trim() ? 'hidden' : 'flex'} items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-bold text-xl w-full h-full`}>
                          {(ad.name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} text-base transition-colors`}>{ad.name}</div>
                        {ad.title && <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-0.5 transition-colors`}>{ad.title}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                        {ad.placement}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-md ${ad.isActive
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : 'bg-gray-700/30 text-gray-400 border border-gray-700/50'
                          }`}
                      >
                        {ad.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium transition-colors`}>
                          Impressions: <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold transition-colors`}>{ad.impressionCount || 0}</span>
                        </div>
                        <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium transition-colors`}>
                          Clicks: <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-bold transition-colors`}>{ad.clickCount || 0}</span>
                        </div>
                        <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-medium transition-colors`}>
                          CTR: <span className="text-purple-400 font-bold">{calculateCTR(ad)}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors`}>{ad.priority || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(ad._id, ad.isActive)}
                          className={`p-2 rounded-lg transition-colors ${ad.isActive
                              ? isDarkMode 
                                ? 'bg-[#1E2532] text-gray-400 hover:text-white hover:bg-gray-700'
                                : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            }`}
                          title={ad.isActive ? 'Pause' : 'Activate'}
                        >
                          {ad.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => {
                            setEditingAd(ad);
                            setShowForm(true);
                          }}
                          className={`p-2 rounded-lg ${isDarkMode ? 'bg-[#1E2532] text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-200'} transition-colors`}
                          title="Edit Ad"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Ad Management Form Modal */}
      {showForm && (
        <AdManagementForm
          ad={editingAd}
          mode={editingAd ? 'edit' : 'create'}
          onClose={() => {
            setShowForm(false);
            setEditingAd(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingAd(null);
            loadAds();
          }}
          darkMode={isDarkMode}
        />
      )}
    </div>
  );
}

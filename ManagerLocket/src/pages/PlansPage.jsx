import { useState, useEffect } from 'react';
import { adminAPI } from '../lib/api';
import PlanEditForm from '../components/PlanEditForm';
import { CreditCard, Plus, Edit2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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

export default function PlansPage() {
  const isDarkMode = useDarkMode();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: 0,
    currency: 'VND',
    interval: 'month',
    intervalCount: 1,
    isActive: true,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPlans();
      setPlans(response.data?.plans || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createPlan(formData);
      setShowForm(false);
      loadPlans();
      setFormData({
        code: '',
        name: '',
        description: '',
        price: 0,
        currency: 'VND',
        interval: 'month',
        intervalCount: 1,
        isActive: true,
      });
    } catch (error) {
      console.error('Failed to create plan:', error);
    }
  };

  const handleToggleActive = async (planId, isActive) => {
    if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this plan?`)) return;
    try {
      if (isActive) {
        await adminAPI.deactivatePlan(planId);
      } else {
        await adminAPI.activatePlan(planId);
      }
      // Update local state instead of reloading
      setPlans(plans.map(plan => 
        plan._id === planId 
          ? { ...plan, isActive: !isActive }
          : plan
      ));
    } catch (error) {
      console.error('Failed to toggle plan:', error);
      alert('Failed to update plan status. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider transition-colors`}>Plans Management</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} mt-1 transition-colors`}>Subscription Packages</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null); // Close edit form if open
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-900/20"
        >
          {showForm ? 'Cancel' : 'Create Plan'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border p-6 animate-fade-in-up transition-colors relative z-10`}>
          <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center gap-2 transition-colors`}>
            Create New Plan
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  placeholder="e.g., PREMIUM_MONTHLY"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  placeholder="e.g., Premium Plan"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Price *</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all pl-8`}
                  />
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} font-bold transition-colors`}>₫</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Interval *</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Count *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.intervalCount}
                    onChange={(e) => setFormData({ ...formData, intervalCount: Number(e.target.value) })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={`block text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} uppercase tracking-wider mb-2 transition-colors`}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#0B0E14] border-gray-800 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} border rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                rows={3}
                placeholder="Describe the plan features..."
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-900/20"
              >
                Create Plan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Plans List */}
      <div className={`${isDarkMode ? 'bg-[#151A25] border-gray-800/50' : 'bg-white border-gray-200'} rounded-2xl border overflow-hidden shadow-xl transition-colors`}>
        {loading ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} transition-colors`}>Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className={`p-12 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-600'} italic transition-colors`}>
            No plans found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isDarkMode ? 'border-gray-800/50 text-gray-500' : 'border-gray-200 text-gray-600'} text-xs font-bold uppercase tracking-wider transition-colors`}>
                  <th className="px-6 py-5">Code</th>
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Interval</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-800/50' : 'divide-gray-200'} text-sm transition-colors`}>
                {plans.map((plan) => (
                  <tr key={plan._id} className={`${isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'} transition-colors group`}>
                    <td className={`px-6 py-4 font-mono ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} font-bold transition-colors`}>{plan.code}</td>
                    <td className={`px-6 py-4 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors`}>{plan.name}</td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium transition-colors`}>
                      {plan.price?.toLocaleString()} <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} transition-colors`}>{plan.currency || 'VND'}</span>
                    </td>
                    <td className={`px-6 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors`}>
                      Every {plan.intervalCount} {plan.interval}(s)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold ${plan.isActive
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-gray-700/30 text-gray-400 border border-gray-700/50'
                        }`}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => {
                            setShowForm(false); // Close create form if open
                            setEditingPlan(plan);
                          }}
                          className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-blue-400 bg-[#1E2532] hover:bg-gray-700' : 'text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-gray-200'} rounded-lg transition-colors`}
                          title="Edit Plan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(plan._id, plan.isActive)}
                          className={`p-2 rounded-lg transition-colors ${plan.isActive
                              ? isDarkMode 
                                ? 'text-red-500 bg-[#1E2532] hover:bg-red-500/10'
                                : 'text-red-600 bg-gray-100 hover:bg-red-50'
                              : isDarkMode
                                ? 'text-green-500 bg-[#1E2532] hover:bg-green-500/10'
                                : 'text-green-600 bg-gray-100 hover:bg-green-50'
                            }`}
                          title={plan.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {plan.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Edit Modal */}
      {editingPlan && (
        <PlanEditForm
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSuccess={() => {
            setEditingPlan(null);
            loadPlans();
          }}
          darkMode={isDarkMode}
        />
      )}
    </div>
  );
}

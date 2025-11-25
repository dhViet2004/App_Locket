import { useState } from 'react';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function FilterSortBar({ 
  filters = {}, 
  sortOptions = [],
  onFilterChange, 
  onSortChange,
  onReset 
}) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSortChange = (sortKey, direction) => {
    onSortChange({ key: sortKey, direction });
  };

  const handleReset = () => {
    onReset?.();
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== '' && v !== 'all' && v !== null && v !== undefined
  ).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          {filters.role !== undefined && (
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          )}

          {/* Status Filter */}
          {filters.status !== undefined && (
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          )}

          {/* Refund Status Filter */}
          {filters.refundStatus !== undefined && (
            <select
              value={filters.refundStatus || 'all'}
              onChange={(e) => handleFilterChange('refundStatus', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}

          {/* Ad Status Filter */}
          {filters.adStatus !== undefined && (
            <select
              value={filters.adStatus || 'all'}
              onChange={(e) => handleFilterChange('adStatus', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          )}

          {/* Placement Filter */}
          {filters.placement !== undefined && (
            <select
              value={filters.placement || 'all'}
              onChange={(e) => handleFilterChange('placement', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Placements</option>
              <option value="feed">Feed</option>
              <option value="splash">Splash Screen</option>
              <option value="banner">Banner</option>
            </select>
          )}

          {/* Date Range */}
          {filters.dateFrom !== undefined && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Sort Dropdown */}
          {sortOptions.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <select
                value={filters.sortBy || ''}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  handleSortChange(key, direction);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Sort by...</option>
                {sortOptions.map((option) => (
                  <option key={`${option.key}-asc`} value={`${option.key}-asc`}>
                    {option.label} (A-Z / Oldest)
                  </option>
                ))}
                {sortOptions.map((option) => (
                  <option key={`${option.key}-desc`} value={`${option.key}-desc`}>
                    {option.label} (Z-A / Newest)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Reset ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


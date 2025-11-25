import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({ page, totalPages, total, limit, onPageChange, darkMode = false }) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  // Styles based on mode
  const containerClass = darkMode ? "bg-transparent border-none" : "bg-white border-t border-gray-200";
  const textClass = darkMode ? "text-gray-400" : "text-gray-700";
  const buttonBaseClass = darkMode
    ? "relative inline-flex items-center px-4 py-2 border border-gray-800 text-sm font-medium rounded-lg bg-[#0B0E14] text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    : "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

  const activeButtonClass = darkMode
    ? "z-10 bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
    : "z-10 bg-indigo-50 border-indigo-500 text-indigo-600";

  const iconButtonClass = (rounded) => darkMode
    ? `relative inline-flex items-center px-2 py-2 border border-gray-800 bg-[#0B0E14] text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${rounded}`
    : `relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${rounded}`;

  const ellipsisClass = darkMode
    ? "relative inline-flex items-center px-4 py-2 border border-gray-800 bg-[#0B0E14] text-sm font-medium text-gray-500"
    : "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700";

  return (
    <div className={`flex items-center justify-between px-4 py-3 sm:px-0 ${containerClass}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className={buttonBaseClass}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className={`ml-3 ${buttonBaseClass}`}
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${textClass}`}>
            Showing <span className="font-bold text-white">{start}</span> to <span className="font-bold text-white">{end}</span> of{' '}
            <span className="font-bold text-white">{total}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-1" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className={iconButtonClass("rounded-l-lg")}
            >
              <span className="sr-only">First</span>
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={iconButtonClass("")}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getPageNumbers().map((pageNum, index) => (
              pageNum === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className={ellipsisClass}
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={page === pageNum ? `${buttonBaseClass} ${activeButtonClass}` : buttonBaseClass}
                >
                  {pageNum}
                </button>
              )
            ))}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={iconButtonClass("")}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
              className={iconButtonClass("rounded-r-lg")}
            >
              <span className="sr-only">Last</span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

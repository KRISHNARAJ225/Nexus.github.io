import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-t border-gray-50 dark:border-slate-800">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold text-gray-900 dark:text-white">{Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{Math.min(totalItems, currentPage * itemsPerPage)}</span> of{' '}
        <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {getPageNumbers().map((number) => (
            <button
              key={number}
              onClick={() => onPageChange(number)}
              className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all ${
                currentPage === number
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-800'
              }`}
            >
              {number}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

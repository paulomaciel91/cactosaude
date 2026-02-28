
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  // Always render the container for layout consistency, but conditionally render the nav part.
  
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const pageRangeDisplayed = 1; 
    const totalNumbers = (pageRangeDisplayed * 2) + 1;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageRangeDisplayed);
      const endPage = Math.min(totalPages - 1, currentPage + pageRangeDisplayed);

      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    } else {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  const buttonClass = "w-9 h-9 flex items-center justify-center leading-tight text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-white transition-colors";
  const activeClass = "z-10 w-9 h-9 flex items-center justify-center leading-tight text-white bg-primary border-primary rounded-full";
  const prevNextClass = "flex items-center gap-1 px-3 h-9 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-10 border-t border-gray-200 dark:border-gray-800 pt-6">
        {/* Left side */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
            <span>Exibindo</span>
            <select
                id="itemsPerPage"
                name="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="block w-auto rounded-md border-0 py-1.5 pl-3 pr-8 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-gray-800 transition-colors"
            >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="36">36</option>
                <option value="48">48</option>
            </select>
            <span>{`de ${totalItems} produtos`}</span>
        </div>

        {/* Right side */}
        {totalPages > 1 && (
            <nav aria-label="Pagination">
                <ul className="inline-flex items-center gap-2">
                    <li>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={prevNextClass}
                            aria-label="Página anterior"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Anterior</span>
                        </button>
                    </li>
                    <li className="flex items-center gap-2">
                    {pageNumbers.map((page, index) => (
                        <div key={`${page}-${index}`}>
                        {typeof page === 'number' ? (
                            <button
                            onClick={() => onPageChange(page)}
                            className={currentPage === page ? activeClass : buttonClass}
                            aria-current={currentPage === page ? 'page' : undefined}
                            >
                            {page}
                            </button>
                        ) : (
                            <span className="flex items-center justify-center px-1 h-9 leading-tight text-gray-500">
                            ...
                            </span>
                        )}
                        </div>
                    ))}
                    </li>
                    <li>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={prevNextClass}
                            aria-label="Próxima página"
                        >
                            <span className="hidden sm:inline">Próxima</span>
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    </li>
                </ul>
            </nav>
        )}
    </div>
  );
};

export default Pagination;


import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

interface FiltersProps {
  attributes: Record<string, string[]>; // { "Tamanho": ["P", "M"], "Cor": ["Azul"] }
  categories: string[];
  filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    // Dynamic filters will be stored here with a prefix or treated separately by the parent
    // For simplicity, we assume parent passes a generic object, but strict typing in CatalogPage manages it.
    [key: string]: string; 
  };
  onFilterChange: (key: string, value: string) => void;
}

const FilterSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 py-4 last:border-b-0">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left group">
        <h3 className="text-md font-semibold text-gray-800 dark:text-white capitalize group-hover:text-primary transition-colors">{title}</h3>
        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && (
        <div className="mt-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

const Filters: React.FC<FiltersProps> = ({ attributes, categories, filters, onFilterChange }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFilterChange(e.target.name, e.target.value);
  };
  
  const formElementClass = "block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm py-2.5 px-4 transition-colors duration-300";
  const formSelectClass = `${formElementClass} pr-10 appearance-none`;

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800 -mt-4">
      <FilterSection title="Preço" defaultOpen={true}>
        <div className="flex items-center space-x-2">
            <div>
              <label htmlFor="minPrice" className="sr-only">Preço Min</label>
              <input type="number" name="minPrice" id="minPrice" value={filters.minPrice || ''} onChange={handleInputChange} placeholder="Min" className={formElementClass} />
            </div>
            <span className="text-gray-400">-</span>
            <div>
              <label htmlFor="maxPrice" className="sr-only">Preço Max</label>
              <input type="number" name="maxPrice" id="maxPrice" value={filters.maxPrice || ''} onChange={handleInputChange} placeholder="Máx" className={formElementClass} />
            </div>
        </div>
      </FilterSection>

      {categories.length > 0 && (
        <FilterSection title="Categoria" defaultOpen={true}>
            <div className="relative">
              <select name="category" id="category" value={filters.category || ''} onChange={handleInputChange} className={formSelectClass}>
                  <option value="">Todas</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon className="w-5 h-5"/>
              </div>
            </div>
        </FilterSection>
      )}

      {/* Dynamic Attributes */}
      {Object.entries(attributes).map(([key, values]) => {
         // Cast to fix TS error 'unknown'
         const options = values as string[];
         if (!options || options.length === 0) return null;
         
         // Use the attribute key (e.g., "Tamanho", "Voltagem") as the filter name.
         // In CatalogPage, we need to handle this key correctly.
         const filterKey = `attr_${key}`;

         return (
            <FilterSection key={key} title={key} defaultOpen={true}>
                <div className="relative">
                    <select 
                        name={filterKey} 
                        id={filterKey} 
                        value={filters[filterKey] || ''} 
                        onChange={handleInputChange} 
                        className={formSelectClass}
                    >
                        <option value="">Todos</option>
                        {options.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <ChevronDownIcon className="w-5 h-5"/>
                    </div>
                </div>
            </FilterSection>
         );
      })}
    </div>
  );
};

export default Filters;

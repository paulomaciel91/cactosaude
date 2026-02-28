
import React, { useContext } from 'react';
import { StoreInfo } from '../types';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShoppingCartIcon, CactoStoreLogo, SearchIcon, AdjustmentsHorizontalIcon, XMarkIcon, SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  storeInfo: StoreInfo;
  onCartClick: () => void;
  onSearchClick: () => void; // For mobile to open search overlay
  onFilterClick: () => void;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ storeInfo, onCartClick, onSearchClick, onFilterClick, search, onSearchChange, onClearSearch }) => {
  const cartContext = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();

  if (!cartContext) return null;
  const { getCartItemCount } = cartContext;
  const itemCount = getCartItemCount();

  const logoUrl = typeof storeInfo.logo === 'string' ? storeInfo.logo : storeInfo.logo?.url;

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-20 transition-all duration-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-1.5 sm:py-2">
          {/* Left: Logo and Store Name */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${storeInfo.nome_loja} logo`} 
                className="h-14 sm:h-16 w-auto max-w-[200px] sm:max-w-[320px] rounded-lg object-contain flex-shrink-0" 
              />
            ) : (
              <CactoStoreLogo className="w-10 h-10 sm:w-14 sm:h-14 text-gray-800 dark:text-gray-200 flex-shrink-0" />
            )}
            <span className="block text-lg sm:text-2xl font-bold text-gray-800 dark:text-white tracking-tight truncate">{storeInfo.nome_loja}</span>
          </div>

          {/* Center: Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search-desktop"
                  value={search}
                  onChange={onSearchChange}
                  placeholder="Faça sua busca..."
                  className="block w-full rounded-full border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-12 pr-24 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
                 <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {search && (
                        <button onClick={onClearSearch} type="button" className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                             <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        onClick={onFilterClick}
                        type="button"
                        className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark dark:bg-primary text-white hover:bg-black dark:hover:bg-primary-dark transition-colors"
                        aria-label="Abrir filtros"
                    >
                        <AdjustmentsHorizontalIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
          </div>
          
          {/* Right: Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
             <button onClick={onSearchClick} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2">
                <SearchIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
            <button onClick={onCartClick} className="relative text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 p-2">
              <ShoppingCartIcon className="w-7 h-7 sm:w-8 sm:h-8" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center pointer-events-none ring-2 ring-white dark:ring-gray-900">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

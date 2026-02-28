
import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Stock, Promotion, StoreInfo, Banner } from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';
import supabaseService from '../services/supabaseService';
import Filters from '../components/Filters';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';
import CartSidebar from '../components/CartSidebar';
import Spinner from '../components/Spinner';
import NotFoundPage from './NotFoundPage';
import ConfigurationErrorPage from './ConfigurationErrorPage';
import { calculateDiscountedPrice } from '../utils/price';
import { XMarkIcon, ShoppingCartIcon, HomeIcon, SearchIcon, FunnelIcon, CactoStoreLogo, SunIcon, MoonIcon } from '../components/icons';
import { CartContext } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import BannerCarousel from '../components/BannerCarousel';
import FloatingActionButtons from '../components/FloatingActionButtons';
import FeaturedProducts from '../components/FeaturedProducts';
import Toast, { ToastMessage } from '../components/Toast';
import { hexToRgb, getVariantColor } from '../utils/theme';

// Types and Interfaces
// Using index signature to allow dynamic attribute filters (prefixed with 'attr_')
type FilterState = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  [key: string]: string;
};

interface Category {
  name: string;
  imageUrl: string | null;
}

// Helper to normalize attribute keys (e.g., "cor " -> "Cor", "armazenamento" -> "Armazenamento")
const normalizeAttributeKey = (key: string) => {
  if (!key) return '';
  const trimmed = key.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

const CategoryHighlights: React.FC<{ products: Product[]; selectedCategory: string; onSelectCategory: (category: string) => void; }> = ({ products, selectedCategory, onSelectCategory }) => {
  const categories = useMemo(() => {
    const categoryMap = new Map<string, string | null>();
    products.forEach(p => {
      if (p.categoria && !categoryMap.has(p.categoria)) {
        const productWithImage = products.find(prod => prod.categoria === p.categoria && prod.imagens && prod.imagens.length > 0);
        categoryMap.set(p.categoria, productWithImage?.imagens?.[0]?.url || null);
      }
    });
    const firstProductWithImage = products.find(p => p.imagens && p.imagens.length > 0);
    const firstProductImage = firstProductWithImage?.imagens?.[0]?.url || null;

    const allCategories: Category[] = Array.from(categoryMap, ([name, imageUrl]) => ({ name, imageUrl }));
    allCategories.unshift({ name: 'Todos', imageUrl: firstProductImage });
    return allCategories;
  }, [products]);

  if (categories.length <= 2) return null;

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Categorias</h2>
      <div className="flex overflow-x-auto lg:flex-wrap lg:overflow-visible space-x-4 lg:space-x-0 lg:gap-4 pb-2 -mx-4 sm:-mx-6 lg:mx-0 px-4 sm:px-6 lg:px-0 scrollbar-hide category-scroll-fade">
        {categories.map(category => (
          <div key={category.name} className="flex flex-col items-center flex-shrink-0 text-center w-20 lg:w-24 cursor-pointer group" onClick={() => onSelectCategory(category.name === 'Todos' ? '' : category.name)}>
            {/* Story Ring Container */}
            <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-full p-[2px] transition-all duration-300 transform group-hover:scale-105 ${(selectedCategory === category.name || (selectedCategory === '' && category.name === 'Todos'))
              ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'
              : 'bg-gray-200 dark:bg-gray-800 group-hover:bg-gray-300 dark:group-hover:bg-gray-700'
              }`}>
              <div className="bg-white dark:bg-gray-900 p-0.5 rounded-full w-full h-full border-2 border-white dark:border-gray-900">
                {category.imageUrl ? (
                  <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <CactoStoreLogo className="w-1/2 h-1/2 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </div>
            </div>
            <p className={`mt-2 text-xs font-medium truncate w-full transition-colors ${(selectedCategory === category.name || (selectedCategory === '' && category.name === 'Todos')) ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-600 dark:text-gray-400'}`}>{category.name}</p>
          </div>
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        .category-scroll-fade {
          -webkit-mask-image: linear-gradient(to right, black 95%, transparent 100%);
          mask-image: linear-gradient(to right, black 95%, transparent 100%);
        }
        @media (min-width: 1024px) {
          .category-scroll-fade {
            -webkit-mask-image: none;
            mask-image: none;
          }
        }
      `}</style>
    </div>
  );
};

const BottomNavBar: React.FC<{ onHomeClick: () => void; onSearchClick: () => void; onCartClick: () => void; }> = ({ onHomeClick, onSearchClick, onCartClick }) => {
  const cartContext = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();
  const itemCount = cartContext?.getCartItemCount() || 0;

  const navItemClass = "flex flex-col items-center justify-center h-full transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:text-primary focus:outline-none focus:text-primary";

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 grid grid-cols-4 z-20 lg:hidden">
      <button onClick={onHomeClick} className={navItemClass}>
        <HomeIcon className="w-6 h-6" />
        <span className="text-xs font-medium mt-1">Início</span>
      </button>

      <button onClick={onSearchClick} className={navItemClass}>
        <SearchIcon className="w-6 h-6" />
        <span className="text-xs font-medium mt-1">Buscar</span>
      </button>

      <button onClick={toggleTheme} className={navItemClass}>
        {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        <span className="text-xs font-medium mt-1">{theme === 'light' ? 'Escuro' : 'Claro'}</span>
      </button>

      <button onClick={onCartClick} className={navItemClass}>
        <div className="relative">
          <ShoppingCartIcon className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center pointer-events-none ring-2 ring-white dark:ring-gray-900">
              {itemCount}
            </span>
          )}
        </div>
        <span className="text-xs font-medium mt-1">Carrinho</span>
      </button>
    </div>
  );
};

const FilterSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  attributes: Record<string, string[]>;
  categories: string[];
  filters: FilterState;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}> = ({ isOpen, onClose, onClearFilters, onApplyFilters, ...filterProps }) => (
  <>
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
    <div className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
      <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Filtros</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
      </div>
      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          <Filters {...filterProps} />
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 gap-4 shrink-0">
        <button onClick={onClearFilters} className="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
          Limpar
        </button>
        <button onClick={onApplyFilters} className="w-full py-3 px-4 rounded-lg bg-gray-800 dark:bg-primary text-white font-semibold text-center transition-colors hover:bg-black dark:hover:bg-primary-dark">
          Aplicar filtros
        </button>
      </div>
    </div>
  </>
);

const SearchOverlay: React.FC<{ isOpen: boolean; onClose: () => void; search: string; onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onClearSearch: () => void; }> = ({ isOpen, onClose, search, onSearchChange, onClearSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 animate-fadeIn lg:hidden" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 p-4" onClick={e => e.stopPropagation()}>
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              ref={inputRef}
              type="search"
              name="search"
              id="search-mobile"
              value={search}
              onChange={onSearchChange}
              placeholder="Faça sua busca..."
              className="block w-full rounded-full border-0 bg-gray-100 dark:bg-gray-800 py-3 pl-11 pr-11 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            />
            {search && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <button onClick={onClearSearch} type="button" className="-m-2 p-2 text-gray-400 hover:text-gray-500">
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Page Component
const CatalogPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const cartContext = useContext(CartContext);

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isStoreActive, setIsStoreActive] = useState(true);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [filters, setFilters] = useState<FilterState>({ search: '', category: '', minPrice: '', maxPrice: '' });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);


  useEffect(() => {
    if (slug && cartContext) {
      cartContext.initializeCartForStore(slug);
    }
  }, [slug, cartContext]);

  useEffect(() => {
    if (!slug || !isSupabaseConfigured) { setLoading(false); return; };
    const fetchData = async () => {
      try {
        setLoading(true); setError(false);

        const isActive = await supabaseService.getStoreStatus(slug);
        if (!isActive) {
          setIsStoreActive(false);
          setLoading(false);
          return;
        }

        const [infoData, productsData, stockData, promotionsData] = await Promise.all([
          supabaseService.getStoreInfo(slug), supabaseService.getProducts(slug),
          supabaseService.getStock(slug), supabaseService.getPromotions(slug),
        ]);
        if (!infoData) { setError(true); return; }
        setStoreInfo(infoData); setProducts(productsData);
        setStock(stockData); setPromotions(promotionsData);
      } catch (e) {
        console.error("Failed to fetch store data:", e); setError(true);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [slug]);

  // Apply Store Theme Colors
  useEffect(() => {
    if (!storeInfo) return;
    const root = document.documentElement;

    // Apply Primary Color
    if (storeInfo.cor_primaria) {
      const rgb = hexToRgb(storeInfo.cor_primaria);
      if (rgb) {
        root.style.setProperty('--color-primary', rgb);
        // Generate variants
        const dark = getVariantColor(storeInfo.cor_primaria, -10); // 10% darker
        const light = getVariantColor(storeInfo.cor_primaria, 10); // 10% lighter
        if (dark) root.style.setProperty('--color-primary-dark', dark);
        if (light) root.style.setProperty('--color-primary-light', light);
      }
    } else {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-dark');
      root.style.removeProperty('--color-primary-light');
    }

    // Apply Secondary Color
    if (storeInfo.cor_secundaria) {
      const rgb = hexToRgb(storeInfo.cor_secundaria);
      if (rgb) {
        root.style.setProperty('--color-secondary', rgb);
        const dark = getVariantColor(storeInfo.cor_secundaria, -10); // 10% darker
        if (dark) root.style.setProperty('--color-secondary-dark', dark);
      }
    } else {
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-secondary-dark');
    }

    return () => {
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-primary-dark');
      root.style.removeProperty('--color-primary-light');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-secondary-dark');
    };

  }, [storeInfo]);

  useEffect(() => {
    if (storeInfo?.nome_loja) {
      document.title = storeInfo.nome_loja;
    }
    return () => {
      document.title = 'CactoVendas';
    };
  }, [storeInfo]);

  useEffect(() => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) return;

    const originalFavicon = favicon.getAttribute('href');

    const logoUrl = typeof storeInfo?.logo === 'object' && storeInfo.logo?.url
      ? storeInfo.logo.url
      : typeof storeInfo?.logo === 'string' ? storeInfo.logo : null;

    if (logoUrl) {
      favicon.setAttribute('href', logoUrl);
    }

    return () => {
      if (originalFavicon) {
        favicon.setAttribute('href', originalFavicon);
      }
    };
  }, [storeInfo]);

  useEffect(() => {
    if (isFilterOpen) {
      setTempFilters(filters);
    }
  }, [isFilterOpen, filters]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  const banners = useMemo((): Banner[] => {
    const desktopBannersSource = storeInfo?.banner_imagem_desktop_url;
    const mobileBannersSource = storeInfo?.banner_imagem_mobile_url;
    const linkUrl = storeInfo?.banner_link_url;

    const getUrls = (source: { url: string }[] | string | null | undefined): string[] => {
      if (!source) return [];
      if (typeof source === 'string') return [source];
      if (Array.isArray(source)) return source.map(item => item.url).filter(Boolean);
      return [];
    };

    const desktopUrls = getUrls(desktopBannersSource);
    const mobileUrls = getUrls(mobileBannersSource);

    const numBanners = Math.max(desktopUrls.length, mobileUrls.length);
    if (numBanners === 0) return [];

    const resultBanners: Banner[] = [];
    for (let i = 0; i < numBanners; i++) {
      const desktopUrl = desktopUrls[i];
      const mobileUrl = mobileUrls[i];

      if (desktopUrl || mobileUrl) {
        resultBanners.push({
          imagem_desktop_url: desktopUrl || mobileUrl!,
          imagem_mobile_url: mobileUrl || desktopUrl!,
          link_url: linkUrl,
        });
      }
    }

    return resultBanners;
  }, [storeInfo]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleTempFilterChange = useCallback((key: string, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilters(tempFilters);
    setIsFilterOpen(false);
  }, [tempFilters]);

  const handleClearTempFilters = useCallback(() => {
    setTempFilters({ search: '', category: '', minPrice: '', maxPrice: '' });
  }, []);

  const handleRawFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleFilterChange(name, value);
  };

  const handleClearSearch = useCallback(() => handleFilterChange('search', ''), [handleFilterChange]);

  const handleCategorySelect = useCallback((category: string) => {
    const newFilters = { ...filters, category };
    setFilters(newFilters);
    setTempFilters(newFilters);
  }, [filters]);

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = useCallback(() => {
    if (window.innerWidth < 1024) { // lg breakpoint
      setIsSearchOpen(true);
    } else {
      document.getElementById('search-desktop')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleCategoriesClick = useCallback(() => {
    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleFilterClick = useCallback(() => {
    setIsFilterOpen(true);
  }, []);

  const scrollToProductList = () => {
    const productListElement = document.getElementById('product-list-section');
    if (productListElement) {
      const headerOffset = 90;
      const elementPosition = productListElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToProductList();
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    scrollToProductList();
  };

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleQuickAdd = useCallback((product: Product) => {
    if ((product.chaves_atributos && product.chaves_atributos.length > 0)) {
      // If product has attributes, must open modal to select them
      setSelectedProduct(product);
      addToast(`Selecione as opções para ${product.nome}`, 'info');
    } else {
      // Simple product, add directly to cart
      if (cartContext) {
        cartContext.addToCart({
          produto_id: product.produto_id,
          nome: product.nome,
          categoria: product.categoria, // Pass Category here
          imagem: product.imagens?.[0]?.url,
          atributos: {},
          preco_unitario: calculateDiscountedPrice(product, promotions),
          preco_original: product.preco
        }, 1, 9999);
        addToast(`${product.nome} adicionado ao carrinho!`, 'success');
        setIsCartOpen(true);
      }
    }
  }, [cartContext, promotions, addToast]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const discountedPrice = calculateDiscountedPrice(product, promotions);
      const searchLower = filters.search.toLowerCase();

      // Basic Filters
      if (filters.search && !product.nome.toLowerCase().includes(searchLower) && !(product.descricao || '').toLowerCase().includes(searchLower)) return false;
      if (filters.category && product.categoria !== filters.category) return false;
      if (filters.minPrice && discountedPrice < parseFloat(filters.minPrice)) return false;
      if (filters.maxPrice && discountedPrice > parseFloat(filters.maxPrice)) return false;

      // Dynamic Attribute Filters
      // Look for keys in `filters` that start with "attr_"
      const attributeFilters = (Object.entries(filters) as [string, string][]).filter(([k, v]) => k.startsWith('attr_') && v);

      if (attributeFilters.length > 0) {
        const hasMatchingStock = stock.some(s => {
          if (s.produto_id !== product.produto_id || !s.quantidade || s.quantidade <= 0) return false;

          // Check if stock item satisfies ALL active attribute filters (Case Insensitive Key Match)
          return attributeFilters.every(([key, filterValue]) => {
            const filterAttrName = key.replace('attr_', ''); // This is the Normalized Key (e.g. "Cor")
            const stockAttrs = s.atributos || {};

            // Find the actual key in stockAttrs that matches filterAttrName (case-insensitive)
            const actualStockKey = Object.keys(stockAttrs).find(k =>
              k.toLowerCase() === filterAttrName.toLowerCase() ||
              normalizeAttributeKey(k) === filterAttrName
            );

            if (!actualStockKey) return false; // Attribute not found in this stock item
            return stockAttrs[actualStockKey] === filterValue;
          });
        });
        if (!hasMatchingStock) return false;
      }

      return true;
    });
  }, [products, stock, promotions, filters]);

  // Aggregate available attributes from stock for the Filter sidebar
  const availableAttributes = useMemo(() => {
    const attrs: Record<string, Set<string>> = {};

    stock.forEach(s => {
      if (s.atributos && s.quantidade && s.quantidade > 0) {
        Object.entries(s.atributos).forEach(([key, value]) => {
          // Normalize keys to group "cor" and "Cor" together
          const normalizedKey = normalizeAttributeKey(key);

          if (!attrs[normalizedKey]) attrs[normalizedKey] = new Set();
          attrs[normalizedKey].add(value as string);
        });
      }
    });

    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    Object.keys(attrs).sort().forEach(key => {
      result[key] = Array.from(attrs[key]).sort();
    });
    return result;
  }, [stock]);

  const filterOptions = useMemo(() => ({
    attributes: availableAttributes,
    categories: [...new Set(products.filter(p => p.categoria).map(p => p.categoria as string))] as string[],
  }), [availableAttributes, products]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredProducts, currentPage, itemsPerPage]);


  if (!isSupabaseConfigured) return <ConfigurationErrorPage />;
  if (!isStoreActive) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center text-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-800 animate-fadeIn">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XMarkIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loja Indisponível</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Esta loja encontra-se temporariamente desativada ou indisponível no momento.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            Voltar para CactoVendas
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center transition-colors duration-300"><Spinner /></div>;
  if (error || !storeInfo) return <NotFoundPage />;

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
        <Header
          storeInfo={storeInfo}
          onCartClick={() => setIsCartOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          onFilterClick={() => setIsFilterOpen(true)}
          search={filters.search}
          onSearchChange={handleRawFilterChange}
          onClearSearch={handleClearSearch}
        />

        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 pb-24">
          <BannerCarousel banners={banners} />

          <div id="categories-section">
            <CategoryHighlights products={products} selectedCategory={filters.category} onSelectCategory={handleCategorySelect} />
          </div>

          <FeaturedProducts
            products={products.filter(p => p.destaque)}
            promotions={promotions}
            onProductClick={setSelectedProduct}
            onQuickAdd={handleQuickAdd}
          />

          <div id="product-list-section">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {filters.category || 'Todos os Produtos'}
              </h2>
              <button
                onClick={handleFilterClick}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 active:bg-gray-300 dark:active:bg-gray-700 transition-colors lg:hidden"
                aria-label="Abrir filtros"
              >
                <FunnelIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <ProductList
            products={currentProducts}
            promotions={promotions}
            onProductClick={setSelectedProduct}
            onQuickAdd={handleQuickAdd}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />

        </main >

        <Footer
          storeInfo={storeInfo}
          onSearchClick={handleSearchClick}
          onCategoriesClick={handleCategoriesClick}
          onFilterClick={handleFilterClick}
        />

        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} search={filters.search} onSearchChange={handleRawFilterChange} onClearSearch={handleClearSearch} />
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          attributes={filterOptions.attributes}
          categories={filterOptions.categories}
          filters={tempFilters}
          onFilterChange={handleTempFilterChange}
          onClearFilters={handleClearTempFilters}
          onApplyFilters={handleApplyFilters}
        />

        {selectedProduct && <ProductModal product={selectedProduct} stock={stock} promotions={promotions} onClose={() => setSelectedProduct(null)} />}
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} storeInfo={storeInfo} stock={stock} promotions={promotions} />
        <BottomNavBar
          onHomeClick={handleHomeClick}
          onSearchClick={handleSearchClick}
          onCartClick={() => setIsCartOpen(true)}
        />
        <FloatingActionButtons whatsappNumber={storeInfo.telefone} showWhatsApp={storeInfo.plano !== 'start'} />
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <div className="pointer-events-auto">
            {toasts.map(toast => (
              <Toast key={toast.id} toast={toast} onClose={removeToast} />
            ))}
          </div>
        </div>
      </div >
    </>
  );
};

export default CatalogPage;

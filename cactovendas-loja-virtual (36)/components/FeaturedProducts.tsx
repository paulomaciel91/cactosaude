import React, { useRef } from 'react';
import { Product, Promotion } from '../types';
import ProductCard from './ProductCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface FeaturedProductsProps {
  products: Product[];
  promotions: Promotion[];
  onProductClick: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, promotions, onProductClick, onQuickAdd }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Approx one card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-12 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 relative group/carousel transition-colors duration-300">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">✨ Destaques da Loja</h2>
      </div>

      <div className="relative">
        {/* Desktop Left Button */}
        <button 
            onClick={() => scroll('left')} 
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 w-10 h-10 bg-white dark:bg-gray-800 shadow-md rounded-full items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary hover:scale-110 transition-all border border-gray-100 dark:border-gray-700"
            aria-label="Anterior"
        >
            <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto space-x-4 pb-4 -mx-2 px-2 scrollbar-hide snap-x scroll-smooth"
        >
            {products.map(product => (
            <div key={product.produto_id} className="w-48 sm:w-64 flex-shrink-0 snap-start">
                <ProductCard
                product={product}
                promotions={promotions}
                onClick={() => onProductClick(product)}
                onQuickAdd={onQuickAdd ? () => onQuickAdd(product) : undefined}
                />
            </div>
            ))}
        </div>

        {/* Desktop Right Button */}
        <button 
            onClick={() => scroll('right')} 
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 w-10 h-10 bg-white dark:bg-gray-800 shadow-md rounded-full items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary hover:scale-110 transition-all border border-gray-100 dark:border-gray-700"
            aria-label="Próximo"
        >
            <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
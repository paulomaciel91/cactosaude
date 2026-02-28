
import React from 'react';
import { Product, Promotion } from '../types';
import { calculateDiscountedPrice, getBestPromotion } from '../utils/price';
import { PhotoIcon, ShoppingCartIcon } from './icons';

interface ProductCardProps {
  product: Product;
  promotions: Promotion[];
  onClick: () => void;
  onQuickAdd?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, promotions, onClick, onQuickAdd }) => {
  const discountedPrice = calculateDiscountedPrice(product, promotions);
  const bestPromo = getBestPromotion(product, promotions);
  const hasDiscount = discountedPrice < product.preco;
  
  // Calculate discount percentage
  const discountPercentage = hasDiscount 
    ? Math.round(((product.preco - discountedPrice) / product.preco) * 100) 
    : 0;

  const imageUrl = product.imagens?.[0]?.url;

  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200/80 dark:border-gray-800 transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/5 flex flex-col h-full group relative"
    >
      <div className="relative cursor-pointer" onClick={onClick}>
        {/* Badges Container */}
        <div className="absolute top-2 left-2 right-2 flex justify-between z-10 pointer-events-none">
            {/* Left: Discount Badge */}
            <div>
              {hasDiscount && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  -{discountPercentage}%
                </span>
              )}
            </div>

            {/* Right: Featured Badge */}
            <div>
              {product.destaque && (
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Destaque
                </span>
              )}
            </div>
        </div>

        <div className="aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          {imageUrl ? (
            <img 
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
              src={imageUrl} 
              alt={product.nome} 
            />
          ) : (
            <PhotoIcon className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          )}
        </div>
        
        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd();
            }}
            className="absolute bottom-3 right-3 w-10 h-10 bg-white dark:bg-gray-800 text-primary rounded-full shadow-lg flex items-center justify-center transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white z-20"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingCartIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate flex-grow">{product.nome}</h3>
        
        {/* Price and Promotion Section */}
        <div className="mt-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            {hasDiscount && (
              <span className="text-gray-400 dark:text-gray-500 line-through text-xs">
                R$ {product.preco.toFixed(2).replace('.', ',')}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              R$ {discountedPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          {hasDiscount && bestPromo?.nome && (
            <div className="mt-1">
              <span className="inline-block bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded border border-green-200 dark:border-green-900/30 uppercase tracking-wide">
                {bestPromo.nome}
              </span>
            </div>
          )}
        </div>

         <button onClick={onClick} className="mt-4 w-full bg-secondary text-white py-2.5 px-4 rounded-lg font-bold text-sm hover:bg-secondary-dark transition-all transform hover:scale-105">
              Comprar
        </button>
      </div>
    </div>
  );
};

export default ProductCard;


import React from 'react';
import { Product, Promotion } from '../types';
import ProductCard from './ProductCard';

interface ProductListProps {
  products: Product[];
  promotions: Promotion[];
  onProductClick: (product: Product) => void;
  onQuickAdd?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, promotions, onProductClick, onQuickAdd }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">Nenhum produto encontrado</h2>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Tente ajustar seus filtros de busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map(product => (
        <ProductCard 
          key={product.produto_id} 
          product={product} 
          promotions={promotions}
          onClick={() => onProductClick(product)}
          onQuickAdd={onQuickAdd ? () => onQuickAdd(product) : undefined}
        />
      ))}
    </div>
  );
};

export default ProductList;
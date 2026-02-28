import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 h-full flex flex-col">
      <div className="aspect-square w-full bg-gray-100 animate-pulse" />
      <div className="p-4 flex flex-col gap-3 flex-grow">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full mt-auto rounded-lg" />
      </div>
    </div>
  );
};

export const CatalogSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
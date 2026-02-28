import React from 'react';
import { StoreInfo } from '../types';
import { CactoStoreLogo } from './icons';

interface StoreHeroProps {
  storeInfo: StoreInfo;
}

const StoreHero: React.FC<StoreHeroProps> = ({ storeInfo }) => {
  const logoUrl = typeof storeInfo.logo === 'string' ? storeInfo.logo : storeInfo.logo?.url;

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${storeInfo.nome_loja} logo`}
            className="h-16 w-16 rounded-lg object-contain bg-gray-100 dark:bg-gray-800 p-1 flex-shrink-0"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 p-2 flex items-center justify-center flex-shrink-0">
            <CactoStoreLogo className="w-10 h-10 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {storeInfo.nome_loja}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default StoreHero;
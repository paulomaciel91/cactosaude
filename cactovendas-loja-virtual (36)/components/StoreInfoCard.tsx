import React from 'react';
import { StoreInfo } from '../types';
import { MapPinIcon, PhoneIcon } from './icons';

interface StoreInfoCardProps {
  storeInfo: StoreInfo;
}

const StoreInfoCard: React.FC<StoreInfoCardProps> = ({ storeInfo }) => {
  const { cidade, estado, telefone } = storeInfo;
  
  const hasLocation = cidade && estado;
  const hasPhone = telefone;

  if (!hasLocation && !hasPhone) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Informações da Loja</h3>
      <div className="space-y-3 text-sm">
        {hasLocation && (
          <div className="flex items-start text-gray-600 dark:text-gray-400">
            <MapPinIcon className="w-5 h-5 mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span>{cidade}, {estado}</span>
          </div>
        )}
        {hasPhone && (
          <div className="flex items-start text-gray-600 dark:text-gray-400">
            <PhoneIcon className="w-5 h-5 mr-3 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <a href={`tel:${telefone}`} className="hover:text-primary hover:underline">{telefone}</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInfoCard;
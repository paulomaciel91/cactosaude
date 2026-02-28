
import React from 'react';
import { XMarkIcon } from './icons';

interface ImageZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImageZoomModal: React.FC<ImageZoomModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4 animate-fadeIn" 
      onClick={onClose}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Fechar zoom"
      >
        <XMarkIcon className="w-8 h-8" />
      </button>
      <div 
        className="relative max-w-full max-h-full" 
        onClick={e => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt="Visualização ampliada do produto" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageZoomModal;

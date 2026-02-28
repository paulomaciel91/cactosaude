
import React from 'react';
import { Link } from 'react-router-dom';
import { StoreInfo } from '../types';
import { PhoneIcon, InstagramIcon, FacebookIcon, ClockIcon, MapPinIcon, TikTokIcon, YouTubeIcon } from './icons';

interface FooterProps {
  storeInfo: StoreInfo | null;
  onSearchClick?: () => void;
  onCategoriesClick?: () => void;
  onFilterClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ storeInfo, onSearchClick, onCategoriesClick, onFilterClick }) => {
  if (!storeInfo) return null;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone; // Fallback for other formats
  };

  const navLinkClass = "text-gray-600 dark:text-gray-400 hover:text-primary mb-2";

  const fullAddress = [storeInfo.endereco, storeInfo.cidade, storeInfo.estado].filter(Boolean).join(', ');

  return (
    <footer id="store-footer" className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 mt-auto transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center md:text-left">
          {/* Coluna 1: Navegação */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Navegação</h3>
            <button onClick={handleScrollToTop} className={navLinkClass}>Voltar ao início</button>
            <button onClick={onSearchClick} className={navLinkClass}>Busca</button>
            <button onClick={onCategoriesClick} className={navLinkClass}>Categorias</button>
            <button onClick={onFilterClick} className={navLinkClass}>Filtros</button>
          </div>

          {/* Coluna 2: Atendimento */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Atendimento ao Cliente</h3>
            {storeInfo.telefone && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3 justify-center md:justify-start">
                <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <a href={`tel:${storeInfo.telefone}`} className="hover:text-primary">{formatPhoneNumber(storeInfo.telefone)}</a>
              </div>
            )}
            {storeInfo.email && (
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3 justify-center md:justify-start">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                <a href={`mailto:${storeInfo.email}`} className="hover:text-primary">{storeInfo.email}</a>
              </div>
            )}
             {storeInfo.horario_atendimento && (
                <div className="mt-4">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3">Horário de Atendimento</h3>
                    <div className="flex items-start text-gray-600 dark:text-gray-400 justify-center md:justify-start">
                        <ClockIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="whitespace-pre-wrap">{storeInfo.horario_atendimento}</p>
                    </div>
                </div>
            )}
          </div>

          {/* Coluna 3: Endereço e Redes Sociais */}
          <div className="flex flex-col items-center md:items-start">
            {fullAddress && (
                <div className="mb-8 w-full">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-3">Endereço</h3>
                    <div className="flex items-start text-gray-600 dark:text-gray-400 justify-center md:justify-start">
                        <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors whitespace-pre-wrap"
                        >
                            {fullAddress}
                        </a>
                    </div>
                </div>
            )}

            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Nos siga nas redes sociais</h3>
            <div className="flex space-x-4">
                {storeInfo.instagram_url && (
                    <a href={storeInfo.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:scale-110">
                        <InstagramIcon className="w-8 h-8" />
                    </a>
                )}
                {storeInfo.facebook_url && (
                    <a href={storeInfo.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:scale-110">
                        <FacebookIcon className="w-8 h-8" />
                    </a>
                )}
                {storeInfo.tiktok_url && (
                    <a href={storeInfo.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:scale-110">
                        <TikTokIcon className="w-8 h-8" />
                    </a>
                )}
                {storeInfo.youtube_url && (
                    <a href={storeInfo.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 hover:scale-110">
                        <YouTubeIcon className="w-8 h-8" />
                    </a>
                )}
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} {storeInfo.nome_loja}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
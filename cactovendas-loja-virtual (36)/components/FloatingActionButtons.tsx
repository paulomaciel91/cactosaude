
import React, { useState, useEffect } from 'react';
import { WhatsAppIcon, ArrowUpToBarIcon } from './icons';

interface FloatingActionButtonsProps {
  whatsappNumber: string | null;
  showWhatsApp?: boolean;
}

const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ whatsappNumber, showWhatsApp = true }) => {
  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsScrollToTopVisible(true);
    } else {
      setIsScrollToTopVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) return;
    let phoneNumber = whatsappNumber.replace(/\D/g, '');
    if (phoneNumber.length === 10 || phoneNumber.length === 11) {
        phoneNumber = `55${phoneNumber}`;
    }
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const buttonBaseClass = "rounded-full h-14 w-14 flex items-center justify-center shadow-lg transition-all duration-300";

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-30 flex flex-col items-center gap-4">
      {/* Scroll to Top Button */}
      <div className={`transition-all duration-300 ${isScrollToTopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button
          onClick={scrollToTop}
          className={`${buttonBaseClass} bg-white hover:bg-gray-100`}
          aria-label="Voltar ao topo"
        >
          <ArrowUpToBarIcon className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      {/* WhatsApp Button */}
      {whatsappNumber && showWhatsApp && (
        <button
          onClick={handleWhatsAppClick}
          className={`${buttonBaseClass} h-16 w-16 bg-[#25D366] transform hover:scale-110`}
          aria-label="Fale conosco no WhatsApp"
        >
          <WhatsAppIcon className="w-9 h-9 text-white" />
        </button>
      )}
    </div>
  );
};

export default FloatingActionButtons;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Banner } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface BannerCarouselProps {
  banners: Banner[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  
  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  }, [banners.length]);
  
  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    resetTimeout();
    if (banners.length > 1) {
        timeoutRef.current = window.setTimeout(nextSlide, 5000);
    }
    return () => {
      resetTimeout();
    };
  }, [currentIndex, banners.length, nextSlide, resetTimeout]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (banners.length <= 1) return;
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (banners.length <= 1) return;
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (banners.length <= 1) return;
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const Wrapper = currentBanner.link_url ? 'a' : 'div';
  const wrapperProps = currentBanner.link_url ? {
      href: currentBanner.link_url,
      target: "_blank",
      rel: "noopener noreferrer"
  } : {};

  return (
    <div className="relative w-full overflow-hidden rounded-lg lg:rounded-xl shadow-lg mb-8 group">
      <div 
        className="flex transition-transform ease-in-out duration-500" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
            <div className="w-full flex-shrink-0" key={index}>
                 <Wrapper {...wrapperProps}>
                    <picture>
                        <source media="(max-width: 1023px)" srcSet={banner.imagem_mobile_url} />
                        <source media="(min-width: 1024px)" srcSet={banner.imagem_desktop_url} />
                        <img 
                            src={banner.imagem_desktop_url} 
                            alt={`Banner ${index + 1}`} 
                            className="w-full h-auto object-cover"
                            draggable="false"
                        />
                    </picture>
                 </Wrapper>
            </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
            <button
            onClick={prevSlide}
            aria-label="Banner anterior"
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
            >
            <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
            onClick={nextSlide}
            aria-label="Próximo banner"
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
            >
            <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {banners.map((_, slideIndex) => (
                <button
                key={slideIndex}
                onClick={() => goToSlide(slideIndex)}
                aria-label={`Ir para o banner ${slideIndex + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    currentIndex === slideIndex ? 'bg-white ring-2 ring-white/50' : 'bg-white/50 hover:bg-white'
                }`}
                ></button>
            ))}
            </div>
        </>
      )}
    </div>
  );
};

export default BannerCarousel;

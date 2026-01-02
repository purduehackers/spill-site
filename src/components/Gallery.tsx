import { useState, useEffect, useCallback } from 'react';

interface ImageItem {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  placeholder: string;
  alt?: string;
  className?: string;
}

interface GalleryProps {
  brochureImages: ImageItem[];
  eventImages: ImageItem[];
}

export default function Gallery({ brochureImages, eventImages }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [lightboxImageLoaded, setLightboxImageLoaded] = useState(false);

  const allImages = [...brochureImages, ...eventImages];
  const isOpen = lightboxIndex !== null;
  const currentImage = isOpen ? allImages[lightboxIndex] : null;

  const openLightbox = (index: number) => {
    setLightboxImageLoaded(false);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  }, []);

  const goToPrev = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxImageLoaded(false);
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  const goToNext = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < allImages.length - 1) {
      setLightboxImageLoaded(false);
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeLightbox, goToPrev, goToNext]);

  const visibleEventImages = showAll ? eventImages : eventImages.slice(0, 14);

  return (
    <>
      <section id="brochure-grid" className="w-full relative z-10 p-4 md:p-12 pb-0 md:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-x-2 items-start">
          {brochureImages.map((img, i) => (
            <div
              key={i}
              className={`gallery-item mb-0 w-full block relative overflow-hidden cursor-pointer rounded-xl ${img.className || ''}`}
              role="button"
              onClick={() => openLightbox(i)}
              style={{
                aspectRatio: `${img.width} / ${img.height}`,
              }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center blur-lg scale-110"
                style={{ backgroundImage: `url('${img.placeholder}')` }}
              ></div>
              <img
                src={img.src}
                srcSet={img.srcSet}
                sizes="(max-width: 768px) 100vw, 33vw"
                alt={img.alt || 'Brochure page'}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className="relative z-10 w-full h-full object-cover transition-opacity duration-500 opacity-0"
                onLoad={(e) => {
                  e.currentTarget.classList.remove('opacity-0');
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section id="image-grid" className="w-full relative z-10 py-4 md:py-12">
        <div className="columns-2 md:columns-3 gap-0 space-y-0">
          {visibleEventImages.map((img, i) => {
            const globalIndex = i + brochureImages.length;
            return (
              <div
                key={globalIndex}
                className="gallery-item break-inside-avoid mb-0 w-full block relative overflow-hidden cursor-pointer"
                role="button"
                onClick={() => openLightbox(globalIndex)}
                style={{
                  aspectRatio: `${img.width} / ${img.height}`,
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center blur-lg scale-110"
                  style={{ backgroundImage: `url('${img.placeholder}')` }}
                ></div>
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  alt={img.alt || 'Event photo'}
                  width={img.width}
                  height={img.height}
                  loading="lazy"
                  decoding="async"
                  className="relative z-10 w-full h-full object-cover transition-opacity duration-500 opacity-0"
                  onLoad={(e) => {
                    e.currentTarget.classList.remove('opacity-0');
                  }}
                />
              </div>
            );
          })}
        </div>

        {!showAll && eventImages.length > 14 && (
          <div className="flex justify-center pt-12 pb-4">
            <button
              onClick={() => setShowAll(true)}
              className="button-medium bg-matcha text-paper hover:bg-moss transition-colors"
            >
              View All Photos
            </button>
          </div>
        )}
      </section>

      {isOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2 transition-colors"
            aria-label="Close lightbox"
            onClick={closeLightbox}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-2 md:left-8 z-50 text-white/80 hover:text-white p-2 transition-colors"
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); goToPrev(); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {lightboxIndex < allImages.length - 1 && (
            <button
              className="absolute right-2 md:right-8 z-50 text-white/80 hover:text-white p-2 transition-colors"
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative max-w-full max-h-full"
              style={{ aspectRatio: `${currentImage.width} / ${currentImage.height}` }}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center blur-md transition-opacity duration-500 ${lightboxImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ backgroundImage: `url('${currentImage.placeholder}')` }}
              ></div>
              <img
                src={currentImage.src}
                alt={currentImage.alt || 'Gallery image'}
                className={`relative z-10 max-w-full max-h-[90vh] object-contain transition-opacity duration-300 ${lightboxImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setLightboxImageLoaded(true)}
                key={lightboxIndex}
                decoding="async"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

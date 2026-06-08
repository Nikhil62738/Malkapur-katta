import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { ImageOff } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FALLBACK_IMAGE } from '../../utils/media';
import { useLanguage } from '../../context/LanguageContext';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  /** Use when parent is position:relative with fixed height (absolute inset-0) */
  fill?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  fill = false,
}: LazyImageProps) {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '300px', threshold: 0.01 });

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [currentSrc, inView]);

  const handleError = () => {
    if (currentSrc !== FALLBACK_IMAGE) {
      setCurrentSrc(FALLBACK_IMAGE);
      setLoaded(false);
      setError(false);
    } else {
      setError(true);
      setLoaded(true);
    }
  };

  const showImage = inView || loaded;

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-white/5',
        fill && 'absolute inset-0 w-full h-full',
        wrapperClassName,
      )}
    >
      {!loaded && !error && (
        <div
          className={cn(
            'skeleton bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer',
            fill ? 'absolute inset-0' : 'w-full min-h-[120px] aspect-[4/3]',
          )}
          aria-hidden="true"
        />
      )}

      {error ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-2 bg-surface-elevated text-white/30',
            fill ? 'absolute inset-0' : 'w-full min-h-[120px] aspect-[4/3]',
          )}
        >
          <ImageOff className="w-8 h-8" />
          <span className="text-xs">{t('a11y.imageUnavailable')}</span>
        </div>
      ) : (
        showImage && (
          <img
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={handleError}
            className={cn(
              'transition-opacity duration-500',
              fill
                ? 'absolute inset-0 w-full h-full object-cover'
                : 'block w-full h-auto object-cover',
              loaded ? 'opacity-100' : 'opacity-0',
              className,
            )}
          />
        )
      )}
    </div>
  );
}

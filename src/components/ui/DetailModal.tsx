import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LazyImage from './LazyImage';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image?: string;
  category?: string;
  description: string;
  mapUrl?: string;
  directionsUrl?: string;
  metadata?: {
    icon: React.ReactNode;
    text: string;
  }[];
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  image,
  category,
  description,
  mapUrl,
  directionsUrl,
  metadata = [],
}: DetailModalProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl max-h-[90vh] glass rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-[210]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label={t('a11y.closeModal') || 'Close'}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto scroll-smooth custom-scrollbar flex-1">
              {image && (
                <div className="relative w-full aspect-video md:aspect-[21/9]">
                  <LazyImage src={image} alt={title} fill />
                  {category && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-brand-orange text-xs font-bold rounded-full shadow-lg">
                      {category}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 md:p-8 lg:p-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">{title}</h2>
                
                {metadata.length > 0 && (
                  <div className="flex flex-wrap gap-4 md:gap-6 mb-8 p-4 rounded-xl glass">
                    {metadata.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                        <div className="text-brand-orange">{item.icon}</div>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="prose prose-invert max-w-none text-white/70 leading-relaxed text-sm md:text-base">
                  {description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>

                {mapUrl && (
                  <div className="mt-8 rounded-xl overflow-hidden glass border-white/10 h-64 md:h-80 relative">
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0"
                    />
                  </div>
                )}
                
                {directionsUrl && (
                  <div className="mt-6 text-center">
                    <a 
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" /> Get Directions
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { youtubeEmbedUrl } from '../../utils/media';
import { useLanguage } from '../../context/LanguageContext';

interface VideoModalProps {
  youtubeId: string | null;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ youtubeId, title, onClose }: VideoModalProps) {
  const { t } = useLanguage();
  useEffect(() => {
    if (!youtubeId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [youtubeId, onClose]);

  return (
    <AnimatePresence>
      {youtubeId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full glass flex items-center justify-center z-10"
              aria-label={t('a11y.closeVideo')}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black ring-2 ring-brand-orange/30">
              <iframe
                src={youtubeEmbedUrl(youtubeId)}
                title={title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-center text-lg font-bold mt-4">{title}</h3>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

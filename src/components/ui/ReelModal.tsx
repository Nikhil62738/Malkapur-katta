import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ReelItem } from '../../data/content';

interface ReelModalProps {
  reels: ReelItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function ReelModal({ reels, initialIndex, onClose }: ReelModalProps) {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowUp') handlePrevious();
      if (e.key === 'ArrowDown') handleNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [currentIndex, onClose]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) setCurrentIndex(c => c + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1);
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex) {
        video.play().catch((e) => console.log('Autoplay prevented:', e));
      } else {
        video.pause();
      }
    });
  }, [currentIndex]);

  useEffect(() => {
    if (containerRef.current) {
      isProgrammaticScroll.current = true;
      // @ts-ignore
      containerRef.current.scrollTo({
        top: currentIndex * containerRef.current.clientHeight,
        behavior: initialScrollDone.current ? 'smooth' : 'instant'
      });
      initialScrollDone.current = true;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 600);
    }
  }, [currentIndex]);

  const handleScroll = () => {
    if (!containerRef.current || isProgrammaticScroll.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight === 0) return;
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 md:p-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center z-[210] transition-colors"
          aria-label={t('a11y.closeVideo') || 'Close'}
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div 
          className="relative w-full h-full md:w-auto md:h-[90vh] md:aspect-[9/16] bg-black md:rounded-3xl overflow-hidden flex flex-col justify-center items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation Controls (Desktop) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10 hidden md:flex">
             <button 
                onClick={handlePrevious} 
                disabled={currentIndex === 0}
                className="w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80 transition-colors"
             >
                <ChevronUp className="w-6 h-6" />
             </button>
             <button 
                onClick={handleNext}
                disabled={currentIndex === reels.length - 1}
                className="w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center disabled:opacity-30 hover:bg-black/80 transition-colors"
             >
                <ChevronDown className="w-6 h-6" />
             </button>
          </div>

          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory hide-scrollbar flex flex-col scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleScroll}
          >
            {reels.map((reel, index) => (
              <div 
                key={reel.id} 
                className="w-full h-full flex-shrink-0 snap-start snap-always relative flex items-center justify-center bg-black"
                style={{ height: '100%' }}
              >
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={reel.videoUrl}
                  className="w-full h-full object-contain md:object-cover cursor-pointer"
                  autoPlay={index === currentIndex}
                  loop
                  playsInline
                  onClick={(e) => {
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.play().catch(() => {});
                    } else {
                      video.pause();
                    }
                  }}
                  preload={Math.abs(index - currentIndex) <= 1 ? "auto" : "none"}
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-1">{reel.title}</h3>
                  {reel.description && (
                    <p className="text-white/90 text-sm mb-3 line-clamp-3 md:line-clamp-2 max-w-[85%] leading-relaxed pointer-events-auto">
                      {reel.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span>{reel.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

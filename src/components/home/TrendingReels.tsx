import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye } from 'lucide-react';

import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useLanguage } from '../../context/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import ReelModal from '../ui/ReelModal';
import { MotionSection, RevealItem } from '../../utils/animations';


export default function TrendingReels() {
  const { t } = useLanguage();
  const { reels } = useLocalizedContent();
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  return (
    <section className="section-padding overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.trendingReels')} subtitle={t('sections.trendingReelsSub')} />
          </RevealItem>
        </MotionSection>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide px-2 -mx-2">
          {reels.map((reel, i) => (
            <div key={reel.id} className="w-[65vw] sm:w-[35vw] md:w-[26vw] lg:w-[20vw] flex-shrink-0 snap-start">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  type="button"
                  onClick={() => setActiveReelIndex(i)}
                  className="block w-full text-left group"
                  aria-label={`Play ${reel.title}`}
                >
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden glass-card p-0">
                    {reel.thumbnail ? (
                      <img src={reel.thumbnail} alt={reel.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <video 
                        src={reel.videoUrl} 
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                        preload="metadata" 
                        muted 
                        playsInline
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-brand-orange/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                      <p className="text-sm font-semibold line-clamp-2 mb-2">{reel.title}</p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {reel.views}
                        </span>
                        <span>{reel.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {activeReelIndex !== null && (
        <ReelModal
          reels={reels}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </section>
  );
}

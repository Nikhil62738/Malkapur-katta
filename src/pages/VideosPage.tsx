import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Clock } from 'lucide-react';
import { formatDate } from '../utils/cn';
import { useLocalizedContent } from '../hooks/useLocalizedContent';
import { useLanguage } from '../context/LanguageContext';
import SectionHeading from '../components/ui/SectionHeading';
import LazyImage from '../components/ui/LazyImage';
import VideoModal from '../components/ui/VideoModal';
import ReelModal from '../components/ui/ReelModal';
import GlassCard from '../components/ui/GlassCard';
import { MotionSection, RevealItem } from '../utils/animations';

export default function VideosPage() {
  const { t, language } = useLanguage();
  const { videos, reels } = useLocalizedContent();
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string } | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading
                title={t('pages.videosTitle')}
                subtitle={t('pages.videosSub')}
              />
            </RevealItem>
          </MotionSection>

          <h3 className="text-xl font-bold mb-6 text-brand-orange">{t('pages.trendingReels')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {reels.map((reel, i) => (
              <motion.button
                key={reel.id}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveReelIndex(i)}
                className="group cursor-pointer text-left w-full"
                aria-label={`Play ${reel.title}`}
              >
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden glass-card p-0">
                  {reel.thumbnail ? (
                    <LazyImage src={reel.thumbnail} alt={reel.title} fill />
                  ) : (
                    <video 
                      src={reel.videoUrl} 
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                      preload="metadata" 
                      muted 
                      playsInline
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-brand-orange/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 pointer-events-none">
                    <p className="text-xs font-semibold line-clamp-2">{reel.title}</p>
                    <span className="text-[10px] text-white/50 flex items-center gap-1 mt-1">
                      <Eye className="w-3 h-3" /> {reel.views}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <h3 className="text-xl font-bold mb-6 text-brand-orange">{t('pages.fullVideos')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <GlassCard
                  className="p-0 overflow-hidden group cursor-pointer"
                  hover
                  onClick={() => setActiveVideo({ id: video.youtubeId, title: video.title })}
                >
                  <div className="relative h-48 overflow-hidden">
                    <LazyImage src={video.thumbnail} alt={video.title} fill />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-brand-orange flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-[10px] rounded flex items-center gap-1 pointer-events-none">
                      <Clock className="w-3 h-3" /> {video.duration}
                    </span>
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-white/50 text-sm line-clamp-2 mb-3">{video.description}</p>
                    <div className="flex items-center gap-3 text-xs text-white/30">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {video.views}</span>
                      <span>{formatDate(video.date, language)}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <VideoModal
        youtubeId={activeVideo?.id ?? null}
        title={activeVideo?.title ?? ''}
        onClose={() => setActiveVideo(null)}
      />
      {activeReelIndex !== null && (
        <ReelModal
          reels={reels}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, Compass } from 'lucide-react';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useLanguage } from '../../context/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import LazyImage from '../ui/LazyImage';
import GlassCard from '../ui/GlassCard';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function ExplorePreview() {
  const { t } = useLanguage();
  const { exploreSpots } = useLocalizedContent();
  return (
    <section className="section-padding bg-surface-elevated/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto relative">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.explore')} subtitle={t('sections.exploreSub')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreSpots.slice(0, 6).map((spot, i) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link to="/explore">
                <GlassCard className="p-0 overflow-hidden group" hover>
                  <div className="relative h-48 overflow-hidden">
                    <LazyImage
                      src={spot.image}
                      alt={spot.name}
                      fill
                      className="group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-brand-orange/90 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Compass className="w-3 h-3" /> {spot.category}
                    </span>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      {spot.rating}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold mb-2 group-hover:text-brand-orange transition-colors">{spot.name}</h3>
                    <p className="text-white/50 text-sm line-clamp-2">{spot.description}</p>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/explore" className="btn-primary inline-flex">
            {t('sections.exploreAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

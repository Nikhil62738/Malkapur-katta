import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Phone } from 'lucide-react';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useLanguage } from '../../context/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import LazyImage from '../ui/LazyImage';
import GlassCard from '../ui/GlassCard';
import DetailModal from '../ui/DetailModal';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function BusinessHighlights() {
  const { t } = useLanguage();
  const { businesses } = useLocalizedContent();
  const [activeBiz, setActiveBiz] = useState<typeof businesses[0] | null>(null);
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.business')} subtitle={t('sections.businessSub')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businesses.map((biz, i) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <button onClick={() => setActiveBiz(biz)} className="w-full text-left h-full block">
              <GlassCard className="p-0 overflow-hidden h-full group hover:ring-2 hover:ring-brand-orange/50 transition-all">
                <div className="relative h-36 overflow-hidden">
                  <LazyImage src={biz.image} alt={biz.name} fill />
                  <span className="absolute top-3 left-3 px-2 py-1 glass text-[10px] font-bold rounded-full">
                    {biz.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-sm mb-1 group-hover:text-brand-orange transition-colors">{biz.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white/50">{biz.rating}</span>
                  </div>
                  <p className="text-white/40 text-xs line-clamp-2 mb-3">{biz.description}</p>
                  <a
                    href={`tel:${biz.phone}`}
                    className="flex items-center gap-1 text-xs text-brand-orange hover:underline"
                  >
                    <Phone className="w-3 h-3" /> {biz.phone}
                  </a>
                </div>
              </GlassCard>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {activeBiz && (
        <DetailModal
          isOpen={!!activeBiz}
          onClose={() => setActiveBiz(null)}
          title={activeBiz.name}
          description={activeBiz.description}
          image={activeBiz.image}
          category={activeBiz.category}
          metadata={[
            { icon: <Star className="w-4 h-4 fill-current text-yellow-400" />, text: `${activeBiz.rating} Rating` },
            { icon: <Phone className="w-4 h-4" />, text: activeBiz.phone }
          ]}
        />
      )}
    </section>
  );
}

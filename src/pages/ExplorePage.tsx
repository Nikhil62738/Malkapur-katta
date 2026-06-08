import { useState } from 'react';
import { Star, Compass, Navigation } from 'lucide-react';
import { imageUrl } from '../utils/media';
import { useLocalizedContent } from '../hooks/useLocalizedContent';
import { useLanguage } from '../context/LanguageContext';
import LazyImage from '../components/ui/LazyImage';
import GlassCard from '../components/ui/GlassCard';
import DetailModal from '../components/ui/DetailModal';
import { MotionSection, RevealItem } from '../utils/animations';

export default function ExplorePage() {
  const { t, language } = useLanguage();
  const { exploreSpots } = useLocalizedContent();
  const [activeCategory, setActiveCategory] = useState('__all__');
  const [activeSpot, setActiveSpot] = useState<typeof exploreSpots[0] | null>(null);

  const categories = ['__all__', ...new Set(exploreSpots.map((s) => s.category))];
  const filtered =
    activeCategory === '__all__'
      ? exploreSpots
      : exploreSpots.filter((s) => s.category === activeCategory);

  return (
    <div>
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden mb-8">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl('explore-hero-banner', 1920, 1080)}')` }}
        />
        <div className="absolute inset-0 bg-brand-black/70" />
        <div className="relative text-center px-4">
          <Compass className="w-12 h-12 text-brand-orange mx-auto mb-4" />
          <h1 className="text-4xl md:text-6xl font-black">
            {language === 'mr' ? (
              <>
                <span className="text-gradient">{t('pages.exploreHeroHighlight')}</span>{' '}
                {t('pages.exploreHeroBefore')}
              </>
            ) : (
              <>
                {t('pages.exploreHeroBefore')}{' '}
                <span className="text-gradient">{t('pages.exploreHeroHighlight')}</span>
              </>
            )}
          </h1>
          <p className="text-white/60 mt-4 max-w-lg mx-auto">{t('pages.exploreHeroSub')}</p>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-orange text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {cat === '__all__' ? t('common.all') : cat}
              </button>
            ))}
          </div>

          <MotionSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((spot) => (
                <RevealItem key={spot.id}>
                  <button onClick={() => setActiveSpot(spot)} className="w-full text-left h-full">
                    <GlassCard className="p-0 overflow-hidden group h-full" hover>
                    <div className="relative h-56 overflow-hidden">
                      <LazyImage
                        src={spot.image}
                        alt={spot.name}
                        fill
                        className="group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute top-3 left-3 px-2 py-1 glass text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Navigation className="w-3 h-3" /> {spot.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg group-hover:text-brand-orange transition-colors">{spot.name}</h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          {spot.rating}
                        </div>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{spot.description}</p>
                    </div>
                  </GlassCard>
                  </button>
                </RevealItem>
              ))}
            </div>
          </MotionSection>
        </div>
      </section>

      {activeSpot && (
        <DetailModal
          isOpen={!!activeSpot}
          onClose={() => setActiveSpot(null)}
          title={activeSpot.name}
          description={activeSpot.description}
          image={activeSpot.image}
          category={activeSpot.category}
          mapUrl={activeSpot.mapUrl}
          directionsUrl={activeSpot.directionsUrl}
          metadata={[
            { icon: <Star className="w-4 h-4 fill-current" />, text: `${activeSpot.rating} Rating` },
            ...(activeSpot.distance ? [{ icon: <Navigation className="w-4 h-4" />, text: `${activeSpot.distance} from center` }] : [])
          ]}
        />
      )}
    </div>
  );
}

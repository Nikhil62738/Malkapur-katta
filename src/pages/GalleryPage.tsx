import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { GalleryItem } from '../data/content';
import { useLocalizedContent } from '../hooks/useLocalizedContent';
import { useLanguage } from '../context/LanguageContext';
import ShareButton from '../components/share/ShareButton';
import SectionHeading from '../components/ui/SectionHeading';
import LazyImage from '../components/ui/LazyImage';
import { MotionSection, RevealItem } from '../utils/animations';

export default function GalleryPage() {
  const { t } = useLanguage();
  const { galleryItems } = useLocalizedContent();
  const [activeCategory, setActiveCategory] = useState('__all__');
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  const categories = ['__all__', ...new Set(galleryItems.map((g) => g.category))];
  const filtered =
    activeCategory === '__all__'
      ? galleryItems
      : galleryItems.filter((g) => g.category === activeCategory);

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading title={t('pages.galleryTitle')} subtitle={t('pages.gallerySub')} />
            </RevealItem>
          </MotionSection>

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

          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((item, i) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(item)}
                className="block w-full break-inside-avoid rounded-2xl overflow-hidden group cursor-pointer relative aspect-[4/3]"
                aria-label={item.title}
              >
                <LazyImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-left">
                    <span className="text-[10px] font-bold text-brand-orange uppercase">{item.category}</span>
                    <p className="text-sm font-semibold">{item.title}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute -top-12 right-0 flex gap-2 items-center">
                <ShareButton title={selected.title} path="/gallery" compact />
                <button
                  onClick={() => setSelected(null)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center"
                  aria-label={t('a11y.close')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img src={selected.image} alt={selected.title} className="w-full rounded-2xl" />
              <div className="mt-4 text-center">
                <span className="text-brand-orange text-sm font-bold">{selected.category}</span>
                <h3 className="text-2xl font-bold mt-1">{selected.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

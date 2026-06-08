import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useLanguage } from '../../context/LanguageContext';
import SectionHeading from '../ui/SectionHeading';
import LazyImage from '../ui/LazyImage';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function GalleryPreview() {
  const { t } = useLanguage();
  const { galleryItems } = useLocalizedContent();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedItem = galleryItems.find((g) => g.id === selected);

  return (
    <section className="section-padding bg-surface-elevated/30">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.gallery')} subtitle={t('sections.gallerySub')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {galleryItems.slice(0, 6).map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(item.id)}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer ${
                i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
              }`}
              aria-label={`View ${item.title}`}
            >
              <LazyImage
                src={item.image}
                alt={item.title}
                fill
                className="group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-brand-orange uppercase">{item.category}</span>
                  <p className="text-sm font-semibold">{item.title}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/gallery" className="btn-secondary inline-flex">
            {t('sections.fullGallery')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full glass flex items-center justify-center"
                aria-label={t('a11y.closeGallery')}
              >
                <X className="w-5 h-5" />
              </button>
              <img src={selectedItem.image} alt={selectedItem.title} className="w-full rounded-2xl" />
              <div className="mt-4 text-center">
                <span className="text-brand-orange text-sm font-bold">{selectedItem.category}</span>
                <h3 className="text-xl font-bold mt-1">{selectedItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

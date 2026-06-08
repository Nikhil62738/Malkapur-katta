import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import ShareButton from '../components/share/ShareButton';
import { useLanguage } from '../context/LanguageContext';
import { useLocalizedContent } from '../hooks/useLocalizedContent';
import { formatDate } from '../utils/cn';
import SectionHeading from '../components/ui/SectionHeading';
import LazyImage from '../components/ui/LazyImage';
import GlassCard from '../components/ui/GlassCard';
import DetailModal from '../components/ui/DetailModal';
import { MotionSection, RevealItem } from '../utils/animations';

export default function NewsPage() {
  const { t, language } = useLanguage();
  const { newsArticles } = useLocalizedContent();
  const [activeCategory, setActiveCategory] = useState('__all__');
  const [activeArticle, setActiveArticle] = useState<typeof newsArticles[0] | null>(null);

  const categories = ['__all__', ...new Set(newsArticles.map((n) => n.category))];

  const filtered =
    activeCategory === '__all__'
      ? newsArticles
      : newsArticles.filter((n) => n.category === activeCategory);

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading
                title={t('sections.latestNews')}
                subtitle={t('sections.latestNewsSub')}
              />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button onClick={() => setActiveArticle(article)} className="w-full text-left h-full block">
                <GlassCard className="p-0 overflow-hidden h-full group hover:ring-2 hover:ring-brand-orange/50 transition-all">
                  <div className="relative h-48 overflow-hidden">
                    <LazyImage src={article.image} alt={article.title} fill className="group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 px-2 py-1 bg-brand-orange text-[10px] font-bold rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <time className="text-xs text-white/40">{formatDate(article.date, language)}</time>
                    <h3 className="font-bold mt-2 mb-2 group-hover:text-brand-orange transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/50 text-sm line-clamp-3 mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-white/30">
                        <User className="w-3 h-3" /> {article.author}
                      </span>
                      <ShareButton title={article.title} path="/news" compact />
                    </div>
                  </div>
                </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeArticle && (
        <DetailModal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={activeArticle.excerpt}
          image={activeArticle.image}
          category={activeArticle.category}
          metadata={[
            { icon: <User className="w-4 h-4" />, text: activeArticle.author },
            { icon: <span className="text-brand-orange text-xs">📅</span>, text: formatDate(activeArticle.date, language) }
          ]}
        />
      )}
    </div>
  );
}

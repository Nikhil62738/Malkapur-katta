import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { formatDate } from '../../utils/cn';
import { useLanguage } from '../../context/LanguageContext';
import ShareButton from '../share/ShareButton';
import SectionHeading from '../ui/SectionHeading';
import LazyImage from '../ui/LazyImage';
import GlassCard from '../ui/GlassCard';
import DetailModal from '../ui/DetailModal';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function LatestNews() {
  const { t, language } = useLanguage();
  const { newsArticles } = useLocalizedContent();
  const featured = newsArticles.find((n) => n.featured);
  const rest = newsArticles.filter((n) => n.id !== featured?.id).slice(0, 3);
  const [activeArticle, setActiveArticle] = useState<typeof newsArticles[0] | null>(null);

  return (
    <section className="section-padding bg-surface-elevated/30">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.latestNews')} subtitle={t('sections.latestNewsSub')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featured && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <button onClick={() => setActiveArticle(featured)} className="w-full text-left h-full block">
                <GlassCard className="p-0 overflow-hidden h-full group hover:ring-2 hover:ring-brand-orange/50 transition-all">
                  <div className="relative h-64 md:h-80">
                    <LazyImage src={featured.image} alt={featured.title} fill />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-brand-orange text-xs font-bold rounded-full">
                      {featured.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <time className="text-xs text-white/40">{formatDate(featured.date, language)}</time>
                    <h3 className="text-xl md:text-2xl font-bold mt-2 mb-3 group-hover:text-brand-orange transition-colors">
                      {featured.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{featured.excerpt}</p>
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          )}

          <div className="space-y-4">
            {rest.map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <button onClick={() => setActiveArticle(article)} className="w-full text-left h-full block">
                  <GlassCard className="p-4 flex gap-4 group hover:ring-2 hover:ring-brand-orange/50 transition-all">
                    <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden">
                      <LazyImage src={article.image} alt={article.title} fill />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-orange uppercase">{article.category}</span>
                        <span className="text-[10px] text-white/30">{formatDate(article.date, language)}</span>
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-brand-orange transition-colors">
                        {article.title}
                      </h4>
                      <div className="mt-2" onClick={(e) => e.preventDefault()}>
                        <ShareButton title={article.title} path="/news" compact />
                      </div>
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/news" className="btn-secondary inline-flex">
            {t('sections.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>


      {activeArticle && (
        <DetailModal
          isOpen={!!activeArticle}
          onClose={() => setActiveArticle(null)}
          title={activeArticle.title}
          description={activeArticle.excerpt}
          image={activeArticle.image}
          category={activeArticle.category}
          metadata={[
            { icon: <span className="text-brand-orange text-xs">👤</span>, text: activeArticle.author },
            { icon: <span className="text-brand-orange text-xs">📅</span>, text: formatDate(activeArticle.date, language) }
          ]}
        />
      )}
    </section>
  );
}

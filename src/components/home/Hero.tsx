import { useRef } from 'react';
import { HERO_BACKGROUND } from '../../utils/media';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import AnimatedCounter from '../ui/AnimatedCounter';
import Button from '../ui/Button';

const statKeys = ['hero.stats.members', 'hero.stats.businesses', 'hero.stats.events', 'hero.stats.heritage'];

export default function Hero() {
  const { t, language } = useLanguage();
  const { generalSettings, homeSettings } = useContent();
  const numberLocale = language === 'mr' ? 'mr-IN' : 'en-IN';
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const heroBg = (homeSettings?.heroImages && homeSettings.heroImages.length > 0)
    ? homeSettings.heroImages[0]
    : HERO_BACKGROUND;

  return (
    <section ref={ref} className="relative min-h-[calc(100dvh-var(--site-header-height))] flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url('${heroBg}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-black/70 to-brand-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/50 to-transparent" />
      </motion.div>

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-brand-orange/30 rounded-full blur-sm"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-6 md:pt-10 text-brand-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 inline-block"
        >
          <div className="relative">
            <img
              src={generalSettings?.logoUrl || "/logo.jpeg"}
              alt={t('a11y.logoAlt')}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover mx-auto ring-4 ring-brand-orange/40 shadow-[0_0_60px_rgba(255,107,0,0.3)]"
            />
            <motion.div
              className="absolute -inset-3 rounded-full border border-brand-orange/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <Sparkles className="w-4 h-4 text-brand-orange" />
          <span className="text-brand-orange text-sm font-semibold uppercase tracking-[0.2em]">
            {t('hero.tagline')}
          </span>
          <Sparkles className="w-4 h-4 text-brand-orange" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          {t('hero.title1')}
          <br />
          <span className="text-gradient">{t('hero.title2')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg md:text-xl text-brand-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/explore">
            <Button>
              {t('hero.explore')} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/videos">
            <Button variant="secondary">
              <Play className="w-4 h-4" /> {t('hero.watchReels')}
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-3xl mx-auto"
        >
          {(generalSettings?.stats || [
            { label: 'Community Members', value: 52000, suffix: '+' },
            { label: 'Local Businesses', value: 850, suffix: '+' },
            { label: 'Events This Year', value: 120, suffix: '+' },
            { label: 'Years of Heritage', value: 400, suffix: '+' },
          ]).map((stat: any, i: number) => (
            <div key={stat.label} className="glass-card p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-brand-orange">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} locale={numberLocale} />
              </div>
              <div className="text-xs md:text-sm text-brand-white/50 mt-1">{t(statKeys[i])}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 bg-brand-orange rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

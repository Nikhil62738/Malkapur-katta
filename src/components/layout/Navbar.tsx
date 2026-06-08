import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';

const navPaths = [
  { path: '/', key: 'nav.home' },
  { path: '/news', key: 'nav.news' },
  { path: '/events', key: 'nav.events' },
  { path: '/explore', key: 'nav.explore' },
  { path: '/videos', key: 'nav.videos' },
  { path: '/gallery', key: 'nav.gallery' },
  { path: '/polls', key: 'nav.polls' },
  { path: '/about', key: 'nav.about' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Navbar() {
  const { t, language } = useLanguage();
  const { generalSettings } = useContent();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const fullBrandName = generalSettings?.siteName || (language === 'mr' ? 'मलकापूर कट्टा' : 'Malkapur Katta');
  const words = fullBrandName.split(' ');
  const brandName = words[0] || '';
  const brandKatta = words.slice(1).join(' ') || '';

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`h-[var(--nav-h)] transition-all duration-300 ${
          scrolled ? 'glass shadow-lg shadow-black/20 bg-brand-black/80' : 'bg-brand-black/60 backdrop-blur-md'
        }`}
      >
        <nav className="h-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2" aria-label={t('a11y.mainNav')}>
          <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0">
            <motion.img
              whileHover={{ rotate: 5, scale: 1.05 }}
              src={generalSettings?.logoUrl || "/logo.jpeg"}
              alt={t('a11y.logoAlt')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-brand-orange/30 shrink-0"
            />
            <div className="hidden sm:block min-w-0 text-brand-white">
              <span className="font-bold text-xs sm:text-sm leading-tight block truncate">
                {brandName} <span className="text-brand-orange">{brandKatta}</span>
              </span>
              <span className="text-[9px] text-brand-white/40 uppercase tracking-widest">{t('brand.official')}</span>
            </div>
          </Link>

          <div className="hidden xl:flex items-center justify-center flex-1 min-w-0 px-1">
            <div className="flex items-center flex-wrap justify-center gap-x-0.5">
              {navPaths.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 py-2 text-xs font-medium transition-colors rounded-lg whitespace-nowrap ${
                    location.pathname === link.path ? 'text-brand-orange' : 'text-brand-white/70 hover:text-brand-white'
                  }`}
                >
                  {t(link.key)}
                  {location.pathname === link.path && (
                    <motion.div layoutId="nav-indicator" className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-orange rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              className="xl:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center"
              aria-label={t('common.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm xl:hidden"
              style={{ top: 'var(--site-header-height)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 bottom-0 z-[70] w-80 max-w-[85vw] glass border-l border-white/10 xl:hidden overflow-y-auto"
              style={{ top: 'var(--site-header-height)' }}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10 text-brand-white">
                <span className="font-bold text-lg">{t('common.menu')}</span>
                <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:text-brand-white" aria-label={t('a11y.close')}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {navPaths.map((link, i) => (
                  <motion.div key={link.path} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        location.pathname === link.path
                          ? 'bg-brand-orange/20 text-brand-orange'
                          : 'text-brand-white/70 hover:bg-white/5 hover:text-brand-white'
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

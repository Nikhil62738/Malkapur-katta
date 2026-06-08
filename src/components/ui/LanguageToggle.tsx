import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const toggle = () => setLanguage(language === 'en' ? 'mr' : 'en');

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 sm:px-3 h-9 sm:h-10 rounded-full glass text-xs font-bold"
      aria-label={language === 'en' ? t('a11y.switchToMarathi') : t('a11y.switchToEnglish')}
      title={language === 'en' ? t('a11y.switchToMarathi') : t('a11y.switchToEnglish')}
    >
      <Languages className="w-4 h-4 text-brand-orange shrink-0" />
      <span className="text-brand-orange">
        {language === 'en' ? 'मराठी' : 'English'}
      </span>
    </motion.button>
  );
}

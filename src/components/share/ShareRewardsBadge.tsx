import { motion } from 'framer-motion';
import { Award, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import { getBadgeLevel } from '../../utils/shareRewards';

export default function ShareRewardsBadge() {
  const { t, language } = useLanguage();
  const { userProfile } = useContent();

  const points = userProfile?.points ?? 0;
  const badge = getBadgeLevel(points);
  const badgeName = language === 'mr' ? badge.nameMr : badge.name;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card px-4 py-3 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
        <Award className="w-5 h-5 text-brand-orange" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-white/40">{t('share.points')}</p>
        <p className="font-bold text-brand-orange">{points} {t('share.pts')}</p>
        <p className="text-[10px] text-white/50 truncate">{badgeName}</p>
      </div>
      <Share2 className="w-4 h-4 text-white/30 shrink-0" />
    </motion.div>
  );
}

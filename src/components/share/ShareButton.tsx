import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Instagram, Link2, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import {
  buildShareUrl,
  shareToWhatsApp,
  copyForInstagram,
  type SharePlatform,
} from '../../utils/shareRewards';

interface ShareButtonProps {
  title: string;
  path?: string;
  className?: string;
  compact?: boolean;
}

export default function ShareButton({ title, path, className = '', compact = false }: ShareButtonProps) {
  const { t, language } = useLanguage();
  const { userProfile, recordSharePoints } = useContent();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');

  const sharePath = path ?? window.location.pathname;
  const url = buildShareUrl(sharePath, title, userProfile?.referralCode);

  const handleShare = async (platform: SharePlatform) => {
    if (platform === 'whatsapp') {
      await shareToWhatsApp(title, url, language);
    } else if (platform === 'instagram' || platform === 'copy') {
      await copyForInstagram(url, title, language);
      setToast(t('share.linkCopied'));
    } else if (navigator.share) {
      await navigator.share({ title, text: title, url });
    }
    const pts = await recordSharePoints(title, platform);
    setToast(`+${pts} ${t('share.pts')}!`);
    setTimeout(() => setToast(''), 2500);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 text-xs transition-colors hover:text-brand-orange ${
          compact ? 'text-white/30' : 'btn-secondary !py-2 !px-4 !text-xs'
        }`}
        aria-label={t('share.share')}
      >
        <Share2 className="w-3.5 h-3.5" />
        {!compact && t('share.share')}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 glass rounded-xl p-2 min-w-[160px] shadow-xl border border-white/10"
            >
              {[
                { platform: 'whatsapp' as const, icon: MessageCircle, label: t('share.whatsapp'), color: 'text-[#25D366]' },
                { platform: 'instagram' as const, icon: Instagram, label: t('share.instagram'), color: 'text-pink-400' },
                { platform: 'copy' as const, icon: Link2, label: t('share.copyLink'), color: 'text-white/70' },
              ].map(({ platform, icon: Icon, label, color }) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => handleShare(platform)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-brand-orange flex items-center gap-1"
          >
            <Check className="w-3 h-3" /> {toast}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

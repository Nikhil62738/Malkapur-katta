import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('mk-pwa-dismissed') === '1');

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('mk-pwa-dismissed', '1');
  };

  if (dismissed && !deferredPrompt) return null;

  return (
    <AnimatePresence>
      {visible && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[45]"
        >
          <div className="glass-card p-4 border border-brand-orange/30 shadow-[0_0_30px_rgba(255,107,0,0.15)]">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center"
              aria-label={t('a11y.dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3 pr-8">
              <img src="/logo.jpeg" alt="" className="w-12 h-12 rounded-xl object-cover ring-2 ring-brand-orange/40 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">{t('pwa.installTitle')}</h3>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{t('pwa.installDesc')}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={install} className="btn-primary flex-1 !py-2.5 !text-xs">
                <Download className="w-4 h-4" /> {t('pwa.installBtn')}
              </button>
              <button onClick={dismiss} className="btn-secondary !py-2.5 !px-4 !text-xs">
                {t('pwa.later')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

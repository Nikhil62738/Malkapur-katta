import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  areNotificationsEnabled,
  requestNotificationPermission,
  initNotificationChecks,
} from '../../utils/notifications';

export default function NotificationPrompt() {
  const { t, language } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (areNotificationsEnabled()) {
      initNotificationChecks(language);
      return;
    }

    const dismissed = localStorage.getItem('mk-notify-dismissed') === '1';
    if (!dismissed && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [language]);

  const enable = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      initNotificationChecks(language);
      setVisible(false);
      localStorage.setItem('mk-notify-dismissed', '1');
    }
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('mk-notify-dismissed', '1');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[var(--site-header-height)] left-0 right-0 z-40 px-4 py-2"
        >
          <div className="max-w-7xl mx-auto glass-card p-3 sm:p-4 flex items-center gap-3 border border-brand-orange/20">
            <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-brand-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{t('pwa.notifyTitle')}</p>
              <p className="text-xs text-white/50">{t('pwa.notifyDesc')}</p>
            </div>
            <button onClick={enable} className="btn-primary !py-2 !px-3 !text-xs shrink-0">
              {t('pwa.enableNotify')}
            </button>
            <button
              onClick={dismiss}
              className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0"
              aria-label={t('a11y.dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

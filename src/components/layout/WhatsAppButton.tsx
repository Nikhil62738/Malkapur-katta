import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WhatsAppButton() {
  const { t, language } = useLanguage();
  const waText = language === 'mr'
    ? 'नमस्कार, मलकापूर कट्टा!'
    : 'Hello Malkapur Katta!';
  return (
    <motion.a
      href={`https://wa.me/917262123456?text=${encodeURIComponent(waText)}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)] transition-shadow"
      aria-label={t('a11y.whatsapp')}
    >
      <MessageCircle className="w-7 h-7 text-white fill-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-orange rounded-full animate-pulse" />
    </motion.a>
  );
}

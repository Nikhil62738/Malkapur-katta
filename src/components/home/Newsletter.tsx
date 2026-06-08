import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function Newsletter() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const cityName = language === 'mr' ? 'मलकापूर' : 'Malkapur';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="section-padding">
      <div className="max-w-3xl mx-auto">
        <MotionSection>
          <RevealItem>
            <div className="glass-card p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-brand-orange/20 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-7 h-7 text-brand-orange" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {t('sections.newsletter')} <span className="text-gradient">{cityName}</span>
                </h2>
                <p className="text-white/50 mb-8 max-w-md mx-auto">{t('sections.newsletterSub')}</p>

                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 text-brand-orange"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">{t('sections.subscribed')}</span>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('sections.newsletterPlaceholder')}
                      required
                      className="flex-1 px-5 py-3 rounded-full glass text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 placeholder:text-white/30"
                      aria-label={t('sections.newsletterPlaceholder')}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary shrink-0"
                    >
                      <Send className="w-4 h-4" /> {t('sections.subscribe')}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </RevealItem>
        </MotionSection>
      </div>
    </section>
  );
}

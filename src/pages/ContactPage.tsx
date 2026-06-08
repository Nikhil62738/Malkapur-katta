import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import GlassCard from '../components/ui/GlassCard';

import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { MotionSection, RevealItem } from '../utils/animations';

export default function ContactPage() {
  const { t, language } = useLanguage();
  const { contactSettings } = useContent();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const address = language === 'mr' ? (contactSettings?.addressMr || t('footer.address')) : (contactSettings?.addressEn || t('footer.address'));
  const phone = contactSettings?.phone || '+91 7262 123456';
  const email = contactSettings?.email || 'hello@malkapurkatta.com';
  const mapsUrl = contactSettings?.mapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890';

  const contactItems = [
    { icon: MapPin, labelKey: 'pages.contactAddressLabel', value: address },
    { icon: Phone, labelKey: 'pages.contactPhoneLabel', value: phone },
    { icon: Mail, labelKey: 'pages.contactEmailLabel', value: email },
    { icon: Clock, labelKey: 'pages.contactHours', value: t('pages.contactHoursVal') },
  ];

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading title={t('pages.contactTitle')} subtitle={t('pages.contactSub')} />
            </RevealItem>
          </MotionSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RevealItem>
              <GlassCard className="p-8">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-12"
                  >
                    <CheckCircle className="w-16 h-16 text-brand-orange mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t('pages.contactSent')}</h3>
                    <p className="text-white/50">{t('pages.contactSentSub')}</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">{t('pages.contactName')}</label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">{t('pages.contactEmail')}</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">{t('pages.contactMessage')}</label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl glass text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 resize-none"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary w-full"
                    >
                      <Send className="w-4 h-4" /> {t('pages.contactSend')}
                    </motion.button>
                  </form>
                )}
              </GlassCard>
            </RevealItem>

            <div className="space-y-6">
              <RevealItem>
                <GlassCard className="p-6 space-y-5">
                  {contactItems.map((item) => (
                    <div key={item.labelKey} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-brand-orange" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">{t(item.labelKey)}</p>
                        <p className="text-sm font-medium mt-1">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </GlassCard>
              </RevealItem>

              <RevealItem>
                <div className="rounded-2xl overflow-hidden glass-card p-0 h-64">
                  <iframe
                    title={t('pages.mapsTitle')}
                    src={mapsUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </RevealItem>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

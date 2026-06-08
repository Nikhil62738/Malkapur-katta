import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate } from '../utils/cn';
import { useLocalizedContent } from '../hooks/useLocalizedContent';
import { useLanguage } from '../context/LanguageContext';
import SectionHeading from '../components/ui/SectionHeading';
import LazyImage from '../components/ui/LazyImage';
import GlassCard from '../components/ui/GlassCard';
import DetailModal from '../components/ui/DetailModal';
import { MotionSection, RevealItem } from '../utils/animations';

export default function EventsPage() {
  const { t, language } = useLanguage();
  const { events } = useLocalizedContent();
  const [activeEvent, setActiveEvent] = useState<typeof events[0] | null>(null);

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading
                title={t('pages.eventsTitle')}
                subtitle={t('pages.eventsSub')}
              />
            </RevealItem>
          </MotionSection>

          <div className="space-y-6">
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <button onClick={() => setActiveEvent(event)} className="w-full text-left h-full block">
                <GlassCard className="p-0 overflow-hidden group hover:ring-2 hover:ring-brand-orange/50 transition-all">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-72 h-48 md:h-auto shrink-0 relative overflow-hidden">
                      <LazyImage src={event.image} alt={event.title} fill />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-brand-orange text-[10px] font-bold rounded-full">
                        {event.category}
                      </span>
                    </div>
                    <div className="p-6 md:p-8 flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-brand-orange transition-colors">{event.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-orange" />
                          {formatDate(event.date, language)}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-brand-orange" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-brand-orange" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeEvent && (
        <DetailModal
          isOpen={!!activeEvent}
          onClose={() => setActiveEvent(null)}
          title={activeEvent.title}
          description={activeEvent.description}
          image={activeEvent.image}
          category={activeEvent.category}
          metadata={[
            { icon: <Calendar className="w-4 h-4" />, text: formatDate(activeEvent.date, language) },
            { icon: <Clock className="w-4 h-4" />, text: activeEvent.time },
            { icon: <MapPin className="w-4 h-4" />, text: activeEvent.location }
          ]}
        />
      )}
    </div>
  );
}

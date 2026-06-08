import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/cn';
import SectionHeading from '../ui/SectionHeading';
import LazyImage from '../ui/LazyImage';
import GlassCard from '../ui/GlassCard';
import DetailModal from '../ui/DetailModal';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function UpcomingEvents() {
  const { t, language } = useLanguage();
  const { events } = useLocalizedContent();
  const upcoming = events.slice(0, 4);
  const [activeEvent, setActiveEvent] = useState<typeof events[0] | null>(null);

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('sections.upcomingEvents')} subtitle={t('sections.upcomingEventsSub')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {upcoming.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <button onClick={() => setActiveEvent(event)} className="w-full text-left h-full block">
                <GlassCard className="p-0 overflow-hidden h-full group" hover>
                  <div className="relative h-40 overflow-hidden">
                    <LazyImage src={event.image} alt={event.title} fill className="group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-3 right-3 px-2 py-1 glass text-[10px] font-bold rounded-full">
                      {event.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-sm mb-3 line-clamp-2 group-hover:text-brand-orange transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-xs text-white/40">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-brand-orange" />
                        {formatDate(event.date, language)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-brand-orange" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-brand-orange" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/events" className="btn-secondary inline-flex">
            {t('sections.allEvents')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

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
    </section>
  );
}

import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import SectionHeading from '../components/ui/SectionHeading';
import PollCard from '../components/polls/PollCard';
import ShareRewardsBadge from '../components/share/ShareRewardsBadge';
import { MotionSection, RevealItem } from '../utils/animations';

export default function PollsPage() {
  const { t } = useLanguage();
  const { polls } = useContent();

  const civic = polls.filter((p) => p.category === 'civic');
  const events = polls.filter((p) => p.category === 'events');
  const general = polls.filter((p) => p.category === 'general');

  return (
    <div>
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <MotionSection>
            <RevealItem>
              <SectionHeading title={t('polls.title')} subtitle={t('polls.subtitle')} />
            </RevealItem>
          </MotionSection>

          <div className="mb-10 max-w-sm">
            <ShareRewardsBadge />
          </div>

          {[
            { label: t('polls.events'), items: events },
            { label: t('polls.civic'), items: civic },
            { label: t('polls.general'), items: general },
          ].map(({ label, items }) => (
            <div key={label} className="mb-12">
              <h3 className="flex items-center gap-2 text-lg font-bold text-brand-orange mb-6">
                <BarChart2 className="w-5 h-5" /> {label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((poll, i) => (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <PollCard poll={poll} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

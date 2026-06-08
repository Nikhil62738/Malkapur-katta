import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import SectionHeading from '../ui/SectionHeading';
import ShareRewardsBadge from '../share/ShareRewardsBadge';
import PollCard from './PollCard';
import { MotionSection, RevealItem } from '../../utils/animations';

export default function PollsSection() {
  const { t } = useLanguage();
  const { polls } = useContent();

  const homePolls = polls.slice(0, 3);

  return (
    <section className="section-padding bg-surface-elevated/30" id="polls">
      <div className="max-w-7xl mx-auto">
        <MotionSection>
          <RevealItem>
            <SectionHeading title={t('polls.title')} subtitle={t('polls.subtitle')} />
          </RevealItem>
        </MotionSection>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <RevealItem>
              <ShareRewardsBadge />
              <p className="text-xs text-white/40 mt-3 px-1 leading-relaxed">{t('share.rewardsDesc')}</p>
              <p className="text-[10px] text-brand-orange mt-2 px-1">{t('share.referralBonus')}</p>
            </RevealItem>
          </div>
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {homePolls.map((poll) => (
              <RevealItem key={poll.id}>
                <PollCard poll={poll} />
              </RevealItem>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/polls" className="btn-secondary inline-flex">
            {t('polls.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

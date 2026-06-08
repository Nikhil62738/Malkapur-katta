import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, Share2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';
import type { Poll } from '../../data/polls';
import { buildShareUrl } from '../../utils/shareRewards';
import GlassCard from '../ui/GlassCard';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const { t, language } = useLanguage();
  const { userProfile, votePoll, recordSharePoints } = useContent();
  const numberLocale = language === 'mr' ? 'mr-IN' : 'en-IN';

  const votes = poll.votes || {};
  const hasVoted = !!userProfile?.votes?.[poll.id];
  const selectedOption = userProfile?.votes?.[poll.id];

  const totalVotes = poll.options.reduce((sum, o) => sum + (votes[o.id] || 0), 0);
  
  const results = poll.options.map((o) => {
    const count = votes[o.id] || 0;
    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { optionId: o.id, count, percent };
  });

  const handleVote = async (optionId: string) => {
    if (hasVoted) return;
    await votePoll(poll.id, optionId);
  };

  const handleShare = async () => {
    const title = t(poll.questionKey);
    const url = buildShareUrl('/polls', title, userProfile?.referralCode);
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: t('polls.vote'),
          url,
        });
        await recordSharePoints(title, 'native');
      } else {
        await navigator.clipboard.writeText(url);
        await recordSharePoints(title, 'copy');
        alert('Link copied to clipboard!');
      }
    } catch (e) {
      console.log('Share error', e);
    }
  };

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-start gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
        <h3 className="font-bold text-base leading-snug">{t(poll.questionKey)}</h3>
      </div>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const result = results.find((r) => r.optionId === option.id);
          const percent = result?.percent ?? 0;
          const isSelected = selectedOption === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={hasVoted}
              onClick={() => handleVote(option.id)}
              className={`relative w-full text-left rounded-xl overflow-hidden transition-all ${
                hasVoted ? 'cursor-default' : 'hover:ring-2 hover:ring-brand-orange/50 cursor-pointer'
              } ${isSelected ? 'ring-2 ring-brand-orange' : ''}`}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  className="absolute inset-y-0 left-0 bg-brand-orange/20"
                />
              )}
              <div className="relative flex items-center justify-between px-4 py-3 glass !rounded-xl">
                <span className="text-sm font-medium flex items-center gap-2">
                  {isSelected && <CheckCircle className="w-4 h-4 text-brand-orange shrink-0" />}
                  {t(option.labelKey)}
                </span>
                {hasVoted && (
                  <span className="text-xs font-bold text-brand-orange">{percent}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/40">
          {hasVoted ? t('polls.voted') : t('polls.vote')} · {totalVotes.toLocaleString(numberLocale)} {t('polls.totalVotes')}
        </p>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-orange-400 transition-colors bg-brand-orange/10 px-3 py-1.5 rounded-full"
        >
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </GlassCard>
  );
}

import { Radio } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useLocalizedContent } from '../../hooks/useLocalizedContent';

export default function NewsTicker() {
  const { t } = useLanguage();
  const { breakingNews } = useLocalizedContent();
  const items = [...breakingNews, ...breakingNews];

  return (
    <div className="h-[var(--ticker-h)] bg-brand-orange/10 border-b border-brand-orange/20 overflow-hidden">
      <div className="h-full max-w-7xl mx-auto flex items-stretch">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 bg-brand-orange shrink-0 z-10">
          <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-white animate-pulse shrink-0" aria-hidden="true" />
          <span className="text-[10px] sm:text-xs font-bold text-brand-white uppercase tracking-wider whitespace-nowrap">
            {t('breaking')}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex items-center overflow-hidden" aria-live="polite">
          <div className="flex animate-ticker whitespace-nowrap items-center">
            {items.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center px-4 sm:px-8 text-xs sm:text-sm text-white/80"
              >
                {item}
                <span className="mx-3 sm:mx-4 text-brand-orange shrink-0" aria-hidden="true">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

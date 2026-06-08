import { motion } from 'framer-motion';
import { Heart, Users, Globe, Award } from 'lucide-react';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { imageUrl } from '../utils/media';
import { useLanguage } from '../context/LanguageContext';
import { useContent } from '../context/ContentContext';
import { MotionSection, RevealItem } from '../utils/animations';

const statKeys = ['hero.stats.members', 'hero.stats.businesses', 'hero.stats.events', 'hero.stats.heritage'];

export default function AboutPage() {
  const { t, language } = useLanguage();
  const { aboutSettings, generalSettings } = useContent();
  const numberLocale = language === 'mr' ? 'mr-IN' : 'en-IN';

  const values = [
    { icon: Heart, titleKey: 'pages.v1Title', descKey: 'pages.v1Desc' },
    { icon: Users, titleKey: 'pages.v2Title', descKey: 'pages.v2Desc' },
    { icon: Globe, titleKey: 'pages.v3Title', descKey: 'pages.v3Desc' },
    { icon: Award, titleKey: 'pages.v4Title', descKey: 'pages.v4Desc' },
  ];

  const aboutText = language === 'mr' ? aboutSettings?.aboutMr : aboutSettings?.aboutEn;
  const aboutParagraphs = aboutText ? aboutText.split(/\n+/) : [];
  const missionText = language === 'mr' ? aboutSettings?.missionMr : aboutSettings?.missionEn;
  const logoUrl = generalSettings?.logoUrl || '/logo.jpeg';

  return (
    <div>
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl('about-hero-banner', 1920, 1080)}')` }}
        />
        <div className="absolute inset-0 bg-brand-black/75" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <motion.img
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            src={logoUrl}
            alt=""
            className="w-28 h-28 rounded-full object-cover mx-auto ring-4 ring-brand-orange/40 mb-8"
          />
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-black mb-4"
          >
            {language === 'mr' ? (
              <>
                <span className="text-gradient">{t('pages.aboutHeroHighlight')}</span>{' '}
                {t('pages.aboutHeroBefore')}
              </>
            ) : (
              <>
                {t('pages.aboutHeroBefore')}{' '}
                <span className="text-gradient">{t('pages.aboutHeroHighlight')}</span>
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            {t('pages.aboutSub')}
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-4xl mx-auto">
          <MotionSection>
            <RevealItem>
              <div className="max-w-none">
                <h2 className="text-2xl font-bold mb-6">{t('pages.aboutStory')}</h2>
                {aboutParagraphs.map((para: string, index: number) => (
                  <p key={index} className="text-white/60 leading-relaxed mb-4">{para}</p>
                ))}
              </div>
            </RevealItem>
          </MotionSection>
        </div>
      </section>

      {missionText && (
        <section className="section-padding border-t border-white/5 bg-surface-elevated/10">
          <div className="max-w-4xl mx-auto text-center">
            <MotionSection>
              <RevealItem>
                <h2 className="text-2xl font-bold mb-4">{language === 'mr' ? 'आमचे ध्येय' : 'Our Mission'}</h2>
                <p className="text-brand-orange text-lg italic max-w-2xl mx-auto leading-relaxed">
                  "{missionText}"
                </p>
              </RevealItem>
            </MotionSection>
          </div>
        </section>
      )}

      <section className="section-padding bg-surface-elevated/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {(generalSettings?.stats || [
              { label: 'Community Members', value: 52000, suffix: '+' },
              { label: 'Local Businesses', value: 850, suffix: '+' },
              { label: 'Events This Year', value: 120, suffix: '+' },
              { label: 'Years of Heritage', value: 400, suffix: '+' },
            ]).map((stat: any, i: number) => (
              <div key={stat.label} className="glass-card p-6 text-center">
                <div className="text-3xl font-bold text-brand-orange">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} locale={numberLocale} />
                </div>
                <div className="text-sm text-white/50 mt-2">{t(statKeys[i])}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <val.icon className="w-8 h-8 text-brand-orange mb-4" />
                <h3 className="font-bold text-lg mb-2">{t(val.titleKey)}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{t(val.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {aboutSettings?.team && aboutSettings.team.length > 0 && (
        <section className="section-padding border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <MotionSection>
              <RevealItem>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-2">{language === 'mr' ? 'आमची टीम' : 'Core Team'}</h2>
                  <p className="text-white/55 text-sm">{language === 'mr' ? 'मलकापूर कट्टा पाठीमागील टीम' : 'The people behind Malkapur Katta'}</p>
                </div>
              </RevealItem>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                {aboutSettings.team.map((member: any) => (
                  <RevealItem key={member.id}>
                    <div className="glass-card p-6 flex flex-col items-center text-center group hover:border-brand-orange/40 transition-all duration-300">
                      <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 mb-4 ring-2 ring-brand-orange/20 group-hover:ring-brand-orange/50 transition-all">
                        <img src={member.image} alt={language === 'mr' ? member.nameMr : member.nameEn} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-bold text-white text-base">{language === 'mr' ? member.nameMr : member.nameEn}</h3>
                      <p className="text-xs text-brand-orange mt-1">{language === 'mr' ? member.roleMr : member.roleEn}</p>
                    </div>
                  </RevealItem>
                ))}
              </div>
            </MotionSection>
          </div>
        </section>
      )}
    </div>
  );
}

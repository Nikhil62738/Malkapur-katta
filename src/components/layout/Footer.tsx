import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Facebook, Twitter, MapPin, Mail, Phone, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';

const iconMap: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
};

const socialAriaKeys: Record<string, string> = {
  instagram: 'a11y.socialInstagram',
  youtube: 'a11y.socialYoutube',
  facebook: 'a11y.socialFacebook',
  twitter: 'a11y.socialTwitter',
};

const footerNav = [
  { path: '/', key: 'nav.home' },
  { path: '/news', key: 'nav.news' },
  { path: '/events', key: 'nav.events' },
  { path: '/explore', key: 'nav.explore' },
  { path: '/videos', key: 'nav.videos' },
  { path: '/gallery', key: 'nav.gallery' },
  { path: '/polls', key: 'nav.polls' },
  { path: '/about', key: 'nav.about' },
  { path: '/contact', key: 'nav.contact' },
];

export default function Footer() {
  const { t, language } = useLanguage();
  const { generalSettings, contactSettings } = useContent();

  const fullBrandName = generalSettings?.siteName || (language === 'mr' ? 'मलकापूर कट्टा' : 'Malkapur Katta');
  const words = fullBrandName.split(' ');
  const brand1 = words[0] || '';
  const brand2 = words.slice(1).join(' ') || '';

  const socialLinks = useMemo(() => {
    return [
      { name: 'Instagram', url: generalSettings?.instagram || 'https://instagram.com/malkapurkatta', icon: 'instagram' },
      { name: 'YouTube', url: generalSettings?.youtube || 'https://youtube.com/malkapurkatta', icon: 'youtube' },
      { name: 'Facebook', url: generalSettings?.facebook || 'https://facebook.com/malkapurkatta', icon: 'facebook' },
    ];
  }, [generalSettings]);

  return (
    <footer className="relative border-t border-white/10 bg-surface-elevated/50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={generalSettings?.logoUrl || "/logo.jpeg"} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-orange/30" />
              <div>
                <span className="font-bold text-base block leading-tight">
                  {brand1} <span className="text-brand-orange">{brand2}</span>
                </span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest block mt-0.5">{t('brand.official')}</span>
              </div>
            </Link>
            <p className="text-white/50 text-xs leading-relaxed">{t('footer.desc')}</p>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-4 text-brand-orange">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {footerNav.slice(0, 5).map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/50 hover:text-brand-orange transition-colors text-xs">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-4 text-brand-orange">{t('footer.contact')}</h3>
            <ul className="space-y-2.5 text-xs text-white/50">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0 mt-0.5" />
                {language === 'mr' ? (contactSettings?.addressMr || t('footer.address')) : (contactSettings?.addressEn || t('footer.address'))}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                {contactSettings?.phone || '+91 7262 123456'}
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                {contactSettings?.email || 'hello@malkapurkatta.com'}
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-xs uppercase tracking-wider mb-4 text-brand-orange">{t('footer.followUs')}</h3>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/60 hover:text-brand-orange hover:border-brand-orange/30 transition-colors"
                  aria-label={t(socialAriaKeys[social.icon] ?? 'a11y.socialInstagram')}
                >
                  <div className="scale-75">{iconMap[social.icon]}</div>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-[11px] text-center md:text-left">
            © {new Date().getFullYear()} {brand1} {brand2} {t('brand.official')}. {t('footer.rights')}
          </p>
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-white/30 text-[11px] flex items-center gap-1">
              {t('footer.madeWith')} <Heart className="w-2.5 h-2.5 text-brand-orange fill-brand-orange" /> {t('footer.forMalkapur')}
            </p>
            <p className="text-white/40 text-[10px]">
              Developed by <a href="https://vertexwebsolutions.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-brand-orange font-medium hover:underline">Vertex Web Solutions</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

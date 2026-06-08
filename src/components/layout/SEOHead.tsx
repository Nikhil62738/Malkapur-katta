import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://malkapurkatta.com';

const pageMeta: Record<string, { titleEn: string; titleMr: string; descEn: string; descMr: string }> = {
  '/': {
    titleEn: 'Malkapur Katta Official | Digital Identity of Malkapur',
    titleMr: 'मलकापूर कट्टा अधिकृत | मलकापूरची डिजिटल ओळख',
    descEn: 'Official community portal — news, events, culture & updates from Malkapur, Maharashtra.',
    descMr: 'अधिकृत समुदाय पोर्टल — बातम्या, कार्यक्रम, संस्कृती आणि अपडेट्स.',
  },
  '/news': {
    titleEn: 'Latest News | Malkapur Katta',
    titleMr: 'ताज्या बातम्या | मलकापूर कट्टा',
    descEn: 'Breaking news and stories from Malkapur and Vidarbha.',
    descMr: 'मलकापूर आणि विदर्भातील ताज्या बातम्या.',
  },
  '/events': {
    titleEn: 'Events | Malkapur Katta',
    titleMr: 'कार्यक्रम | मलकापूर कट्टा',
    descEn: 'Festivals, cultural programs and community events in Malkapur.',
    descMr: 'मलकापूरमधील उत्सव आणि समुदाय कार्यक्रम.',
  },
  '/polls': {
    titleEn: 'Polls & Surveys | Malkapur Katta',
    titleMr: 'मतदान | मलकापूर कट्टा',
    descEn: 'Vote on event coverage and civic priorities for Malkapur.',
    descMr: 'कार्यक्रम कव्हरेज आणि नागरी विषयांवर मतदान करा.',
  },
  '/explore': {
    titleEn: 'Explore Malkapur | Malkapur Katta',
    titleMr: 'मलकापूर एक्सप्लोर | मलकापूर कट्टा',
    descEn: 'Temples, markets, lakes and hidden gems in Malkapur.',
    descMr: 'मंदिरे, बाजार, तलाव आणि लपलेली ठिकाणे.',
  },
  '/videos': {
    titleEn: 'Videos & Reels | Malkapur Katta',
    titleMr: 'व्हिडिओ | मलकापूर कट्टा',
    descEn: 'Festivals, documentaries and food tours from Malkapur.',
    descMr: 'मलकापूरचे उत्सव, माहितीपट आणि रील्स.',
  },
  '/gallery': {
    titleEn: 'Photo Gallery | Malkapur Katta',
    titleMr: 'गॅलरी | मलकापूर कट्टा',
    descEn: 'Festivals, landscapes and community moments.',
    descMr: 'उत्सव, निसर्ग आणि समुदाय क्षण.',
  },
  '/about': {
    titleEn: 'About | Malkapur Katta',
    titleMr: 'आमच्याबद्दल | मलकापूर कट्टा',
    descEn: 'The official digital portal for Malkapur city.',
    descMr: 'मलकापूर शहराचे अधिकृत डिजिटल पोर्टल.',
  },
  '/contact': {
    titleEn: 'Contact | Malkapur Katta',
    titleMr: 'संपर्क | मलकापूर कट्टा',
    descEn: 'Reach Malkapur Katta for news tips and partnerships.',
    descMr: 'बातम्या, भागीदारी आणि अभिप्रायासाठी संपर्क.',
  },
};

function setMeta(property: string, content: string, isOg = false) {
  const attr = isOg ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SEOHead() {
  const { pathname, search } = useLocation();
  const { language } = useLanguage();
  const { generalSettings } = useContent();

  useEffect(() => {
    const meta = pageMeta[pathname] || pageMeta['/'];
    const title = language === 'mr' ? meta.titleMr : meta.titleEn;
    const description = language === 'mr' ? meta.descMr : meta.descEn;
    const url = `${SITE_URL}${pathname}${search}`;
    const logoUrl = generalSettings?.logoUrl || '/logo.jpeg';
    const siteName = generalSettings?.siteName || 'Malkapur Katta Official';

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:image', logoUrl.startsWith('http') ? logoUrl : `${SITE_URL}${logoUrl}`, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', siteName, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', logoUrl.startsWith('http') ? logoUrl : `${SITE_URL}${logoUrl}`);

    if (generalSettings?.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      (link as any).type = 'image/x-icon';
      (link as any).rel = 'shortcut icon';
      (link as any).href = generalSettings.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [pathname, search, language, generalSettings]);

  return null;
}

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useContent } from '../../context/ContentContext';

const SITE_URL =
  typeof window !== 'undefined' ? window.location.origin : 'https://malkapurkatta.netlify.app';

type Meta = {
  titleEn: string;
  titleMr: string;
  descEn: string;
  descMr: string;
  keywords: string;
  crumbEn: string;
  crumbMr: string;
};

const pageMeta: Record<string, Meta> = {
  '/': {
    titleEn: 'Malkapur Katta | Malkapur News, Events, Business & Jobs',
    titleMr: 'मलकापूर कट्टा | मलकापूर बातम्या, कार्यक्रम, व्यवसाय व नोकरी',
    descEn:
      'Malkapur Katta is the #1 digital portal for Malkapur, Maharashtra — latest news, events, business directory, jobs, tourism and community updates.',
    descMr:
      'मलकापूर कट्टा — मलकापूर, महाराष्ट्रासाठी #1 डिजिटल पोर्टल. ताज्या बातम्या, कार्यक्रम, व्यवसाय, नोकरी, पर्यटन व समुदाय अपडेट्स.',
    keywords:
      'Malkapur, Malkapur Katta, Malkapur News, Malkapur Maharashtra, Malkapur Buldhana, Malkapur latest updates, Malkapur community portal',
    crumbEn: 'Home',
    crumbMr: 'मुख्यपृष्ठ',
  },
  '/news': {
    titleEn: 'Malkapur News & Latest Updates | Malkapur Katta',
    titleMr: 'मलकापूर बातम्या व ताज्या अपडेट्स | मलकापूर कट्टा',
    descEn:
      'Breaking news and latest updates from Malkapur, Buldhana and Vidarbha. Local politics, civic, crime, education and community news.',
    descMr:
      'मलकापूर, बुलढाणा व विदर्भातील ताज्या बातम्या. स्थानिक राजकारण, नागरी, शिक्षण व समुदाय बातम्या.',
    keywords:
      'Malkapur News, Malkapur Latest Updates, Malkapur breaking news, Buldhana news, Malkapur news today, Malkapur Marathi news',
    crumbEn: 'News',
    crumbMr: 'बातम्या',
  },
  '/events': {
    titleEn: 'Malkapur Events & Festivals | Malkapur Katta',
    titleMr: 'मलकापूर कार्यक्रम व उत्सव | मलकापूर कट्टा',
    descEn:
      'Upcoming events, festivals, yatras and cultural programs in Malkapur, Maharashtra. Dates, venues and details.',
    descMr: 'मलकापूरमधील आगामी कार्यक्रम, उत्सव, यात्रा व सांस्कृतिक कार्यक्रम. तारखा व ठिकाणे.',
    keywords:
      'Malkapur Events, Malkapur festivals, Malkapur yatra, Malkapur cultural programs, events in Malkapur Maharashtra',
    crumbEn: 'Events',
    crumbMr: 'कार्यक्रम',
  },
  '/explore': {
    titleEn: 'Explore Malkapur — Tourism & Places | Malkapur Katta',
    titleMr: 'मलकापूर एक्सप्लोर — पर्यटन व ठिकाणे | मलकापूर कट्टा',
    descEn:
      'Discover Malkapur tourism — temples, markets, lakes, historic spots and hidden gems to visit in Malkapur, Buldhana.',
    descMr: 'मलकापूर पर्यटन — मंदिरे, बाजार, तलाव, ऐतिहासिक स्थळे व पाहण्यासारखी ठिकाणे.',
    keywords:
      'Malkapur Tourism, places to visit in Malkapur, Malkapur temples, Malkapur Buldhana tourism, explore Malkapur',
    crumbEn: 'Explore',
    crumbMr: 'एक्सप्लोर',
  },
  '/videos': {
    titleEn: 'Malkapur Videos & Reels | Malkapur Katta',
    titleMr: 'मलकापूर व्हिडिओ व रील्स | मलकापूर कट्टा',
    descEn: 'Watch Malkapur videos and reels — festivals, food tours, documentaries and local stories.',
    descMr: 'मलकापूरचे व्हिडिओ व रील्स — उत्सव, फूड टूर, माहितीपट व स्थानिक कथा पहा.',
    keywords: 'Malkapur videos, Malkapur reels, Malkapur YouTube, Malkapur shorts, Malkapur vlogs',
    crumbEn: 'Videos',
    crumbMr: 'व्हिडिओ',
  },
  '/gallery': {
    titleEn: 'Malkapur Photo Gallery | Malkapur Katta',
    titleMr: 'मलकापूर फोटो गॅलरी | मलकापूर कट्टा',
    descEn: 'Photo gallery of Malkapur — festivals, landscapes, events and community moments.',
    descMr: 'मलकापूरची फोटो गॅलरी — उत्सव, निसर्ग, कार्यक्रम व समुदाय क्षण.',
    keywords: 'Malkapur photos, Malkapur gallery, Malkapur images, Malkapur festival photos',
    crumbEn: 'Gallery',
    crumbMr: 'गॅलरी',
  },
  '/polls': {
    titleEn: 'Malkapur Polls & Surveys | Malkapur Katta',
    titleMr: 'मलकापूर मतदान व सर्वेक्षण | मलकापूर कट्टा',
    descEn: 'Vote on civic priorities and community questions for Malkapur.',
    descMr: 'मलकापूरच्या नागरी विषयांवर व समुदाय प्रश्नांवर मतदान करा.',
    keywords: 'Malkapur polls, Malkapur surveys, Malkapur civic poll, Malkapur opinion',
    crumbEn: 'Polls',
    crumbMr: 'मतदान',
  },
  '/about': {
    titleEn: 'About Malkapur Katta — Digital Voice of Malkapur',
    titleMr: 'मलकापूर कट्टा बद्दल — मलकापूरचा डिजिटल आवाज',
    descEn: 'Malkapur Katta is the official digital community portal and the digital voice of Malkapur city.',
    descMr: 'मलकापूर कट्टा हे मलकापूर शहराचे अधिकृत डिजिटल समुदाय पोर्टल आहे.',
    keywords: 'About Malkapur Katta, Malkapur community portal, digital voice of Malkapur',
    crumbEn: 'About',
    crumbMr: 'आमच्याबद्दल',
  },
  '/contact': {
    titleEn: 'Contact & Advertise | Malkapur Katta',
    titleMr: 'संपर्क व जाहिरात | मलकापूर कट्टा',
    descEn:
      'Contact Malkapur Katta for news tips, advertising and partnerships. Promote your Malkapur business with us.',
    descMr: 'बातम्या, जाहिरात व भागीदारीसाठी मलकापूर कट्टाशी संपर्क साधा.',
    keywords: 'Malkapur Katta contact, advertise in Malkapur, Malkapur business promotion, Malkapur ads',
    crumbEn: 'Contact',
    crumbMr: 'संपर्क',
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

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export default function SEOHead() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const { generalSettings } = useContent();

  useEffect(() => {
    const gs: any = generalSettings || {};
    const isAdmin = pathname.startsWith('/admin');
    const meta = pageMeta[pathname] || pageMeta['/'];
    const title = language === 'mr' ? meta.titleMr : meta.titleEn;
    const description = language === 'mr' ? meta.descMr : meta.descEn;
    const url = `${SITE_URL}${pathname}`;
    const logo = gs.logoUrl || '/logo.jpeg';
    const logoUrl = String(logo).startsWith('http') ? logo : `${SITE_URL}${logo}`;
    const siteName = gs.siteName || 'Malkapur Katta Official';

    document.title = title;
    document.documentElement.lang = language === 'mr' ? 'mr' : 'en';

    setMeta('description', description);
    setMeta('keywords', meta.keywords);
    setMeta('robots', isAdmin ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
    setMeta('geo.region', 'IN-MH');
    setMeta('geo.placename', 'Malkapur, Buldhana, Maharashtra');

    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:url', url, true);
    setMeta('og:image', logoUrl, true);
    setMeta('og:type', 'website', true);
    setMeta('og:site_name', siteName, true);
    setMeta('og:locale', language === 'mr' ? 'mr_IN' : 'en_US', true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', logoUrl);

    setLink('canonical', url);

    setJsonLd('ld-organization', {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      name: siteName,
      alternateName: 'Malkapur Katta',
      url: SITE_URL,
      logo: logoUrl,
      image: logoUrl,
      description:
        'Malkapur Katta — the digital voice and #1 community news portal of Malkapur, Buldhana, Maharashtra.',
      areaServed: {
        '@type': 'City',
        name: 'Malkapur',
        containedInPlace: { '@type': 'AdministrativeArea', name: 'Buldhana, Maharashtra, India' },
      },
      sameAs: [gs.facebookUrl, gs.instagramUrl, gs.youtubeUrl, gs.twitterUrl].filter(Boolean),
    });

    setJsonLd('ld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: SITE_URL,
      inLanguage: ['en', 'mr'],
      publisher: { '@type': 'Organization', name: siteName, logo: logoUrl },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/news?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    const crumb = language === 'mr' ? meta.crumbMr : meta.crumbEn;
    const itemListElement: Array<Record<string, unknown>> = [
      {
        '@type': 'ListItem',
        position: 1,
        name: language === 'mr' ? 'मुख्यपृष्ठ' : 'Home',
        item: `${SITE_URL}/`,
      },
    ];
    if (pathname !== '/' && !isAdmin) {
      itemListElement.push({ '@type': 'ListItem', position: 2, name: crumb, item: url });
    }
    setJsonLd('ld-breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    });

    if (gs.faviconUrl) setLink('icon', gs.faviconUrl);
  }, [pathname, language, generalSettings]);

  return null;
}

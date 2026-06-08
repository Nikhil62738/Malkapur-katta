import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useLanguage } from './LanguageContext';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface ContentContextType {
  breakingNews: string[];
  newsArticles: any[];
  events: any[];
  exploreSpots: any[];
  businesses: any[];
  galleryItems: any[];
  videos: any[];
  reels: any[];
  polls: any[];
  userProfile: {
    referralCode: string;
    points: number;
    history: any[];
    votes: Record<string, string>;
  } | null;
  language: string;
  generalSettings: any;
  contactSettings: any;
  aboutSettings: any;
  homeSettings: any;
  votePoll: (pollId: string, optionId: string) => Promise<boolean>;
  recordSharePoints: (title: string, platform: 'whatsapp' | 'instagram' | 'native' | 'copy') => Promise<number>;
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage();

  // Firestore States (initialized to null to differentiate loading/offline vs seeded empty collections)
  const [dbNews, setDbNews] = useState<any[] | null>(null);
  const [dbEvents, setDbEvents] = useState<any[] | null>(null);
  const [dbPlaces, setDbPlaces] = useState<any[] | null>(null);
  const [dbBusinesses, setDbBusinesses] = useState<any[] | null>(null);
  const [dbGallery, setDbGallery] = useState<any[] | null>(null);
  const [dbVideos, setDbVideos] = useState<any[] | null>(null);
  const [dbPolls, setDbPolls] = useState<any[] | null>(null);
  const [dbHomeSettings, setDbHomeSettings] = useState<any>(null);
  const [dbGeneralSettings, setDbGeneralSettings] = useState<any>(null);
  const [dbContactSettings, setDbContactSettings] = useState<any>(null);
  const [dbAboutSettings, setDbAboutSettings] = useState<any>(null);

  // User Profile States
  const [userId, setUserId] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  // Auth User ID listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Generates an in-memory session ID if auth is not ready or fails
        setUserId((prev) => prev || `usr_${Math.random().toString(36).slice(2, 9)}`);
      }
    });
    return unsubAuth;
  }, []);

  // User Profile listener
  useEffect(() => {
    if (!userId) return;

    const unsubUser = onSnapshot(doc(db, 'users', userId), async (snap) => {
      if (snap.exists()) {
        setUserProfile(snap.data());
      } else {
        const referralCode = `MK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const initialProfile = {
          referralCode,
          points: 0,
          history: [],
          votes: {},
          createdAt: new Date().toISOString()
        };
        try {
          await setDoc(doc(db, 'users', userId), initialProfile);
          setUserProfile(initialProfile);
        } catch (e) {
          console.warn("Failed to create user profile in Firestore (may be offline/unauthenticated):", e);
          setUserProfile(initialProfile);
        }
      }
    });

    return unsubUser;
  }, [userId]);

  // Firestore Subscriptions
  useEffect(() => {
    // 1. News Articles
    const unsubNews = onSnapshot(collection(db, 'news'), (snap) => {
      setDbNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore news fetch failed:", err));

    // 2. Events
    const unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
      setDbEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore events fetch failed:", err));

    // 3. Places (Explore spots)
    const unsubPlaces = onSnapshot(collection(db, 'places'), (snap) => {
      setDbPlaces(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore places fetch failed:", err));

    // 4. Businesses
    const unsubBusinesses = onSnapshot(collection(db, 'businesses'), (snap) => {
      setDbBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore businesses fetch failed:", err));

    // 5. Gallery
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      setDbGallery(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore gallery fetch failed:", err));

    // 6. Videos & Reels
    const unsubVideos = onSnapshot(collection(db, 'videos'), (snap) => {
      setDbVideos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore videos fetch failed:", err));

    // 7. Home Settings (Banner headlines)
    const unsubHome = onSnapshot(doc(db, 'settings', 'home'), (snap) => {
      if (snap.exists()) {
        setDbHomeSettings(snap.data());
      }
    }, (err) => console.warn("Firestore home settings fetch failed:", err));

    // 8. General Settings
    const unsubGeneral = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        setDbGeneralSettings(snap.data());
      }
    }, (err) => console.warn("Firestore general settings fetch failed:", err));

    // 9. Contact Settings
    const unsubContact = onSnapshot(doc(db, 'settings', 'contact'), (snap) => {
      if (snap.exists()) {
        setDbContactSettings(snap.data());
      }
    }, (err) => console.warn("Firestore contact settings fetch failed:", err));

    // 10. About Settings
    const unsubAbout = onSnapshot(doc(db, 'about', 'main'), (snap) => {
      if (snap.exists()) {
        setDbAboutSettings(snap.data());
      }
    }, (err) => console.warn("Firestore about settings fetch failed:", err));

    // 11. Polls
    const unsubPolls = onSnapshot(collection(db, 'polls'), (snap) => {
      setDbPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn("Firestore polls fetch failed:", err));

    return () => {
      unsubNews();
      unsubEvents();
      unsubPlaces();
      unsubBusinesses();
      unsubGallery();
      unsubVideos();
      unsubHome();
      unsubGeneral();
      unsubContact();
      unsubAbout();
      unsubPolls();
    };
  }, []);

  // Dispatch custom events for backwards compatibility
  useEffect(() => {
    if (userProfile) {
      window.dispatchEvent(new CustomEvent('mk-poll-update'));
      window.dispatchEvent(new CustomEvent('mk-share-update', { detail: { points: userProfile.points } }));
    }
  }, [userProfile]);

  // votePoll action
  const votePoll = async (pollId: string, optionId: string): Promise<boolean> => {
    if (!userId) return false;
    if (userProfile?.votes?.[pollId]) return false;

    try {
      const { increment } = await import('firebase/firestore');
      
      const pollRef = doc(db, 'polls', pollId);
      await setDoc(pollRef, {
        votes: {
          [optionId]: increment(1)
        }
      }, { merge: true });

      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        votes: {
          [pollId]: optionId
        }
      }, { merge: true });

      return true;
    } catch (e) {
      console.error("Voting failed:", e);
      setUserProfile((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          votes: { ...prev.votes, [pollId]: optionId }
        };
      });
      return true;
    }
  };

  // recordSharePoints action
  const recordSharePoints = async (title: string, platform: 'whatsapp' | 'instagram' | 'native' | 'copy'): Promise<number> => {
    const POINTS: Record<string, number> = {
      whatsapp: 10,
      instagram: 8,
      native: 5,
      copy: 5,
    };
    const pts = POINTS[platform] || 5;
    if (!userId) return pts;

    const newRecord = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      platform,
      points: pts,
      date: new Date().toISOString(),
    };

    try {
      const { increment, arrayUnion } = await import('firebase/firestore');
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        points: increment(pts),
        history: arrayUnion(newRecord)
      }, { merge: true });
    } catch (e) {
      console.error("Failed to add share points to Firestore:", e);
      setUserProfile((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          points: prev.points + pts,
          history: [newRecord, ...prev.history].slice(0, 50)
        };
      });
    }

    return pts;
  };

  // localized data mapping
  const finalBreakingNews = useMemo(() => {
    if (dbHomeSettings) {
      const headlines = language === 'mr' ? dbHomeSettings.headlinesMr : dbHomeSettings.headlines;
      if (headlines && headlines.length > 0) return headlines;
    }
    return [];
  }, [dbHomeSettings, language]);

  const finalNews = useMemo(() => {
    if (dbNews !== null) {
      return dbNews.map(item => ({
        id: item.id,
        title: language === 'mr' ? item.titleMr || item.titleEn : item.titleEn,
        excerpt: language === 'mr' ? item.excerptMr || item.excerptEn : item.excerptEn,
        category: item.category,
        date: item.date,
        image: item.image,
        author: item.author,
        featured: item.featured
      }));
    }
    return [];
  }, [dbNews, language]);

  const finalEvents = useMemo(() => {
    if (dbEvents !== null) {
      return dbEvents.map(item => ({
        id: item.id,
        title: language === 'mr' ? item.titleMr || item.titleEn : item.titleEn,
        description: language === 'mr' ? item.descriptionMr || item.descriptionEn : item.descriptionEn,
        date: item.date,
        time: item.time,
        location: language === 'mr' ? item.locationMr || item.locationEn : item.locationEn,
        image: item.image,
        category: item.category || 'Culture'
      }));
    }
    return [];
  }, [dbEvents, language]);

  const finalExploreSpots = useMemo(() => {
    if (dbPlaces !== null) {
      return dbPlaces.map(item => ({
        id: item.id,
        name: language === 'mr' ? item.nameMr || item.nameEn : item.nameEn,
        description: language === 'mr' ? item.descriptionMr || item.descriptionEn : item.descriptionEn,
        category: language === 'mr' ? (item.category === 'Temples' ? 'मंदिर' : item.category === 'Historical Sites' ? 'वारसा' : 'पर्यटन') : (item.category === 'Temples' ? 'Temple' : item.category === 'Historical Sites' ? 'Heritage' : 'Nature'),
        image: item.image,
        distance: item.distance,
        mapUrl: item.mapUrl,
        directionsUrl: item.directionsUrl,
        rating: item.rating
      }));
    }
    return [];
  }, [dbPlaces, language]);

  const finalBusinesses = useMemo(() => {
    if (dbBusinesses !== null) {
      return dbBusinesses.map(item => ({
        id: item.id,
        name: language === 'mr' ? item.nameMr || item.nameEn : item.nameEn,
        category: language === 'mr' ? (item.category === 'Hotels' ? 'आतिथ्य' : item.category === 'Hospitals' ? 'आरोग्य' : 'व्यवसाय') : (item.category === 'Hotels' ? 'Hospitality' : item.category === 'Hospitals' ? 'Healthcare' : 'Retail'),
        description: language === 'mr' ? item.descriptionMr || item.descriptionEn : item.descriptionEn,
        image: item.image,
        phone: item.phone,
        rating: item.rating || 4.5
      }));
    }
    return [];
  }, [dbBusinesses, language]);

  const finalGallery = useMemo(() => {
    if (dbGallery !== null) {
      return dbGallery.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category === 'Festival Photos' ? (language === 'mr' ? 'उत्सव' : 'Festival') : (language === 'mr' ? 'शहर' : 'City'),
        image: item.image
      }));
    }
    return [];
  }, [dbGallery, language]);

  const finalVideos = useMemo(() => {
    if (dbVideos !== null) {
      const ytVideos = dbVideos.filter(v => v.type === 'youtube');
      return ytVideos.map(item => ({
        id: item.id,
        title: language === 'mr' ? item.titleMr || item.titleEn : item.titleEn,
        description: language === 'mr' ? item.descriptionMr || item.descriptionEn : item.descriptionEn,
        thumbnail: item.thumbnailUrl || '',
        youtubeId: item.youtubeId || '',
        views: item.views,
        date: item.date,
        duration: item.duration
      }));
    }
    return [];
  }, [dbVideos, language]);

  const finalReels = useMemo(() => {
    if (dbVideos !== null) {
      const instReels = dbVideos.filter(v => v.type === 'instagram');
      return instReels.map(item => ({
        id: item.id,
        title: language === 'mr' ? item.titleMr || item.titleEn : item.titleEn,
        views: item.views,
        thumbnail: item.thumbnailUrl && !item.thumbnailUrl.includes('unsplash.com') && !(item.videoUrl || '').startsWith('/reels/') ? item.thumbnailUrl : undefined,
        videoUrl: item.videoUrl,
        duration: item.duration,
        description: language === 'mr' ? item.descriptionMr || item.descriptionEn : item.descriptionEn
      }));
    }
    return [];
  }, [dbVideos, language]);

  const finalGeneralSettings = useMemo(() => {
    if (dbGeneralSettings) return dbGeneralSettings;
    return {
      siteName: 'Malkapur Katta Official',
      logoUrl: '/logo.jpeg',
      faviconUrl: '/favicon.ico',
      facebook: 'https://facebook.com/malkapurkatta',
      instagram: 'https://instagram.com/malkapurkatta',
      youtube: 'https://youtube.com/malkapurkatta',
      stats: [
        { label: 'Community Members', value: 52000, suffix: '+' },
        { label: 'Local Businesses', value: 850, suffix: '+' },
        { label: 'Events This Year', value: 120, suffix: '+' },
        { label: 'Years of Heritage', value: 400, suffix: '+' }
      ]
    };
  }, [dbGeneralSettings]);

  const finalContactSettings = useMemo(() => {
    if (dbContactSettings) return dbContactSettings;
    return {
      phone: '+91 7262 123456',
      email: 'hello@malkapurkatta.com',
      addressEn: 'Malkapur, Buldhana District, Maharashtra 443101',
      addressMr: 'मलकापूर, बुलढाणा जिल्हा, महाराष्ट्र ४४३१०१',
      mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890',
      facebook: 'https://facebook.com/malkapurkatta',
      instagram: 'https://instagram.com/malkapurkatta',
      youtube: 'https://youtube.com/malkapurkatta',
      twitter: 'https://twitter.com/malkapurkatta',
    };
  }, [dbContactSettings]);

  const finalAboutSettings = useMemo(() => {
    if (dbAboutSettings) return dbAboutSettings;
    return {
      aboutEn: "Malkapur Katta was born from a simple vision — to give our beloved city a digital home that reflects its warmth, heritage, and dynamism. Located in the Buldhana district of Maharashtra, Malkapur has been a center of cotton trade, spiritual devotion, and vibrant community life for centuries.\n\nFrom the bustling cotton market yards to the serene shores of Malkapur Lake, from the grand Ganesh Utsav celebrations to the sacred Palkhi processions — our platform captures every facet of life in this extraordinary city.\n\nWhether you're a resident staying connected, a visitor planning your trip, or a business looking to reach the community — Malkapur Katta is your gateway to everything Malkapur.",
      aboutMr: "मलकापूर कट्टा ही आपल्या प्रिय शहराला डिजिटल घर देण्याची संकल्पना आहे — उबदारपणा, वारसा आणि गतिशीलता प्रतिबिंबित करणारे. बुलडाणा जिल्ह्यातील मलकापूर शतकानुवाचे कापूस व्यापार, भक्ती आणि समुदाय जीवनाचे केंद्र आहे.\n\nकापूस बाजारापासून मलकापूर तलावापर्यंत, गणेश उत्सवापासून पवित्र पालखी मिरवणुकीपर्यंत — आमचे व्यासपीठ शहराच्या प्रत्येक पैलूचे दस्तावेजीकरण करते.\n\nआपण स्थानिक रहिवासी, पर्यटक किंवा व्यवसाय असाल — मलकापूर कट्टा हे सर्व काही एकाच ठिकाणी.",
      missionEn: "To empower the community by delivering reliable local news, highlighting heritage, and supporting local commerce.",
      missionMr: "विश्वासार्ह स्थानिक बातम्या देऊन, वारसा हायलाइट करून आणि स्थानिक व्यापाराला पाठिंबा देऊन समुदायाला सक्षम करणे.",
      team: [
        { id: '1', nameEn: 'Nikhil Chopade', nameMr: 'निखिल चोपडे', roleEn: 'Founder & Editor', roleMr: 'संस्थापक आणि संपादक', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }
      ]
    };
  }, [dbAboutSettings]);

  const finalPolls = useMemo(() => {
    if (dbPolls !== null) {
      return dbPolls;
    }
    return [];
  }, [dbPolls]);

  const value = useMemo(() => ({
    breakingNews: finalBreakingNews,
    newsArticles: finalNews,
    events: finalEvents,
    exploreSpots: finalExploreSpots,
    businesses: finalBusinesses,
    galleryItems: finalGallery,
    videos: finalVideos,
    reels: finalReels,
    polls: finalPolls,
    userProfile,
    language,
    generalSettings: finalGeneralSettings,
    contactSettings: finalContactSettings,
    aboutSettings: finalAboutSettings,
    homeSettings: dbHomeSettings,
    votePoll,
    recordSharePoints
  }), [
    finalBreakingNews,
    finalNews,
    finalEvents,
    finalExploreSpots,
    finalBusinesses,
    finalGallery,
    finalVideos,
    finalReels,
    finalPolls,
    userProfile,
    language,
    finalGeneralSettings,
    finalContactSettings,
    finalAboutSettings,
    dbHomeSettings
  ]);

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

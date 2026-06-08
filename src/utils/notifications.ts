import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY = 'mk-notifications-enabled';
const STORAGE_LAST_NEWS = 'mk-last-notified-news';

export function areNotificationsEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setNotificationsEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') {
    setNotificationsEnabled(true);
    return 'granted';
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    setNotificationsEnabled(result === 'granted');
    return result;
  }
  return Notification.permission;
}

export function showLocalNotification(title: string, body: string, tag?: string): void {
  if (Notification.permission !== 'granted') return;

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: '/logo.jpeg',
        badge: '/logo.jpeg',
        tag: tag || 'mk-notification',
        data: { url: '/' },
      } as NotificationOptions);
    }).catch(() => {
      new Notification(title, { body, icon: '/logo.jpeg', tag });
    });
  } else {
    new Notification(title, { body, icon: '/logo.jpeg', tag });
  }
}

let unsubNews: (() => void) | null = null;
let unsubEvents: (() => void) | null = null;

export function initNotificationChecks(lang: 'en' | 'mr'): void {
  if (!areNotificationsEnabled()) return;

  if (unsubNews) unsubNews();
  if (unsubEvents) unsubEvents();

  // 1. Listen for breaking news from home settings
  unsubNews = onSnapshot(doc(db, 'settings', 'home'), (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    const headlines = lang === 'mr' ? data.headlinesMr : data.headlines;
    if (headlines && headlines.length > 0) {
      const latest = headlines[0];
      const lastNotified = localStorage.getItem(STORAGE_LAST_NEWS);
      if (lastNotified === latest) return;

      const title = lang === 'mr' ? '🔴 ताजी बातमी — मलकापूर कट्टा' : '🔴 Breaking — Malkapur Katta';
      showLocalNotification(title, latest, 'breaking-news');
      localStorage.setItem(STORAGE_LAST_NEWS, latest);
    }
  }, (err) => console.warn("Notifications home settings listener failed:", err));

  // 2. Listen for upcoming event reminders
  unsubEvents = onSnapshot(collection(db, 'events'), (snap) => {
    const now = new Date();
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    snap.docs.forEach((d) => {
      const event = { id: d.id, ...d.data() } as any;
      const eventDate = new Date(event.date);
      if (eventDate > now && eventDate <= in7days) {
        const storageKey = `mk-event-notified-${event.id}`;
        if (localStorage.getItem(storageKey)) return;

        const title = lang === 'mr' 
          ? `📅 आगामी: ${event.titleMr || event.titleEn}` 
          : `📅 Upcoming: ${event.titleEn}`;
        const body = lang === 'mr'
          ? `${event.locationMr || event.locationEn} — ${event.time}`
          : `${event.locationEn} — ${event.time}`;

        showLocalNotification(title, body, `event-${event.id}`);
        localStorage.setItem(storageKey, '1');
      }
    });
  }, (err) => console.warn("Notifications events listener failed:", err));
}

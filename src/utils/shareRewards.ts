export type SharePlatform = 'whatsapp' | 'instagram' | 'native' | 'copy';

export function buildShareUrl(path: string, title: string, referralCode?: string): string {
  const base = window.location.origin;
  const ref = referralCode || 'MKOFFICIAL';
  const params = new URLSearchParams({ ref, utm_source: 'malkapurkatta', utm_medium: 'share' });
  return `${base}${path}?${params.toString()}#${encodeURIComponent(title)}`;
}

export function buildShareText(title: string, url: string, lang: 'en' | 'mr'): string {
  const brand = lang === 'mr' ? 'मलकापूर कट्टा' : 'Malkapur Katta';
  const tagline = lang === 'mr'
    ? 'मलकापूरचे अधिकृत समुदाय पोर्टल'
    : 'Official community portal of Malkapur';
  const official = lang === 'mr' ? 'अधिकृत' : 'Official';
  return `📢 ${title}\n\n${tagline}\n🔗 ${url}\n\n— ${brand} ${official}`;
}

export async function shareToWhatsApp(title: string, url: string, lang: 'en' | 'mr'): Promise<void> {
  const text = buildShareText(title, url, lang);
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

export async function copyForInstagram(url: string, title: string, lang: 'en' | 'mr'): Promise<void> {
  const text = buildShareText(title, url, lang);
  await navigator.clipboard.writeText(text);
}

export function getBadgeLevel(points: number): { name: string; nameMr: string; next: number } {
  if (points >= 200) return { name: 'Katta Champion', nameMr: 'कट्टा चॅम्पियन', next: 0 };
  if (points >= 100) return { name: 'Community Star', nameMr: 'समुदाय तारा', next: 200 };
  if (points >= 50) return { name: 'Local Voice', nameMr: 'स्थानिक आवाज', next: 100 };
  if (points >= 20) return { name: 'Rising Member', nameMr: 'उदयोन्मुख सदस्य', next: 50 };
  return { name: 'New Member', nameMr: 'नवीन सदस्य', next: 20 };
}

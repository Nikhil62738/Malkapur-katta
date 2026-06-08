import { imageUrl, youtubeThumbnail } from '../utils/media';

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  author: string;
  featured?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
}

export interface ReelItem {
  id: string;
  title: string;
  views: string;
  thumbnail?: string;
  videoUrl: string;
  duration: string;
  description?: string;
}

export interface ExploreSpot {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  distance?: string;
  mapUrl?: string;
  directionsUrl?: string;
  rating?: number;
}

export interface BusinessItem {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  phone: string;
  rating: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeId: string;
  views: string;
  date: string;
  duration: string;
}

export const breakingNews = [
  'Ganesh Utsav 2026 preparations begin across Malkapur — community committees meet today',
  'New cotton market rates announced — farmers celebrate record prices this season',
  'Malkapur Municipal Council approves smart city lighting project for main roads',
  'Annual Gajanan Maharaj Palkhi procession route finalized — lakhs expected to participate',
  'Malkapur Katta community crosses 50,000 followers — thank you Malkapur!',
];

export const stats = [
  { label: 'Community Members', value: 52000, suffix: '+' },
  { label: 'Local Businesses', value: 850, suffix: '+' },
  { label: 'Events This Year', value: 120, suffix: '+' },
  { label: 'Years of Heritage', value: 400, suffix: '+' },
];

export const newsArticles: NewsItem[] = [
  {
    id: '1',
    title: 'Malkapur Cotton Market Sets New Record with ₹7,200 per Quintal',
    excerpt: 'Farmers in Malkapur and surrounding villages celebrate as cotton prices hit a decade-high, boosting the local agrarian economy significantly.',
    category: 'Economy',
    date: '2026-05-28',
    image: imageUrl('malkapur-cotton-market', 800, 600),
    author: 'Rajesh Patil',
    featured: true,
  },
  {
    id: '2',
    title: 'Ganesh Utsav 2026: Malkapur\'s Biggest Festival Preparations Underway',
    excerpt: 'Over 200 Ganesh mandals across Malkapur city begin elaborate decoration and cultural program planning for the 10-day festival.',
    category: 'Culture',
    date: '2026-05-25',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    author: 'Priya Deshmukh',
    featured: true,
  },
  {
    id: '3',
    title: 'New Bus Connectivity: Malkapur to Aurangabad Direct Route Launched',
    excerpt: 'MSRTC introduces a new direct bus service connecting Malkapur to Chhatrapati Sambhajinagar, reducing travel time by 2 hours.',
    category: 'Infrastructure',
    date: '2026-05-22',
    image: imageUrl('malkapur-bus-transport', 800, 600),
    author: 'Amit Kulkarni',
  },
  {
    id: '4',
    title: 'Youth Cricket League Finals Draw Massive Crowd at Malkapur Ground',
    excerpt: 'The Malkapur Premier League T20 finals saw over 5,000 spectators as local teams battled for the championship trophy.',
    category: 'Sports',
    date: '2026-05-20',
    image: imageUrl('malkapur-cricket-sports', 800, 600),
    author: 'Sandeep Jadhav',
  },
  {
    id: '5',
    title: 'Shegaon Gajanan Maharaj Temple: Special Abhishek on Guru Purnima',
    excerpt: 'Devotees from Malkapur prepare for the annual pilgrimage to Shegaon for Guru Purnima celebrations at Gajanan Maharaj temple.',
    category: 'Spiritual',
    date: '2026-05-18',
    image: imageUrl('malkapur-temple-spiritual', 800, 600),
    author: 'Meera Bhosale',
  },
  {
    id: '6',
    title: 'Malkapur Smart City Project: Phase 1 Road Development Complete',
    excerpt: 'The municipal council completes resurfacing of 15 km of city roads with LED street lighting as part of the smart city initiative.',
    category: 'Development',
    date: '2026-05-15',
    image: imageUrl('malkapur-city-development', 800, 600),
    author: 'Vikram More',
  },
];

export const events: EventItem[] = [
  {
    id: '1',
    title: 'Malkapur Cultural Night 2026',
    description: 'An evening of Lavani, Tamasha, and folk music celebrating Vidarbha\'s rich cultural heritage at the Municipal Ground.',
    date: '2026-06-15',
    time: '6:00 PM',
    location: 'Malkapur Municipal Ground',
    image: imageUrl('malkapur-cultural-night', 800, 600),
    category: 'Culture',
  },
  {
    id: '2',
    title: 'Farmers Market & Organic Fair',
    description: 'Local farmers showcase organic produce, cotton products, and traditional Vidarbha handicrafts.',
    date: '2026-06-22',
    time: '9:00 AM',
    location: 'Cotton Market Yard, Malkapur',
    image: imageUrl('malkapur-farmers-market', 800, 600),
    category: 'Market',
  },
  {
    id: '3',
    title: 'Gajanan Maharaj Palkhi Sohala',
    description: 'Annual procession from Malkapur to Shegaon with bhajan mandals, dhol-tasha, and thousands of devotees.',
    date: '2026-07-10',
    time: '5:00 AM',
    location: 'Shri Gajanan Mandir, Malkapur',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'Spiritual',
  },
  {
    id: '4',
    title: 'Malkapur Marathon 2026',
    description: '5K and 10K run through the scenic routes of Malkapur city. Open to all age groups with prizes for winners.',
    date: '2026-08-03',
    time: '6:30 AM',
    location: 'City Clock Tower, Malkapur',
    image: imageUrl('malkapur-marathon', 800, 600),
    category: 'Sports',
  },
  {
    id: '5',
    title: 'Diwali Utsav & Fireworks Display',
    description: 'Community Diwali celebration with rangoli competition, diyas lighting, and spectacular fireworks at the lake.',
    date: '2026-10-20',
    time: '7:00 PM',
    location: 'Malkapur Lake, Near Bus Stand',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'Festival',
  },
  {
    id: '6',
    title: 'Youth Tech Summit Malkapur',
    description: 'Technology workshops, startup pitches, and career guidance for Malkapur\'s young entrepreneurs and students.',
    date: '2026-09-12',
    time: '10:00 AM',
    location: 'Dr. Babasaheb Ambedkar College, Malkapur',
    image: imageUrl('malkapur-tech-summit', 800, 600),
    category: 'Education',
  },
];

export const reels: ReelItem[] = [
  { id: '1', title: 'Panchamukhi Mandir Malkapur', views: '125K', videoUrl: '/reels/Panchamukhi Mandir Malkapur.mp4', duration: '0:45' },
  { id: '2', title: 'Tirupati Balaji Nandura', views: '89K', videoUrl: '/reels/Tirupati Balaji Nandura.mp4', duration: '1:12' },
  { id: '3', title: 'Ek Rahenge Nek Rahenge', views: '210K', videoUrl: '/reels/एक रहेंगे नेक रहेंगे.mp4', duration: '0:58' },
  { id: '4', title: 'Ganpati Visarjan Malkapur', views: '156K', videoUrl: '/reels/गणपती विसर्जन मलकापूर.mp4', duration: '1:30' },
  { id: '5', title: 'Malkapur City View', views: '67K', videoUrl: '/reels/मलकापूरचा नजारा.mp4', duration: '0:32' },
  { id: '6', title: 'Mujhe Chadh Gaya Bhagwa Rang', views: '98K', videoUrl: '/reels/मुझे चढ गया भगवा रंग रंग ये भगवा रंग.mp4', duration: '1:05' },
  { id: '7', title: 'Ram Navami Malkapur 2025', views: '110K', videoUrl: '/reels/रामनवमी मलकापूर 2025.mp4', duration: '0:50' },
  { id: '8', title: 'Shri Sant Gajanan Maharaj Ghirni, Malkapur', views: '75K', videoUrl: '/reels/श्री संत गजानन महाराज घिर्णी, मलकापूर.mp4', duration: '0:40' },
];

export const exploreSpots: ExploreSpot[] = [
  { id: '1', name: 'Shri Gajanan Maharaj Mandir', description: 'A revered spiritual center drawing devotees from across Maharashtra. Experience peace and divine blessings.', category: 'Temple', image: imageUrl('explore-gajanan-temple', 800, 600), rating: 4.9, distance: '1.5 km', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.1704256424364!2d76.1969695!3d20.8711462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1144a1eb47%3A0xcb1b51e9b251219b!2sShri%20Sant%20Gajanan%20Maharaj%20Mandir%20Malkapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shri+Sant+Gajanan+Maharaj+Mandir+Malkapur' },
  { id: '2', name: 'Malkapur Cotton Market', description: 'One of Vidarbha\'s largest cotton trading hubs. Witness the bustling agrarian economy in action.', category: 'Market', image: imageUrl('explore-cotton-market', 800, 600), rating: 4.5, distance: '2 km', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14976.242947116812!2d76.1856385!3d20.8808149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1144a1eb47%3A0x67c2f0f4a883!2sKrushi%20Utpanna%20Bazar%20Samiti%2C%20Malkapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Krushi+Utpanna+Bazar+Samiti+Malkapur' },
  { id: '3', name: 'Malkapur Lake', description: 'A serene lake perfect for evening walks, bird watching, and the famous Diwali fireworks display.', category: 'Nature', image: imageUrl('explore-malkapur-lake', 800, 600), rating: 4.6, distance: '3.5 km', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Malkapur+Lake' },
  { id: '4', name: 'Nagzira Wildlife Sanctuary', description: 'Just 60 km from Malkapur — spot tigers, leopards, and exotic birds in this pristine sanctuary.', category: 'Wildlife', image: imageUrl('explore-nagzira-wildlife', 800, 600), rating: 4.8, distance: '60 km', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Nagzira+Wildlife+Sanctuary' },
  { id: '5', name: 'Shegaon — Gajanan Maharaj', description: 'The holy town of Shegaon, birthplace of Sant Gajanan Maharaj, just 45 minutes from Malkapur.', category: 'Pilgrimage', image: imageUrl('explore-shegaon-pilgrimage', 800, 600), rating: 4.9, distance: '45 km', mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29971.21832047587!2d76.6713184!3d20.7937397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd7454f738c6bf9%3A0x7d6a5c2d3346b0d9!2sShegaon%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shri+Gajanan+Maharaj+Temple+Shegaon' },
  { id: '6', name: 'Malkapur Fort Ruins', description: 'Explore the historic fort remnants that tell tales of Malkapur\'s 400-year-old heritage.', category: 'Heritage', image: imageUrl('explore-fort-heritage', 800, 600), rating: 4.3, distance: '5 km', directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Malkapur+Fort' },
];

export const businesses: BusinessItem[] = [
  { id: '1', name: 'Patil Cotton Traders', category: 'Agriculture', description: 'Leading cotton trading firm serving farmers across Buldhana district since 1985.', image: imageUrl('biz-cotton-traders', 400, 300), phone: '+91 7262 123456', rating: 4.7 },
  { id: '2', name: 'Hotel Sai Palace', category: 'Hospitality', description: 'Premium dining and comfortable stays for pilgrims and travelers visiting Malkapur.', image: imageUrl('biz-hotel-sai', 400, 300), phone: '+91 7262 234567', rating: 4.5 },
  { id: '3', name: 'Deshmukh Medical Store', category: 'Healthcare', description: 'Trusted pharmacy and medical supplies serving Malkapur community for 30+ years.', image: imageUrl('biz-medical-store', 400, 300), phone: '+91 7262 345678', rating: 4.8 },
  { id: '4', name: 'Vidarbha Handloom Center', category: 'Handicrafts', description: 'Authentic Vidarbha handloom sarees, bedsheets, and traditional textiles.', image: imageUrl('biz-handloom', 400, 300), phone: '+91 7262 456789', rating: 4.6 },
];

export const galleryItems: GalleryItem[] = [
  { id: '1', title: 'Ganesh Utsav 2025', category: 'Festival', image: imageUrl('gallery-ganesh-utsav', 600, 800) },
  { id: '2', title: 'Cotton Harvest Season', category: 'Agriculture', image: imageUrl('gallery-cotton-harvest', 600, 800) },
  { id: '3', title: 'Malkapur Lake Evening', category: 'Nature', image: imageUrl('gallery-lake-evening', 600, 800) },
  { id: '4', title: 'Palkhi Procession', category: 'Spiritual', image: imageUrl('gallery-palkhi', 600, 800) },
  { id: '5', title: 'Local Street Market', category: 'Culture', image: imageUrl('gallery-street-market', 600, 800) },
  { id: '6', title: 'Cricket Finals 2025', category: 'Sports', image: imageUrl('gallery-cricket', 600, 800) },
  { id: '7', title: 'Diwali Celebrations', category: 'Festival', image: imageUrl('gallery-diwali', 600, 800) },
  { id: '8', title: 'Temple Architecture', category: 'Heritage', image: imageUrl('gallery-temple', 600, 800) },
  { id: '9', title: 'Sunset at Fort', category: 'Heritage', image: imageUrl('gallery-fort-sunset', 600, 800) },
];

export const videos: VideoItem[] = [
  { id: '1', title: 'Malkapur City Tour — Complete Guide 2026', description: 'Explore every corner of Malkapur — temples, markets, lakes, and hidden gems.', youtubeId: '6stlCkUDG_s', thumbnail: youtubeThumbnail('6stlCkUDG_s'), views: '45K', date: '2026-05-01', duration: '12:34' },
  { id: '2', title: 'Ganesh Utsav 2025 — Full Coverage', description: 'Complete coverage of Malkapur\'s grand Ganesh festival celebrations.', youtubeId: 'Scxs7L0vhZ4', thumbnail: youtubeThumbnail('Scxs7L0vhZ4'), views: '89K', date: '2025-09-15', duration: '18:22' },
  { id: '3', title: 'Cotton Farming in Vidarbha — Documentary', description: 'A deep dive into the cotton farming culture that defines Malkapur\'s economy.', youtubeId: 'xC3qUeZaR6Q', thumbnail: youtubeThumbnail('xC3qUeZaR6Q'), views: '32K', date: '2026-03-20', duration: '22:10' },
  { id: '4', title: 'Malkapur Street Food Special', description: 'Taste the best vada pav, misal pav, and local delicacies of Malkapur.', youtubeId: 'NUSo8jTFu9s', thumbnail: youtubeThumbnail('NUSo8jTFu9s'), views: '67K', date: '2026-04-10', duration: '8:45' },
  { id: '5', title: 'Palkhi Sohala 2025 — Devotional Journey', description: 'Follow the sacred palkhi procession from Malkapur to Shegaon.', youtubeId: 'kSxUZ8fhdVY', thumbnail: youtubeThumbnail('kSxUZ8fhdVY'), views: '112K', date: '2025-07-12', duration: '25:00' },
  { id: '6', title: 'Malkapur Marathon Highlights', description: 'Highlights from the annual Malkapur Marathon with interviews and race footage.', youtubeId: '1zyhGnsHn0c', thumbnail: youtubeThumbnail('1zyhGnsHn0c'), views: '18K', date: '2025-08-05', duration: '6:30' },
];

export const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/news', label: 'News' },
  { path: '/events', label: 'Events' },
  { path: '/explore', label: 'Explore' },
  { path: '/videos', label: 'Videos' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

export const socialLinks = [
  { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
  { name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' },
  { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
  { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
];

export const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890';

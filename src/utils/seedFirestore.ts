/**
 * Firestore Data Seeder
 * 
 * Seeds ALL static website data into Firebase Firestore.
 * Each collection is checked before seeding — if it already has data, it's skipped.
 * This ensures the admin panel and website always work from real Firestore data.
 */

import { collection, doc, getDocs, getDoc, writeBatch, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { imageUrl, youtubeThumbnail } from './media';

// ========================
// DATA DEFINITIONS
// ========================

const NEWS_DATA = [
  {
    titleEn: 'Malkapur Cotton Market Sets New Record with ₹7,200 per Quintal',
    titleMr: 'मलकापूर कापूस बाजारात ₹७,२०० प्रति क्विंटल — नवा विक्रम',
    excerptEn: 'Farmers in Malkapur and surrounding villages celebrate as cotton prices hit a decade-high, boosting the local agrarian economy significantly.',
    excerptMr: 'मलकापूर आणि परिसरातील शेतकरी आनंदी — कापसाल दशकातील सर्वोच्च भाव, स्थानिक शेती अर्थव्यवस्थेला चालना.',
    category: 'Economy',
    date: '2026-05-28',
    image: imageUrl('malkapur-cotton-market', 800, 600),
    author: 'Rajesh Patil',
    featured: true,
  },
  {
    titleEn: "Ganesh Utsav 2026: Malkapur's Biggest Festival Preparations Underway",
    titleMr: 'गणेश उत्सव २०२६: मलकापूरातील सर्वात मोठ्या सणाची तयारी',
    excerptEn: 'Over 200 Ganesh mandals across Malkapur city begin elaborate decoration and cultural program planning for the 10-day festival.',
    excerptMr: 'शहरातील २०० हून अधिक गणेश मंडळे दहा दिवसांच्या उत्सवासाठी सजावट आणि सांस्कृतिक कार्यक्रमांचे नियोजन करत आहेत.',
    category: 'Culture',
    date: '2026-05-25',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    author: 'Priya Deshmukh',
    featured: true,
  },
  {
    titleEn: 'New Bus Connectivity: Malkapur to Aurangabad Direct Route Launched',
    titleMr: 'मलकापूर ते औरंगाबाद थेट बस सेवा सुरू',
    excerptEn: 'MSRTC introduces a new direct bus service connecting Malkapur to Chhatrapati Sambhajinagar, reducing travel time by 2 hours.',
    excerptMr: 'एमएसआरटीसीने नवी थेट बस सेवा सुरू केली — प्रवास वेळ दोन तासांनी कमी.',
    category: 'Infrastructure',
    date: '2026-05-22',
    image: imageUrl('malkapur-bus-transport', 800, 600),
    author: 'Amit Kulkarni',
    featured: false,
  },
  {
    titleEn: 'Youth Cricket League Finals Draw Massive Crowd at Malkapur Ground',
    titleMr: 'युवा क्रिकेट लीग अंतिम सामना — ५,००० प्रेक्षक',
    excerptEn: 'The Malkapur Premier League T20 finals saw over 5,000 spectators as local teams battled for the championship trophy.',
    excerptMr: 'मलकापूर प्रीमियर लीग टी२० अंतिम सामन्यात स्थानिक संघांमध्ये उत्कट स्पर्धा.',
    category: 'Sports',
    date: '2026-05-20',
    image: imageUrl('malkapur-cricket-sports', 800, 600),
    author: 'Sandeep Jadhav',
    featured: false,
  },
  {
    titleEn: 'Shegaon Gajanan Maharaj Temple: Special Abhishek on Guru Purnima',
    titleMr: 'शेगाव गजानन महाराज मंदिर: गुरु पौर्णिमा विशेष अभिषेक',
    excerptEn: 'Devotees from Malkapur prepare for the annual pilgrimage to Shegaon for Guru Purnima celebrations at Gajanan Maharaj temple.',
    excerptMr: 'मलकापूरहून शेगाव यात्रेसाठी भाविक तयार — गजानन महाराज मंदिरात विशेष विधी.',
    category: 'Spiritual',
    date: '2026-05-18',
    image: imageUrl('malkapur-temple-spiritual', 800, 600),
    author: 'Meera Bhosale',
    featured: false,
  },
  {
    titleEn: 'Malkapur Smart City Project: Phase 1 Road Development Complete',
    titleMr: 'मलकापूर स्मार्ट सिटी: पहिल्या टप्प्यातील रस्ते पूर्ण',
    excerptEn: 'The municipal council completes resurfacing of 15 km of city roads with LED street lighting as part of the smart city initiative.',
    excerptMr: 'नगरपालिकेने १५ किमी रस्ते पुनर्रचना आणि एलईडी दिवे बसवले.',
    category: 'Development',
    date: '2026-05-15',
    image: imageUrl('malkapur-city-development', 800, 600),
    author: 'Vikram More',
    featured: false,
  },
];

const EVENTS_DATA = [
  {
    titleEn: 'Malkapur Cultural Night 2026',
    titleMr: 'मलकापूर सांस्कृतिक संध्याकाळ २०२६',
    descriptionEn: "An evening of Lavani, Tamasha, and folk music celebrating Vidarbha's rich cultural heritage at the Municipal Ground.",
    descriptionMr: 'लावणी, तमाशा आणि लोकगीत — विदर्भाच्या संस्कृतीचा उत्सव, नगरपालिका मैदान.',
    date: '2026-06-15',
    time: '6:00 PM',
    locationEn: 'Malkapur Municipal Ground',
    locationMr: 'मलकापूर नगरपालिका मैदान',
    image: imageUrl('malkapur-cultural-night', 800, 600),
    category: 'Culture',
  },
  {
    titleEn: 'Farmers Market & Organic Fair',
    titleMr: 'शेतकरी बाजार आणि सेंद्रिय मेळा',
    descriptionEn: 'Local farmers showcase organic produce, cotton products, and traditional Vidarbha handicrafts.',
    descriptionMr: 'स्थानिक शेतकरी सेंद्रिय उत्पादने, कापूस आणि विदर्भ हस्तकला प्रदर्शित करतील.',
    date: '2026-06-22',
    time: '9:00 AM',
    locationEn: 'Cotton Market Yard, Malkapur',
    locationMr: 'कापूस बाजार परिसर, मलकापूर',
    image: imageUrl('malkapur-farmers-market', 800, 600),
    category: 'Market',
  },
  {
    titleEn: 'Gajanan Maharaj Palkhi Sohala',
    titleMr: 'गजानन महाराज पालखी सोहळा',
    descriptionEn: 'Annual procession from Malkapur to Shegaon with bhajan mandals, dhol-tasha, and thousands of devotees.',
    descriptionMr: 'मलकापूर ते शेगाव पालखी — भजन मंडळ, ढोल-ताशा आणि हजारो भाविक.',
    date: '2026-07-10',
    time: '5:00 AM',
    locationEn: 'Shri Gajanan Mandir, Malkapur',
    locationMr: 'श्री गजानन मंदिर, मलकापूर',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'Spiritual',
  },
  {
    titleEn: 'Malkapur Marathon 2026',
    titleMr: 'मलकापूर मॅरेथॉन २०२६',
    descriptionEn: '5K and 10K run through the scenic routes of Malkapur city. Open to all age groups with prizes for winners.',
    descriptionMr: '५ किमी आणि १० किमी धाव — सर्व वयोगटांसाठी, विजेत्यांना बक्षिसे.',
    date: '2026-08-03',
    time: '6:30 AM',
    locationEn: 'City Clock Tower, Malkapur',
    locationMr: 'सिटी क्लॉक टॉवर, मलकापूर',
    image: imageUrl('malkapur-marathon', 800, 600),
    category: 'Sports',
  },
  {
    titleEn: 'Diwali Utsav & Fireworks Display',
    titleMr: 'दिवाळी उत्सव आणि आतषबाजी',
    descriptionEn: 'Community Diwali celebration with rangoli competition, diyas lighting, and spectacular fireworks at the lake.',
    descriptionMr: 'रंगोली स्पर्धा, दिवे लावणे आणि तलावाजवळ भव्य आतषबाजी.',
    date: '2026-10-20',
    time: '7:00 PM',
    locationEn: 'Malkapur Lake, Near Bus Stand',
    locationMr: 'मलकापूर तलाव, बसस्थानकाजवळ',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'Festival',
  },
  {
    titleEn: 'Youth Tech Summit Malkapur',
    titleMr: 'युवा तंत्रज्ञान समिट मलकापूर',
    descriptionEn: "Technology workshops, startup pitches, and career guidance for Malkapur's young entrepreneurs and students.",
    descriptionMr: 'तंत्रज्ञान कार्यशाळा, स्टार्टअप सादरीकरण आणि करिअर मार्गदर्शन.',
    date: '2026-09-12',
    time: '10:00 AM',
    locationEn: 'Dr. Babasaheb Ambedkar College, Malkapur',
    locationMr: 'डॉ. बाबासाहेब आंबेडकर महाविद्यालय, मलकापूर',
    image: imageUrl('malkapur-tech-summit', 800, 600),
    category: 'Education',
  },
];

const PLACES_DATA = [
  {
    nameEn: 'Shri Gajanan Maharaj Mandir',
    nameMr: 'श्री गजानन महाराज मंदिर',
    descriptionEn: 'A revered spiritual center drawing devotees from across Maharashtra. Experience peace and divine blessings.',
    descriptionMr: 'महाराष्ट्रभरातील भाविकांना आकर्षित करणारे पवित्र केंद्र. शांती आणि आशीर्वादाचा अनुभव.',
    category: 'Temples',
    image: imageUrl('explore-gajanan-temple', 800, 600),
    rating: 4.9,
    distance: '1.5 km',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.1704256424364!2d76.1969695!3d20.8711462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1144a1eb47%3A0xcb1b51e9b251219b!2sShri%20Sant%20Gajanan%20Maharaj%20Mandir%20Malkapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shri+Sant+Gajanan+Maharaj+Mandir+Malkapur',
  },
  {
    nameEn: 'Malkapur Cotton Market',
    nameMr: 'मलकापूर कापूस बाजार',
    descriptionEn: "One of Vidarbha's largest cotton trading hubs. Witness the bustling agrarian economy in action.",
    descriptionMr: 'विदर्भातील मोठ्या कापूस व्यापार केंद्रांपैकी एक. राबळ्या शेती अर्थव्यवस्थेचा अनुभव.',
    category: 'Markets',
    image: imageUrl('explore-cotton-market', 800, 600),
    rating: 4.5,
    distance: '2 km',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Krushi+Utpanna+Bazar+Samiti+Malkapur',
  },
  {
    nameEn: 'Malkapur Lake',
    nameMr: 'मलकापूर तलाव',
    descriptionEn: 'A serene lake perfect for evening walks, bird watching, and the famous Diwali fireworks display.',
    descriptionMr: 'संध्याकाळी फिरण्यासाठी, पक्षी निरीक्षण आणि दिवाळी आतषबाजीसाठी प्रसिद्ध.',
    category: 'Nature',
    image: imageUrl('explore-malkapur-lake', 800, 600),
    rating: 4.6,
    distance: '3.5 km',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Malkapur+Lake',
  },
  {
    nameEn: 'Nagzira Wildlife Sanctuary',
    nameMr: 'नागझिरा वन्यजीव अभयारण्य',
    descriptionEn: 'Just 60 km from Malkapur — spot tigers, leopards, and exotic birds in this pristine sanctuary.',
    descriptionMr: 'मलकापूरहून ६० किमी — वाघ, बिबट्या आणि दुर्मिळ पक्षी.',
    category: 'Nature',
    image: imageUrl('explore-nagzira-wildlife', 800, 600),
    rating: 4.8,
    distance: '60 km',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Nagzira+Wildlife+Sanctuary',
  },
  {
    nameEn: 'Shegaon — Gajanan Maharaj',
    nameMr: 'शेगाव — गजानन महाराज',
    descriptionEn: 'The holy town of Shegaon, birthplace of Sant Gajanan Maharaj, just 45 minutes from Malkapur.',
    descriptionMr: 'संत गजानन महाराजांचे पवित्र शेगाव — मलकापूरहून ४५ मिनिटे.',
    category: 'Temples',
    image: imageUrl('explore-shegaon-pilgrimage', 800, 600),
    rating: 4.9,
    distance: '45 km',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Shri+Gajanan+Maharaj+Temple+Shegaon',
  },
  {
    nameEn: 'Malkapur Fort Ruins',
    nameMr: 'मलकापूर किल्ल्याचे अवशेष',
    descriptionEn: "Explore the historic fort remnants that tell tales of Malkapur's 400-year-old heritage.",
    descriptionMr: '४०० वर्षांच्या वारशाची साक्ष देणारे ऐतिहासिक किल्ले.',
    category: 'Historical Sites',
    image: imageUrl('explore-fort-heritage', 800, 600),
    rating: 4.3,
    distance: '5 km',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Malkapur+Fort',
  },
];

const BUSINESSES_DATA = [
  {
    nameEn: 'Patil Cotton Traders',
    nameMr: 'पाटील कापूस व्यापारी',
    category: 'Agriculture',
    descriptionEn: 'Leading cotton trading firm serving farmers across Buldhana district since 1985.',
    descriptionMr: '१९८५ पासून बुलडाणा जिल्ह्यातील शेतकऱ्यांना सेवा.',
    image: imageUrl('biz-cotton-traders', 400, 300),
    phone: '+91 7262 123456',
    rating: 4.7,
  },
  {
    nameEn: 'Hotel Sai Palace',
    nameMr: 'हॉटेल साई पॅलेस',
    category: 'Hotels',
    descriptionEn: 'Premium dining and comfortable stays for pilgrims and travelers visiting Malkapur.',
    descriptionMr: 'यात्रेकरू आणि पर्यटकांसाठी उत्तम जेवण आणि निवास.',
    image: imageUrl('biz-hotel-sai', 400, 300),
    phone: '+91 7262 234567',
    rating: 4.5,
  },
  {
    nameEn: 'Deshmukh Medical Store',
    nameMr: 'देशमुख मेडिकल स्टोअर',
    category: 'Hospitals',
    descriptionEn: 'Trusted pharmacy and medical supplies serving Malkapur community for 30+ years.',
    descriptionMr: '३० वर्षांपासून मलकापूर समुदायाची विश्वासार्ह फार्मसी.',
    image: imageUrl('biz-medical-store', 400, 300),
    phone: '+91 7262 345678',
    rating: 4.8,
  },
  {
    nameEn: 'Vidarbha Handloom Center',
    nameMr: 'विदर्भ हँडलूम केंद्र',
    category: 'Retail',
    descriptionEn: 'Authentic Vidarbha handloom sarees, bedsheets, and traditional textiles.',
    descriptionMr: 'प्रामाणिक विदर्भ हातमाग साड्या, बेडशीट आणि वस्त्रे.',
    image: imageUrl('biz-handloom', 400, 300),
    phone: '+91 7262 456789',
    rating: 4.6,
  },
];

const GALLERY_DATA = [
  { title: 'Ganesh Utsav 2025', category: 'Festival Photos', image: imageUrl('gallery-ganesh-utsav', 600, 800) },
  { title: 'Cotton Harvest Season', category: 'City Photos', image: imageUrl('gallery-cotton-harvest', 600, 800) },
  { title: 'Malkapur Lake Evening', category: 'City Photos', image: imageUrl('gallery-lake-evening', 600, 800) },
  { title: 'Palkhi Procession', category: 'Festival Photos', image: imageUrl('gallery-palkhi', 600, 800) },
  { title: 'Local Street Market', category: 'City Photos', image: imageUrl('gallery-street-market', 600, 800) },
  { title: 'Cricket Finals 2025', category: 'City Photos', image: imageUrl('gallery-cricket', 600, 800) },
  { title: 'Diwali Celebrations', category: 'Festival Photos', image: imageUrl('gallery-diwali', 600, 800) },
  { title: 'Temple Architecture', category: 'Festival Photos', image: imageUrl('gallery-temple', 600, 800) },
  { title: 'Sunset at Fort', category: 'City Photos', image: imageUrl('gallery-fort-sunset', 600, 800) },
];

const VIDEOS_DATA = [
  // YouTube Videos
  { type: 'youtube', titleEn: 'Malkapur City Tour — Complete Guide 2026', titleMr: 'मलकापूर शहर भ्रमंती — संपूर्ण मार्गदर्शक २०२६', descriptionEn: 'Explore every corner of Malkapur — temples, markets, lakes, and hidden gems.', descriptionMr: 'मंदिरे, बाजार, तलाव आणि लपलेली ठिकाणे.', youtubeId: '6stlCkUDG_s', videoUrl: 'https://www.youtube.com/watch?v=6stlCkUDG_s', thumbnailUrl: youtubeThumbnail('6stlCkUDG_s'), views: '45K', date: '2026-05-01', duration: '12:34', featured: true },
  { type: 'youtube', titleEn: 'Ganesh Utsav 2025 — Full Coverage', titleMr: 'गणेश उत्सव २०२५ — संपूर्ण कव्हरेज', descriptionEn: "Complete coverage of Malkapur's grand Ganesh festival celebrations.", descriptionMr: 'मलकापूरच्या भव्य गणेश उत्सवाचे संपूर्ण वृत्तांकन.', youtubeId: 'Scxs7L0vhZ4', videoUrl: 'https://www.youtube.com/watch?v=Scxs7L0vhZ4', thumbnailUrl: youtubeThumbnail('Scxs7L0vhZ4'), views: '89K', date: '2025-09-15', duration: '18:22', featured: true },
  { type: 'youtube', titleEn: 'Cotton Farming in Vidarbha — Documentary', titleMr: 'विदर्भात कापूस शेती — माहितीपट', descriptionEn: "A deep dive into the cotton farming culture that defines Malkapur's economy.", descriptionMr: 'मलकापूरच्या अर्थव्यवस्थेचा कापूस शेती संदर्भ.', youtubeId: 'xC3qUeZaR6Q', videoUrl: 'https://www.youtube.com/watch?v=xC3qUeZaR6Q', thumbnailUrl: youtubeThumbnail('xC3qUeZaR6Q'), views: '32K', date: '2026-03-20', duration: '22:10', featured: true },
  { type: 'youtube', titleEn: 'Malkapur Street Food Special', titleMr: 'मलकापूर पदपथ खाद्य विशेष', descriptionEn: 'Taste the best vada pav, misal pav, and local delicacies of Malkapur.', descriptionMr: 'वडा पाव, मिसळ पाव आणि स्थानिक खाद्यपदार्थ.', youtubeId: 'NUSo8jTFu9s', videoUrl: 'https://www.youtube.com/watch?v=NUSo8jTFu9s', thumbnailUrl: youtubeThumbnail('NUSo8jTFu9s'), views: '67K', date: '2026-04-10', duration: '8:45', featured: true },
  { type: 'youtube', titleEn: 'Palkhi Sohala 2025 — Devotional Journey', titleMr: 'पालखी सोहळा २०२५ — भक्ती यात्रा', descriptionEn: 'Follow the sacred palkhi procession from Malkapur to Shegaon.', descriptionMr: 'मलकापूर ते शेगाव पवित्र पालखी मिरवणूक.', youtubeId: 'kSxUZ8fhdVY', videoUrl: 'https://www.youtube.com/watch?v=kSxUZ8fhdVY', thumbnailUrl: youtubeThumbnail('kSxUZ8fhdVY'), views: '112K', date: '2025-07-12', duration: '25:00', featured: true },
  { type: 'youtube', titleEn: 'Malkapur Marathon Highlights', titleMr: 'मलकापूर मॅरेथॉन हायलाइट्स', descriptionEn: 'Highlights from the annual Malkapur Marathon with interviews and race footage.', descriptionMr: 'वार्षिक मॅरेथॉनचे ठळक क्षण आणि मुलाखती.', youtubeId: '1zyhGnsHn0c', videoUrl: 'https://www.youtube.com/watch?v=1zyhGnsHn0c', thumbnailUrl: youtubeThumbnail('1zyhGnsHn0c'), views: '18K', date: '2025-08-05', duration: '6:30', featured: true },
  // Instagram Reels
  { type: 'instagram', titleEn: 'Panchamukhi Mandir Malkapur', titleMr: 'पंचमुखी मंदिर मलकापूर', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/Panchamukhi Mandir Malkapur.mp4', thumbnailUrl: '', views: '125K', date: '2026-01-01', duration: '0:45', featured: false },
  { type: 'instagram', titleEn: 'Tirupati Balaji Nandura', titleMr: 'तिरुपती बालाजी नांदुरा', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/Tirupati Balaji Nandura.mp4', thumbnailUrl: '', views: '89K', date: '2026-01-01', duration: '1:12', featured: false },
  { type: 'instagram', titleEn: 'Ek Rahenge Nek Rahenge', titleMr: 'एक रहेंगे नेक रहेंगे', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/एक रहेंगे नेक रहेंगे.mp4', thumbnailUrl: '', views: '210K', date: '2026-01-01', duration: '0:58', featured: false },
  { type: 'instagram', titleEn: 'Ganpati Visarjan Malkapur', titleMr: 'गणपती विसर्जन मलकापूर', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/गणपती विसर्जन मलकापूर.mp4', thumbnailUrl: '', views: '156K', date: '2026-01-01', duration: '1:30', featured: false },
  { type: 'instagram', titleEn: 'Malkapur City View', titleMr: 'मलकापूरचा नजारा', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/मलकापूरचा नजारा.mp4', thumbnailUrl: '', views: '67K', date: '2026-01-01', duration: '0:32', featured: false },
  { type: 'instagram', titleEn: 'Mujhe Chadh Gaya Bhagwa Rang', titleMr: 'मुझे चढ गया भगवा रंग रंग ये भगवा रंग', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/मुझे चढ गया भगवा रंग रंग ये भगवा रंग.mp4', thumbnailUrl: '', views: '98K', date: '2026-01-01', duration: '1:05', featured: false },
  { type: 'instagram', titleEn: 'Ram Navami Malkapur 2025', titleMr: 'रामनवमी मलकापूर 2025', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/रामनवमी मलकापूर 2025.mp4', thumbnailUrl: '', views: '110K', date: '2026-01-01', duration: '0:50', featured: false },
  { type: 'instagram', titleEn: 'Shri Sant Gajanan Maharaj Ghirni, Malkapur', titleMr: 'श्री संत गजानन महाराज घिर्णी, मलकापूर', descriptionEn: 'Instagram Reel from Malkapur', descriptionMr: 'मलकापूर येथील इंस्टाग्राम रील', videoUrl: '/reels/श्री संत गजानन महाराज घिर्णी, मलकापूर.mp4', thumbnailUrl: '', views: '75K', date: '2026-01-01', duration: '0:40', featured: false },
];

const GENERAL_SETTINGS = {
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
    { label: 'Years of Heritage', value: 400, suffix: '+' },
  ]
};

const POLLS_DATA = [
  {
    id: 'poll-1',
    category: 'events',
    questionKey: 'polls.poll1q',
    options: [
      { id: 'o1', labelKey: 'polls.poll1o1' },
      { id: 'o2', labelKey: 'polls.poll1o2' },
      { id: 'o3', labelKey: 'polls.poll1o3' },
      { id: 'o4', labelKey: 'polls.poll1o4' },
    ],
    votes: { o1: 142, o2: 89, o3: 156, o4: 67 }
  },
  {
    id: 'poll-2',
    category: 'civic',
    questionKey: 'polls.poll2q',
    options: [
      { id: 'o1', labelKey: 'polls.poll2o1' },
      { id: 'o2', labelKey: 'polls.poll2o2' },
      { id: 'o3', labelKey: 'polls.poll2o3' },
      { id: 'o4', labelKey: 'polls.poll2o4' },
    ],
    votes: { o1: 98, o2: 134, o3: 76, o4: 112 }
  },
  {
    id: 'poll-3',
    category: 'general',
    questionKey: 'polls.poll3q',
    options: [
      { id: 'o1', labelKey: 'polls.poll3o1' },
      { id: 'o2', labelKey: 'polls.poll3o2' },
      { id: 'o3', labelKey: 'polls.poll3o3' },
    ],
    votes: { o1: 201, o2: 87, o3: 145 }
  }
];

const CONTACT_SETTINGS = {
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

const HOME_SETTINGS = {
  headlines: [
    'Ganesh Utsav 2026 preparations begin across Malkapur — community committees meet today',
    'New cotton market rates announced — farmers celebrate record prices this season',
    'Malkapur Municipal Council approves smart city lighting project for main roads',
    'Annual Gajanan Maharaj Palkhi procession route finalized — lakhs expected to participate',
    'Malkapur Katta community crosses 50,000 followers — thank you Malkapur!',
  ],
  headlinesMr: [
    'गणेश उत्सव २०२६ची तयारी मलकापूरभर सुरू — समुदाय समितींची आज बैठक',
    'कापूस बाजार भाव जाहीर — या हंगामात शेतकऱ्यांना विक्रमी दराचा आनंद',
    'मलकापूर नगरपालिकेने मुख्य रस्त्यांसाठी स्मार्ट सिटी लाइटिंग मंजूर केले',
    'गजानन महाराज पालखी मार्ग अंतिम — लाखो भाविक सहभागी होण्याची अपेक्षा',
    'मलकापूर कट्टा समुदाय ५०,००० फॉलोअर्स पार — धन्यवाद मलकापूर!',
  ],
};

const ABOUT_SETTINGS = {
  aboutEn: "Malkapur Katta was born from a simple vision — to give our beloved city a digital home that reflects its warmth, heritage, and dynamism. Located in the Buldhana district of Maharashtra, Malkapur has been a center of cotton trade, spiritual devotion, and vibrant community life for centuries.\n\nFrom the bustling cotton market yards to the serene shores of Malkapur Lake, from the grand Ganesh Utsav celebrations to the sacred Palkhi processions — our platform captures every facet of life in this extraordinary city.\n\nWhether you're a resident staying connected, a visitor planning your trip, or a business looking to reach the community — Malkapur Katta is your gateway to everything Malkapur.",
  aboutMr: "मलकापूर कट्टा ही आपल्या प्रिय शहराला डिजिटल घर देण्याची संकल्पना आहे — उबदारपणा, वारसा आणि गतिशीलता प्रतिबिंबित करणारे. बुलडाणा जिल्ह्यातील मलकापूर शतकानुवाचे कापूस व्यापार, भक्ती आणि समुदाय जीवनाचे केंद्र आहे.\n\nकापूस बाजारापासून मलकापूर तलावापर्यंत, गणेश उत्सवापासून पवित्र पालखी मिरवणुकीपर्यंत — आमचे व्यासपीठ शहराच्या प्रत्येक पैलूचे दस्तावेजीकरण करते.\n\nआपण स्थानिक रहिवासी, पर्यटक किंवा व्यवसाय असाल — मलकापूर कट्टा हे सर्व काही एकाच ठिकाणी.",
  missionEn: "To empower the community by delivering reliable local news, highlighting heritage, and supporting local commerce.",
  missionMr: "विश्वासार्ह स्थानिक बातम्या देऊन, वारसा हायलाइट करून आणि स्थानिक व्यापाराला पाठिंबा देऊन समुदायाला सक्षम करणे.",
  team: [
    {
      id: '1',
      nameEn: 'Nikhil Chopade',
      nameMr: 'निखिल चोपडे',
      roleEn: 'Founder & Editor',
      roleMr: 'संस्थापक आणि संपादक',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  ],
};

// ========================
// SEEDING FUNCTIONS
// ========================

async function seedCollection(collectionName: string, data: any[]) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);

  if (!snapshot.empty) {
    console.log(`✅ [${collectionName}] Already has ${snapshot.size} documents — skipping.`);
    return { seeded: false, count: snapshot.size };
  }

  console.log(`📥 [${collectionName}] Empty — seeding ${data.length} documents...`);
  const batch = writeBatch(db);
  data.forEach((item) => {
    const { id, ...itemData } = item;
    const docRef = id ? doc(colRef, id) : doc(colRef);
    batch.set(docRef, { ...itemData, createdAt: new Date().toISOString() });
  });
  await batch.commit();
  console.log(`✅ [${collectionName}] Seeded ${data.length} documents successfully!`);
  return { seeded: true, count: data.length };
}

async function seedSettingsDoc(path: string, docId: string, data: any) {
  const docRef = doc(db, path, docId);
  // For settings documents, use setDoc with merge to avoid overwriting existing data
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    console.log(`✅ [${path}/${docId}] Already exists — skipping.`);
    return { seeded: false };
  }

  console.log(`📥 [${path}/${docId}] Missing — seeding...`);
  await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  console.log(`✅ [${path}/${docId}] Seeded successfully!`);
  return { seeded: true };
}

/**
 * Seeds ALL website data into Firebase Firestore.
 * Safe to call multiple times — it skips collections that already have data.
 */
export async function seedAllDataToFirestore(): Promise<{
  success: boolean;
  results: Record<string, { seeded: boolean; count?: number }>;
}> {
  console.log('🚀 Starting Firestore data seeding...\n');

  const results: Record<string, { seeded: boolean; count?: number }> = {};

  try {
    const [
      newsRes,
      eventsRes,
      placesRes,
      businessesRes,
      galleryRes,
      videosRes,
      pollsRes,
      generalSettingsRes,
      contactSettingsRes,
      homeSettingsRes,
      aboutSettingsRes
    ] = await Promise.all([
      seedCollection('news', NEWS_DATA),
      seedCollection('events', EVENTS_DATA),
      seedCollection('places', PLACES_DATA),
      seedCollection('businesses', BUSINESSES_DATA),
      seedCollection('gallery', GALLERY_DATA),
      seedCollection('videos', VIDEOS_DATA),
      seedCollection('polls', POLLS_DATA),
      seedSettingsDoc('settings', 'general', GENERAL_SETTINGS),
      seedSettingsDoc('settings', 'contact', CONTACT_SETTINGS),
      seedSettingsDoc('settings', 'home', HOME_SETTINGS),
      seedSettingsDoc('about', 'main', ABOUT_SETTINGS)
    ]);

    results.news = newsRes;
    results.events = eventsRes;
    results.places = placesRes;
    results.businesses = businessesRes;
    results.gallery = galleryRes;
    results.videos = videosRes;
    results.polls = pollsRes;
    results.generalSettings = generalSettingsRes;
    results.contactSettings = contactSettingsRes;
    results.homeSettings = homeSettingsRes;
    results.aboutSettings = aboutSettingsRes;

    console.log('\n🎉 Firestore seeding complete!');
    console.log('Results:', results);

    return { success: true, results };
  } catch (error) {
    console.error('❌ Firestore seeding failed:', error);
    return { success: false, results };
  }
}

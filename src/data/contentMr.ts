import { imageUrl, youtubeThumbnail } from '../utils/media';
import type { NewsItem, EventItem, ReelItem, ExploreSpot, BusinessItem, GalleryItem, VideoItem } from './content';

export const breakingNewsMr = [
  'गणेश उत्सव २०२६ची तयारी मलकापूरभर सुरू — समुदाय समितींची आज बैठक',
  'कापूस बाजार भाव जाहीर — या हंगामात शेतकऱ्यांना विक्रमी दराचा आनंद',
  'मलकापूर नगरपालिकेने मुख्य रस्त्यांसाठी स्मार्ट सिटी लाइटिंग मंजूर केले',
  'गजानन महाराज पालखी मार्ग अंतिम — लाखो भाविक सहभागी होण्याची अपेक्षा',
  'मलकापूर कट्टा समुदाय ५०,००० फॉलोअर्स पार — धन्यवाद मलकापूर!',
];

export const newsArticlesMr: NewsItem[] = [
  {
    id: '1',
    title: 'मलकापूर कापूस बाजारात ₹७,२०० प्रति क्विंटल — नवा विक्रम',
    excerpt: 'मलकापूर आणि परिसरातील शेतकरी आनंदी — कापसाल दशकातील सर्वोच्च भाव, स्थानिक शेती अर्थव्यवस्थेला चालना.',
    category: 'अर्थव्यवस्था',
    date: '2026-05-28',
    image: imageUrl('malkapur-cotton-market', 800, 600),
    author: 'राजेश पाटील',
    featured: true,
  },
  {
    id: '2',
    title: 'गणेश उत्सव २०२६: मलकापूरातील सर्वात मोठ्या सणाची तयारी',
    excerpt: 'शहरातील २०० हून अधिक गणेश मंडळे दहा दिवसांच्या उत्सवासाठी सजावट आणि सांस्कृतिक कार्यक्रमांचे नियोजन करत आहेत.',
    category: 'संस्कृती',
    date: '2026-05-25',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    author: 'प्रिया देशमुख',
    featured: true,
  },
  {
    id: '3',
    title: 'मलकापूर ते औरंगाबाद थेट बस सेवा सुरू',
    excerpt: 'एमएसआरटीसीने नवी थेट बस सेवा सुरू केली — प्रवास वेळ दोन तासांनी कमी.',
    category: 'पायाभूत सुविधा',
    date: '2026-05-22',
    image: imageUrl('malkapur-bus-transport', 800, 600),
    author: 'अमित कुलकर्णी',
  },
  {
    id: '4',
    title: 'युवा क्रिकेट लीग अंतिम सामना — ५,००० प्रेक्षक',
    excerpt: 'मलकापूर प्रीमियर लीग टी२० अंतिम सामन्यात स्थानिक संघांमध्ये उत्कट स्पर्धा.',
    category: 'क्रीडा',
    date: '2026-05-20',
    image: imageUrl('malkapur-cricket-sports', 800, 600),
    author: 'संदीप जाधव',
  },
  {
    id: '5',
    title: 'शेगाव गजानन महाराज मंदिर: गुरु पौर्णिमा विशेष अभिषेक',
    excerpt: 'मलकापूरहून शेगाव यात्रेसाठी भाविक तयार — गजानन महाराज मंदिरात विशेष विधी.',
    category: 'धार्मिक',
    date: '2026-05-18',
    image: imageUrl('malkapur-temple-spiritual', 800, 600),
    author: 'मीरा भोसले',
  },
  {
    id: '6',
    title: 'मलकापूर स्मार्ट सिटी: पहिल्या टप्प्यातील रस्ते पूर्ण',
    excerpt: 'नगरपालिकेने १५ किमी रस्ते पुनर्रचना आणि एलईडी दिवे बसवले.',
    category: 'विकास',
    date: '2026-05-15',
    image: imageUrl('malkapur-city-development', 800, 600),
    author: 'विक्रम मोरे',
  },
];

export const eventsMr: EventItem[] = [
  {
    id: '1',
    title: 'मलकापूर सांस्कृतिक संध्याकाळ २०२६',
    description: 'लावणी, तमाशा आणि लोकगीत — विदर्भाच्या संस्कृतीचा उत्सव, नगरपालिका मैदान.',
    date: '2026-06-15',
    time: 'सायं. ६:००',
    location: 'मलकापूर नगरपालिका मैदान',
    image: imageUrl('malkapur-cultural-night', 800, 600),
    category: 'संस्कृती',
  },
  {
    id: '2',
    title: 'शेतकरी बाजार आणि सेंद्रिय मेळा',
    description: 'स्थानिक शेतकरी सेंद्रिय उत्पादने, कापूस आणि विदर्भ हस्तकला प्रदर्शित करतील.',
    date: '2026-06-22',
    time: 'सकाळी ९:००',
    location: 'कापूस बाजार परिसर, मलकापूर',
    image: imageUrl('malkapur-farmers-market', 800, 600),
    category: 'बाजार',
  },
  {
    id: '3',
    title: 'गजानन महाराज पालखी सोहळा',
    description: 'मलकापूर ते शेगाव पालखी — भजन मंडळ, ढोल-ताशा आणि हजारो भाविक.',
    date: '2026-07-10',
    time: 'सकाळी ५:००',
    location: 'श्री गजानन मंदिर, मलकापूर',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'धार्मिक',
  },
  {
    id: '4',
    title: 'मलकापूर मॅरेथॉन २०२६',
    description: '५ किमी आणि १० किमी धाव — सर्व वयोगटांसाठी, विजेत्यांना बक्षिसे.',
    date: '2026-08-03',
    time: 'सकाळी ६:३०',
    location: 'सिटी क्लॉक टॉवर, मलकापूर',
    image: imageUrl('malkapur-marathon', 800, 600),
    category: 'क्रीडा',
  },
  {
    id: '5',
    title: 'दिवाळी उत्सव आणि आतषबाजी',
    description: 'रंगोली स्पर्धा, दिवे लावणे आणि तलावाजवळ भव्य आतषबाजी.',
    date: '2026-10-20',
    time: 'सायं. ७:००',
    location: 'मलकापूर तलाव, बसस्थानकाजवळ',
    image: imageUrl('malkapur-ganesh-festival', 800, 600),
    category: 'उत्सव',
  },
  {
    id: '6',
    title: 'युवा तंत्रज्ञान समिट मलकापूर',
    description: 'तंत्रज्ञान कार्यशाळा, स्टार्टअप सादरीकरण आणि करिअर मार्गदर्शन.',
    date: '2026-09-12',
    time: 'सकाळी १०:००',
    location: 'डॉ. बाबासाहेब आंबेडकर महाविद्यालय, मलकापूर',
    image: imageUrl('malkapur-tech-summit', 800, 600),
    category: 'शिक्षण',
  },
];

export const reelsMr: ReelItem[] = [
  { id: '1', title: 'पंचमुखी मंदिर मलकापूर', views: '125K', videoUrl: '/reels/Panchamukhi Mandir Malkapur.mp4', duration: '0:45' },
  { id: '2', title: 'तिरुपती बालाजी नांदुरा', views: '89K', videoUrl: '/reels/Tirupati Balaji Nandura.mp4', duration: '1:12' },
  { id: '3', title: 'एक रहेंगे नेक रहेंगे', views: '210K', videoUrl: '/reels/एक रहेंगे नेक रहेंगे.mp4', duration: '0:58' },
  { id: '4', title: 'गणपती विसर्जन मलकापूर', views: '156K', videoUrl: '/reels/गणपती विसर्जन मलकापूर.mp4', duration: '1:30' },
  { id: '5', title: 'मलकापूरचा नजारा', views: '67K', videoUrl: '/reels/मलकापूरचा नजारा.mp4', duration: '0:32' },
  { id: '6', title: 'मुझे चढ गया भगवा रंग रंग ये भगवा रंग', views: '98K', videoUrl: '/reels/मुझे चढ गया भगवा रंग रंग ये भगवा रंग.mp4', duration: '1:05' },
  { id: '7', title: 'रामनवमी मलकापूर 2025', views: '110K', videoUrl: '/reels/रामनवमी मलकापूर 2025.mp4', duration: '0:50' },
  { id: '8', title: 'श्री संत गजानन महाराज घिर्णी, मलकापूर', views: '75K', videoUrl: '/reels/श्री संत गजानन महाराज घिर्णी, मलकापूर.mp4', duration: '0:40' },
];

export const exploreSpotsMr: ExploreSpot[] = [
  { id: '1', name: 'श्री गजानन महाराज मंदिर', description: 'महाराष्ट्रभरातील भाविकांना आकर्षित करणारे पवित्र केंद्र. शांती आणि आशीर्वादाचा अनुभव.', category: 'मंदिर', image: imageUrl('explore-gajanan-temple', 800, 600), rating: 4.9 },
  { id: '2', name: 'मलकापूर कापूस बाजार', description: 'विदर्भातील मोठ्या कापूस व्यापार केंद्रांपैकी एक. राबळ्या शेती अर्थव्यवस्थेचा अनुभव.', category: 'बाजार', image: imageUrl('explore-cotton-market', 800, 600), rating: 4.5 },
  { id: '3', name: 'मलकापूर तलाव', description: 'संध्याकाळी फिरण्यासाठी, पक्षी निरीक्षण आणि दिवाळी आतषबाजीसाठी प्रसिद्ध.', category: 'निसर्ग', image: imageUrl('explore-malkapur-lake', 800, 600), rating: 4.6 },
  { id: '4', name: 'नागझिरा वन्यजीव अभयारण्य', description: 'मलकापूरहून ६० किमी — वाघ, बिबट्या आणि दुर्मिळ पक्षी.', category: 'वन्यजीव', image: imageUrl('explore-nagzira-wildlife', 800, 600), rating: 4.8 },
  { id: '5', name: 'शेगाव — गजानन महाराज', description: 'संत गजानन महाराजांचे पवित्र शेगाव — मलकापूरहून ४५ मिनिटे.', category: 'तीर्थक्षेत्र', image: imageUrl('explore-shegaon-pilgrimage', 800, 600), rating: 4.9 },
  { id: '6', name: 'मलकापूर किल्ल्याचे अवशेष', description: '४०० वर्षांच्या वारशाची साक्ष देणारे ऐतिहासिक किल्ले.', category: 'वारसा', image: imageUrl('explore-fort-heritage', 800, 600), rating: 4.3 },
];

export const businessesMr: BusinessItem[] = [
  { id: '1', name: 'पाटील कापूस व्यापारी', category: 'शेती', description: '१९८५ पासून बुलडाणा जिल्ह्यातील शेतकऱ्यांना सेवा.', image: imageUrl('biz-cotton-traders', 400, 300), phone: '+91 7262 123456', rating: 4.7 },
  { id: '2', name: 'हॉटेल साई पॅलेस', category: 'आतिथ्य', description: 'यात्रेकरू आणि पर्यटकांसाठी उत्तम जेवण आणि निवास.', image: imageUrl('biz-hotel-sai', 400, 300), phone: '+91 7262 234567', rating: 4.5 },
  { id: '3', name: 'देशमुख मेडिकल स्टोअर', category: 'आरोग्य', description: '३० वर्षांपासून मलकापूर समुदायाची विश्वासार्ह फार्मसी.', image: imageUrl('biz-medical-store', 400, 300), phone: '+91 7262 345678', rating: 4.8 },
  { id: '4', name: 'विदर्भ हँडलूम केंद्र', category: 'हस्तकला', description: 'प्रामाणिक विदर्भ हातमाग साड्या, बेडशीट आणि वस्त्रे.', image: imageUrl('biz-handloom', 400, 300), phone: '+91 7262 456789', rating: 4.6 },
];

export const galleryItemsMr: GalleryItem[] = [
  { id: '1', title: 'गणेश उत्सव २०२५', category: 'उत्सव', image: imageUrl('gallery-ganesh-utsav', 600, 800) },
  { id: '2', title: 'कापूस कापणी हंगाम', category: 'शेती', image: imageUrl('gallery-cotton-harvest', 600, 800) },
  { id: '3', title: 'मलकापूर तलाव संध्याकाळ', category: 'निसर्ग', image: imageUrl('gallery-lake-evening', 600, 800) },
  { id: '4', title: 'पालखी मिरवणूक', category: 'धार्मिक', image: imageUrl('gallery-palkhi', 600, 800) },
  { id: '5', title: 'स्थानिक रस्ता बाजार', category: 'संस्कृती', image: imageUrl('gallery-street-market', 600, 800) },
  { id: '6', title: 'क्रिकेट अंतिम २०२५', category: 'क्रीडा', image: imageUrl('gallery-cricket', 600, 800) },
  { id: '7', title: 'दिवाळी उत्सव', category: 'उत्सव', image: imageUrl('gallery-diwali', 600, 800) },
  { id: '8', title: 'मंदिर वास्तुकला', category: 'वारसा', image: imageUrl('gallery-temple', 600, 800) },
  { id: '9', title: 'किल्ल्यावर सूर्यास्त', category: 'वारसा', image: imageUrl('gallery-fort-sunset', 600, 800) },
];

export const videosMr: VideoItem[] = [
  { id: '1', title: 'मलकापूर शहर भ्रमंती — संपूर्ण मार्गदर्शक २०२६', description: 'मंदिरे, बाजार, तलाव आणि लपलेली ठिकाणे.', youtubeId: '6stlCkUDG_s', thumbnail: youtubeThumbnail('6stlCkUDG_s'), views: '४५K', date: '2026-05-01', duration: '१२:३४' },
  { id: '2', title: 'गणेश उत्सव २०२५ — संपूर्ण कव्हरेज', description: 'मलकापूरच्या भव्य गणेश उत्सवाचे संपूर्ण वृत्तांकन.', youtubeId: 'Scxs7L0vhZ4', thumbnail: youtubeThumbnail('Scxs7L0vhZ4'), views: '८९K', date: '2025-09-15', duration: '१८:२२' },
  { id: '3', title: 'विदर्भात कापूस शेती — माहितीपट', description: 'मलकापूरच्या अर्थव्यवस्थेचा कापूस शेती संदर्भ.', youtubeId: 'xC3qUeZaR6Q', thumbnail: youtubeThumbnail('xC3qUeZaR6Q'), views: '३२K', date: '2026-03-20', duration: '२२:१०' },
  { id: '4', title: 'मलकापूर पदपथ खाद्य विशेष', description: 'वडा पाव, मिसळ पाव आणि स्थानिक खाद्यपदार्थ.', youtubeId: 'NUSo8jTFu9s', thumbnail: youtubeThumbnail('NUSo8jTFu9s'), views: '६७K', date: '2026-04-10', duration: '८:४५' },
  { id: '5', title: 'पालखी सोहळा २०२५ — भक्ती यात्रा', description: 'मलकापूर ते शेगाव पवित्र पालखी मिरवणूक.', youtubeId: 'kSxUZ8fhdVY', thumbnail: youtubeThumbnail('kSxUZ8fhdVY'), views: '११२K', date: '2025-07-12', duration: '२५:००' },
  { id: '6', title: 'मलकापूर मॅरेथॉन हायलाइट्स', description: 'वार्षिक मॅरेथॉनचे ठळक क्षण आणि मुलाखती.', youtubeId: '1zyhGnsHn0c', thumbnail: youtubeThumbnail('1zyhGnsHn0c'), views: '१८K', date: '2025-08-05', duration: '६:३०' },
];

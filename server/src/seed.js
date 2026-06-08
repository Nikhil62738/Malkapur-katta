import "dotenv/config"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import mongoose from "mongoose"
import { connectDB } from "./config/db.js"
import { getModel } from "./models/Doc.js"

// Mirror of src/utils/media.ts helpers so seeded content matches the site.
const HTTPS = "https:" + "//"
const imageUrl = (seed, w = 800, h = 600) =>
	`${HTTPS}picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
const youtubeThumbnail = (id) => `${HTTPS}img.youtube.com/vi/${id}/hqdefault.jpg`

const NEWS_DATA = [
	{ titleEn: "Malkapur Cotton Market Sets New Record with \u20B97,200 per Quintal", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u093E\u092A\u0942\u0938 \u092C\u093E\u091C\u093E\u0930\u093E\u0924 \u20B9\u096D,\u0968\u0966\u0966 \u092A\u094D\u0930\u0924\u093F \u0915\u094D\u0935\u093F\u0902\u091F\u0932 \u2014 \u0928\u0935\u093E \u0935\u093F\u0915\u094D\u0930\u092E", excerptEn: "Farmers in Malkapur and surrounding villages celebrate as cotton prices hit a decade-high, boosting the local agrarian economy significantly.", excerptMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0906\u0923\u093F \u092A\u0930\u093F\u0938\u0930\u093E\u0924\u0940\u0932 \u0936\u0947\u0924\u0915\u0930\u0940 \u0906\u0928\u0902\u0926\u0940 \u2014 \u0915\u093E\u092A\u0938\u093E\u0932 \u0926\u0936\u0915\u093E\u0924\u0940\u0932 \u0938\u0930\u094D\u0935\u094B\u091A\u094D\u091A \u092D\u093E\u0935, \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0936\u0947\u0924\u0940 \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u0947\u0932\u093E \u091A\u093E\u0932\u0928\u093E.", category: "Economy", date: "2026-05-28", image: imageUrl("malkapur-cotton-market", 800, 600), author: "Rajesh Patil", featured: true },
	{ titleEn: "Ganesh Utsav 2026: Malkapur's Biggest Festival Preparations Underway", titleMr: "\u0917\u0923\u0947\u0936 \u0909\u0924\u094D\u0938\u0935 \u0968\u0966\u0968\u096C: \u092E\u0932\u0915\u093E\u092A\u0942\u0930\u093E\u0924\u0940\u0932 \u0938\u0930\u094D\u0935\u093E\u0924 \u092E\u094B\u0920\u094D\u092F\u093E \u0938\u0923\u093E\u091A\u0940 \u0924\u092F\u093E\u0930\u0940", excerptEn: "Over 200 Ganesh mandals across Malkapur city begin elaborate decoration and cultural program planning for the 10-day festival.", excerptMr: "\u0936\u0939\u0930\u093E\u0924\u0940\u0932 \u0968\u0966\u0966 \u0939\u0942\u0928 \u0905\u0927\u093F\u0915 \u0917\u0923\u0947\u0936 \u092E\u0902\u0921\u0933\u0947 \u0926\u0939\u093E \u0926\u093F\u0935\u0938\u093E\u0902\u091A\u094D\u092F\u093E \u0909\u0924\u094D\u0938\u0935\u093E\u0938\u093E\u0920\u0940 \u0938\u091C\u093E\u0935\u091F \u0906\u0923\u093F \u0938\u093E\u0902\u0938\u094D\u0915\u0943\u0924\u093F\u0915 \u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E\u093E\u0902\u091A\u0947 \u0928\u093F\u092F\u094B\u091C\u0928 \u0915\u0930\u0924 \u0906\u0939\u0947\u0924.", category: "Culture", date: "2026-05-25", image: imageUrl("malkapur-ganesh-festival", 800, 600), author: "Priya Deshmukh", featured: true },
	{ titleEn: "New Bus Connectivity: Malkapur to Aurangabad Direct Route Launched", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0924\u0947 \u0914\u0930\u0902\u0917\u093E\u092C\u093E\u0926 \u0925\u0947\u091F \u092C\u0938 \u0938\u0947\u0935\u093E \u0938\u0941\u0930\u0942", excerptEn: "MSRTC introduces a new direct bus service connecting Malkapur to Chhatrapati Sambhajinagar, reducing travel time by 2 hours.", excerptMr: "\u090F\u092E\u090F\u0938\u0906\u0930\u091F\u0940\u0938\u0940\u0928\u0947 \u0928\u0935\u0940 \u0925\u0947\u091F \u092C\u0938 \u0938\u0947\u0935\u093E \u0938\u0941\u0930\u0942 \u0915\u0947\u0932\u0940 \u2014 \u092A\u094D\u0930\u0935\u093E\u0938 \u0935\u0947\u0933 \u0926\u094B\u0928 \u0924\u093E\u0938\u093E\u0902\u0928\u0940 \u0915\u092E\u0940.", category: "Infrastructure", date: "2026-05-22", image: imageUrl("malkapur-bus-transport", 800, 600), author: "Amit Kulkarni", featured: false },
	{ titleEn: "Youth Cricket League Finals Draw Massive Crowd at Malkapur Ground", titleMr: "\u092F\u0941\u0935\u093E \u0915\u094D\u0930\u093F\u0915\u0947\u091F \u0932\u0940\u0917 \u0905\u0902\u0924\u093F\u092E \u0938\u093E\u092E\u0928\u093E \u2014 \u096B,\u0966\u0966\u0966 \u092A\u094D\u0930\u0947\u0915\u094D\u0937\u0915", excerptEn: "The Malkapur Premier League T20 finals saw over 5,000 spectators as local teams battled for the championship trophy.", excerptMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092A\u094D\u0930\u0940\u092E\u093F\u092F\u0930 \u0932\u0940\u0917 \u091F\u0940\u0968\u0966 \u0905\u0902\u0924\u093F\u092E \u0938\u093E\u092E\u0928\u094D\u092F\u093E\u0924 \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0938\u0902\u0918\u093E\u0902\u092E\u0927\u094D\u092F\u0947 \u0909\u0924\u094D\u0915\u091F \u0938\u094D\u092A\u0930\u094D\u0927\u093E.", category: "Sports", date: "2026-05-20", image: imageUrl("malkapur-cricket-sports", 800, 600), author: "Sandeep Jadhav", featured: false },
	{ titleEn: "Shegaon Gajanan Maharaj Temple: Special Abhishek on Guru Purnima", titleMr: "\u0936\u0947\u0917\u093E\u0935 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u092E\u0902\u0926\u093F\u0930: \u0917\u0941\u0930\u0941 \u092A\u094C\u0930\u094D\u0923\u093F\u092E\u093E \u0935\u093F\u0936\u0947\u0937 \u0905\u092D\u093F\u0937\u0947\u0915", excerptEn: "Devotees from Malkapur prepare for the annual pilgrimage to Shegaon for Guru Purnima celebrations at Gajanan Maharaj temple.", excerptMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930\u0939\u0942\u0928 \u0936\u0947\u0917\u093E\u0935 \u092F\u093E\u0924\u094D\u0930\u0947\u0938\u093E\u0920\u0940 \u092D\u093E\u0935\u093F\u0915 \u0924\u092F\u093E\u0930 \u2014 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u092E\u0902\u0926\u093F\u0930\u093E\u0924 \u0935\u093F\u0936\u0947\u0937 \u0935\u093F\u0927\u0940.", category: "Spiritual", date: "2026-05-18", image: imageUrl("malkapur-temple-spiritual", 800, 600), author: "Meera Bhosale", featured: false },
	{ titleEn: "Malkapur Smart City Project: Phase 1 Road Development Complete", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0938\u093F\u091F\u0940: \u092A\u0939\u093F\u0932\u094D\u092F\u093E \u091F\u092A\u094D\u092A\u094D\u092F\u093E\u0924\u0940\u0932 \u0930\u0938\u094D\u0924\u0947 \u092A\u0942\u0930\u094D\u0923", excerptEn: "The municipal council completes resurfacing of 15 km of city roads with LED street lighting as part of the smart city initiative.", excerptMr: "\u0928\u0917\u0930\u092A\u093E\u0932\u093F\u0915\u0947\u0928\u0947 \u0967\u096B \u0915\u093F\u092E\u0940 \u0930\u0938\u094D\u0924\u0947 \u092A\u0941\u0928\u0930\u094D\u0930\u091A\u0928\u093E \u0906\u0923\u093F \u090F\u0932\u0908\u0921\u0940 \u0926\u093F\u0935\u0947 \u092C\u0938\u0935\u0932\u0947.", category: "Development", date: "2026-05-15", image: imageUrl("malkapur-city-development", 800, 600), author: "Vikram More", featured: false },
]

const EVENTS_DATA = [
	{ titleEn: "Malkapur Cultural Night 2026", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0938\u093E\u0902\u0938\u094D\u0915\u0943\u0924\u093F\u0915 \u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933 \u0968\u0966\u0968\u096C", descriptionEn: "An evening of Lavani, Tamasha, and folk music celebrating Vidarbha's rich cultural heritage at the Municipal Ground.", descriptionMr: "\u0932\u093E\u0935\u0923\u0940, \u0924\u092E\u093E\u0936\u093E \u0906\u0923\u093F \u0932\u094B\u0915\u0917\u0940\u0924 \u2014 \u0935\u093F\u0926\u0930\u094D\u092D\u093E\u091A\u094D\u092F\u093E \u0938\u0902\u0938\u094D\u0915\u0943\u0924\u0940\u091A\u093E \u0909\u0924\u094D\u0938\u0935, \u0928\u0917\u0930\u092A\u093E\u0932\u093F\u0915\u093E \u092E\u0948\u0926\u093E\u0928.", date: "2026-06-15", time: "6:00 PM", locationEn: "Malkapur Municipal Ground", locationMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0928\u0917\u0930\u092A\u093E\u0932\u093F\u0915\u093E \u092E\u0948\u0926\u093E\u0928", image: imageUrl("malkapur-cultural-night", 800, 600), category: "Culture" },
	{ titleEn: "Farmers Market & Organic Fair", titleMr: "\u0936\u0947\u0924\u0915\u0930\u0940 \u092C\u093E\u091C\u093E\u0930 \u0906\u0923\u093F \u0938\u0947\u0902\u0926\u094D\u0930\u093F\u092F \u092E\u0947\u0933\u093E", descriptionEn: "Local farmers showcase organic produce, cotton products, and traditional Vidarbha handicrafts.", descriptionMr: "\u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0936\u0947\u0924\u0915\u0930\u0940 \u0938\u0947\u0902\u0926\u094D\u0930\u093F\u092F \u0909\u0924\u094D\u092A\u093E\u0926\u0928\u0947, \u0915\u093E\u092A\u0942\u0938 \u0906\u0923\u093F \u0935\u093F\u0926\u0930\u094D\u092D \u0939\u0938\u094D\u0924\u0915\u0932\u093E \u092A\u094D\u0930\u0926\u0930\u094D\u0936\u093F\u0924 \u0915\u0930\u0924\u0940\u0932.", date: "2026-06-22", time: "9:00 AM", locationEn: "Cotton Market Yard, Malkapur", locationMr: "\u0915\u093E\u092A\u0942\u0938 \u092C\u093E\u091C\u093E\u0930 \u092A\u0930\u093F\u0938\u0930, \u092E\u0932\u0915\u093E\u092A\u0942\u0930", image: imageUrl("malkapur-farmers-market", 800, 600), category: "Market" },
	{ titleEn: "Gajanan Maharaj Palkhi Sohala", titleMr: "\u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u092A\u093E\u0932\u0916\u0940 \u0938\u094B\u0939\u0933\u093E", descriptionEn: "Annual procession from Malkapur to Shegaon with bhajan mandals, dhol-tasha, and thousands of devotees.", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0924\u0947 \u0936\u0947\u0917\u093E\u0935 \u092A\u093E\u0932\u0916\u0940 \u2014 \u092D\u091C\u0928 \u092E\u0902\u0921\u0933, \u0922\u094B\u0932-\u0924\u093E\u0936\u093E \u0906\u0923\u093F \u0939\u091C\u093E\u0930\u094B \u092D\u093E\u0935\u093F\u0915.", date: "2026-07-10", time: "5:00 AM", locationEn: "Shri Gajanan Mandir, Malkapur", locationMr: "\u0936\u094D\u0930\u0940 \u0917\u091C\u093E\u0928\u0928 \u092E\u0902\u0926\u093F\u0930, \u092E\u0932\u0915\u093E\u092A\u0942\u0930", image: imageUrl("malkapur-ganesh-festival", 800, 600), category: "Spiritual" },
	{ titleEn: "Malkapur Marathon 2026", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092E\u0945\u0930\u0925\u0949\u0928 \u0968\u0966\u0968\u096C", descriptionEn: "5K and 10K run through the scenic routes of Malkapur city. Open to all age groups with prizes for winners.", descriptionMr: "\u096B \u0915\u093F\u092E\u0940 \u0906\u0923\u093F \u0967\u0966 \u0915\u093F\u092E\u0940 \u0927\u093E\u0935 \u2014 \u0938\u0930\u094D\u0935 \u0935\u092F\u094B\u0917\u091F\u093E\u0902\u0938\u093E\u0920\u0940, \u0935\u093F\u091C\u0947\u0924\u094D\u092F\u093E\u0902\u0928\u093E \u092C\u0915\u094D\u0937\u093F\u0938\u0947.", date: "2026-08-03", time: "6:30 AM", locationEn: "City Clock Tower, Malkapur", locationMr: "\u0938\u093F\u091F\u0940 \u0915\u094D\u0932\u0949\u0915 \u091F\u0949\u0935\u0930, \u092E\u0932\u0915\u093E\u092A\u0942\u0930", image: imageUrl("malkapur-marathon", 800, 600), category: "Sports" },
	{ titleEn: "Diwali Utsav & Fireworks Display", titleMr: "\u0926\u093F\u0935\u093E\u0933\u0940 \u0909\u0924\u094D\u0938\u0935 \u0906\u0923\u093F \u0906\u0924\u0937\u092C\u093E\u091C\u0940", descriptionEn: "Community Diwali celebration with rangoli competition, diyas lighting, and spectacular fireworks at the lake.", descriptionMr: "\u0930\u0902\u0917\u094B\u0933\u0940 \u0938\u094D\u092A\u0930\u094D\u0927\u093E, \u0926\u093F\u0935\u0947 \u0932\u093E\u0935\u0923\u0947 \u0906\u0923\u093F \u0924\u0932\u093E\u0935\u093E\u091C\u0935\u0933 \u092D\u0935\u094D\u092F \u0906\u0924\u0937\u092C\u093E\u091C\u0940.", date: "2026-10-20", time: "7:00 PM", locationEn: "Malkapur Lake, Near Bus Stand", locationMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0924\u0932\u093E\u0935, \u092C\u0938\u0938\u094D\u0925\u093E\u0928\u0915\u093E\u091C\u0935\u0933", image: imageUrl("malkapur-ganesh-festival", 800, 600), category: "Festival" },
	{ titleEn: "Youth Tech Summit Malkapur", titleMr: "\u092F\u0941\u0935\u093E \u0924\u0902\u0924\u094D\u0930\u091C\u094D\u091E\u093E\u0928 \u0938\u092E\u093F\u091F \u092E\u0932\u0915\u093E\u092A\u0942\u0930", descriptionEn: "Technology workshops, startup pitches, and career guidance for Malkapur's young entrepreneurs and students.", descriptionMr: "\u0924\u0902\u0924\u094D\u0930\u091C\u094D\u091E\u093E\u0928 \u0915\u093E\u0930\u094D\u092F\u0936\u093E\u0933\u093E, \u0938\u094D\u091F\u093E\u0930\u094D\u091F\u0905\u092A \u0938\u093E\u0926\u0930\u0940\u0915\u0930\u0923 \u0906\u0923\u093F \u0915\u0930\u093F\u092F\u0930 \u092E\u093E\u0930\u094D\u0917\u0926\u0930\u094D\u0936\u0928.", date: "2026-09-12", time: "10:00 AM", locationEn: "Dr. Babasaheb Ambedkar College, Malkapur", locationMr: "\u0921\u0949. \u092C\u093E\u092C\u093E\u0938\u093E\u0939\u0947\u092C \u0906\u0902\u092C\u0947\u0921\u0915\u0930 \u092E\u0939\u093E\u0935\u093F\u0926\u094D\u092F\u093E\u0932\u092F, \u092E\u0932\u0915\u093E\u092A\u0942\u0930", image: imageUrl("malkapur-tech-summit", 800, 600), category: "Education" },
]

const PLACES_DATA = [
	{ nameEn: "Shri Gajanan Maharaj Mandir", nameMr: "\u0936\u094D\u0930\u0940 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u092E\u0902\u0926\u093F\u0930", descriptionEn: "A revered spiritual center drawing devotees from across Maharashtra. Experience peace and divine blessings.", descriptionMr: "\u092E\u0939\u093E\u0930\u093E\u0937\u094D\u091F\u094D\u0930\u092D\u0930\u093E\u0924\u0940\u0932 \u092D\u093E\u0935\u093F\u0915\u093E\u0902\u0928\u093E \u0906\u0915\u0930\u094D\u0937\u093F\u0924 \u0915\u0930\u0923\u093E\u0930\u0947 \u092A\u0935\u093F\u0924\u094D\u0930 \u0915\u0947\u0902\u0926\u094D\u0930. \u0936\u093E\u0902\u0924\u0940 \u0906\u0923\u093F \u0906\u0936\u0940\u0930\u094D\u0935\u093E\u0926\u093E\u091A\u093E \u0905\u0928\u0941\u092D\u0935.", category: "Temples", image: imageUrl("explore-gajanan-temple", 800, 600), rating: 4.9, distance: "1.5 km", mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3744.1704256424364!2d76.1969695!3d20.8711462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1144a1eb47%3A0xcb1b51e9b251219b!2sShri%20Sant%20Gajanan%20Maharaj%20Mandir%20Malkapur!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Shri+Sant+Gajanan+Maharaj+Mandir+Malkapur" },
	{ nameEn: "Malkapur Cotton Market", nameMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u093E\u092A\u0942\u0938 \u092C\u093E\u091C\u093E\u0930", descriptionEn: "One of Vidarbha's largest cotton trading hubs. Witness the bustling agrarian economy in action.", descriptionMr: "\u0935\u093F\u0926\u0930\u094D\u092D\u093E\u0924\u0940\u0932 \u092E\u094B\u0920\u094D\u092F\u093E \u0915\u093E\u092A\u0942\u0938 \u0935\u094D\u092F\u093E\u092A\u093E\u0930 \u0915\u0947\u0902\u0926\u094D\u0930\u093E\u0902\u092A\u0948\u0915\u0940 \u090F\u0915. \u0930\u093E\u092C\u0933\u094D\u092F\u093E \u0936\u0947\u0924\u0940 \u0905\u0930\u094D\u0925\u0935\u094D\u092F\u0935\u0938\u094D\u0925\u0947\u091A\u093E \u0905\u0928\u0941\u092D\u0935.", category: "Markets", image: imageUrl("explore-cotton-market", 800, 600), rating: 4.5, distance: "2 km", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Krushi+Utpanna+Bazar+Samiti+Malkapur" },
	{ nameEn: "Malkapur Lake", nameMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0924\u0932\u093E\u0935", descriptionEn: "A serene lake perfect for evening walks, bird watching, and the famous Diwali fireworks display.", descriptionMr: "\u0938\u0902\u0927\u094D\u092F\u093E\u0915\u093E\u0933\u0940 \u092B\u093F\u0930\u0923\u094D\u092F\u093E\u0938\u093E\u0920\u0940, \u092A\u0915\u094D\u0937\u0940 \u0928\u093F\u0930\u0940\u0915\u094D\u0937\u0923 \u0906\u0923\u093F \u0926\u093F\u0935\u093E\u0933\u0940 \u0906\u0924\u0937\u092C\u093E\u091C\u0940\u0938\u093E\u0920\u0940 \u092A\u094D\u0930\u0938\u093F\u0926\u094D\u0927.", category: "Nature", image: imageUrl("explore-malkapur-lake", 800, 600), rating: 4.6, distance: "3.5 km", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Malkapur+Lake" },
	{ nameEn: "Nagzira Wildlife Sanctuary", nameMr: "\u0928\u093E\u0917\u091D\u093F\u0930\u093E \u0935\u0928\u094D\u092F\u091C\u0940\u0935 \u0905\u092D\u092F\u093E\u0930\u0923\u094D\u092F", descriptionEn: "Just 60 km from Malkapur \u2014 spot tigers, leopards, and exotic birds in this pristine sanctuary.", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930\u0939\u0942\u0928 \u096C\u0966 \u0915\u093F\u092E\u0940 \u2014 \u0935\u093E\u0918, \u092C\u093F\u092C\u091F\u094D\u092F\u093E \u0906\u0923\u093F \u0926\u0941\u0930\u094D\u092E\u093F\u0933 \u092A\u0915\u094D\u0937\u0940.", category: "Nature", image: imageUrl("explore-nagzira-wildlife", 800, 600), rating: 4.8, distance: "60 km", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Nagzira+Wildlife+Sanctuary" },
	{ nameEn: "Shegaon \u2014 Gajanan Maharaj", nameMr: "\u0936\u0947\u0917\u093E\u0935 \u2014 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C", descriptionEn: "The holy town of Shegaon, birthplace of Sant Gajanan Maharaj, just 45 minutes from Malkapur.", descriptionMr: "\u0938\u0902\u0924 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C\u093E\u0902\u091A\u0947 \u092A\u0935\u093F\u0924\u094D\u0930 \u0936\u0947\u0917\u093E\u0935 \u2014 \u092E\u0932\u0915\u093E\u092A\u0942\u0930\u0939\u0942\u0928 \u096A\u096B \u092E\u093F\u0928\u093F\u091F\u0947.", category: "Temples", image: imageUrl("explore-shegaon-pilgrimage", 800, 600), rating: 4.9, distance: "45 km", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Shri+Gajanan+Maharaj+Temple+Shegaon" },
	{ nameEn: "Malkapur Fort Ruins", nameMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u093F\u0932\u094D\u0932\u094D\u092F\u093E\u091A\u0947 \u0905\u0935\u0936\u0947\u0937", descriptionEn: "Explore the historic fort remnants that tell tales of Malkapur's 400-year-old heritage.", descriptionMr: "\u096A\u0966\u0966 \u0935\u0930\u094D\u0937\u093E\u0902\u091A\u094D\u092F\u093E \u0935\u093E\u0930\u0936\u093E\u091A\u0940 \u0938\u093E\u0915\u094D\u0937 \u0926\u0947\u0923\u093E\u0930\u0947 \u0910\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0915\u093F\u0932\u094D\u0932\u0947.", category: "Historical Sites", image: imageUrl("explore-fort-heritage", 800, 600), rating: 4.3, distance: "5 km", directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=Malkapur+Fort" },
]

const BUSINESSES_DATA = [
	{ nameEn: "Patil Cotton Traders", nameMr: "\u092A\u093E\u091F\u0940\u0932 \u0915\u093E\u092A\u0942\u0938 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u0940", category: "Agriculture", descriptionEn: "Leading cotton trading firm serving farmers across Buldhana district since 1985.", descriptionMr: "\u0967\u096F\u096E\u096B \u092A\u093E\u0938\u0942\u0928 \u092C\u0941\u0932\u0921\u093E\u0923\u093E \u091C\u093F\u0932\u094D\u0939\u094D\u092F\u093E\u0924\u0940\u0932 \u0936\u0947\u0924\u0915\u0930\u094D\u092F\u093E\u0902\u0928\u093E \u0938\u0947\u0935\u093E.", image: imageUrl("biz-cotton-traders", 400, 300), phone: "+91 7262 123456", rating: 4.7 },
	{ nameEn: "Hotel Sai Palace", nameMr: "\u0939\u0949\u091F\u0947\u0932 \u0938\u093E\u0908 \u092A\u0945\u0932\u0947\u0938", category: "Hotels", descriptionEn: "Premium dining and comfortable stays for pilgrims and travelers visiting Malkapur.", descriptionMr: "\u092F\u093E\u0924\u094D\u0930\u0947\u0915\u0930\u0942 \u0906\u0923\u093F \u092A\u0930\u094D\u092F\u091F\u0915\u093E\u0902\u0938\u093E\u0920\u0940 \u0909\u0924\u094D\u0924\u092E \u091C\u0947\u0935\u0923 \u0906\u0923\u093F \u0928\u093F\u0935\u093E\u0938.", image: imageUrl("biz-hotel-sai", 400, 300), phone: "+91 7262 234567", rating: 4.5 },
	{ nameEn: "Deshmukh Medical Store", nameMr: "\u0926\u0947\u0936\u092E\u0941\u0916 \u092E\u0947\u0921\u093F\u0915\u0932 \u0938\u094D\u091F\u094B\u0905\u0930", category: "Hospitals", descriptionEn: "Trusted pharmacy and medical supplies serving Malkapur community for 30+ years.", descriptionMr: "\u096A\u0966 \u0935\u0930\u094D\u0937\u093E\u0902\u092A\u093E\u0938\u0942\u0928 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0938\u092E\u0941\u0926\u093E\u092F\u093E\u091A\u0940 \u0935\u093F\u0936\u094D\u0935\u093E\u0938\u093E\u0930\u094D\u0939 \u092B\u093E\u0930\u094D\u092E\u0938\u0940.", image: imageUrl("biz-medical-store", 400, 300), phone: "+91 7262 345678", rating: 4.8 },
	{ nameEn: "Vidarbha Handloom Center", nameMr: "\u0935\u093F\u0926\u0930\u094D\u092D \u0939\u0901\u0921\u0932\u0942\u092E \u0915\u0947\u0902\u0926\u094D\u0930", category: "Retail", descriptionEn: "Authentic Vidarbha handloom sarees, bedsheets, and traditional textiles.", descriptionMr: "\u092A\u094D\u0930\u093E\u092E\u093E\u0923\u093F\u0915 \u0935\u093F\u0926\u0930\u094D\u092D \u0939\u093E\u0924\u092E\u093E\u0917 \u0938\u093E\u0921\u094D\u092F\u093E, \u092C\u0947\u0921\u0936\u0940\u091F \u0906\u0923\u093F \u0935\u0938\u094D\u0924\u094D\u0930\u0947.", image: imageUrl("biz-handloom", 400, 300), phone: "+91 7262 456789", rating: 4.6 },
]

const GALLERY_DATA = [
	{ title: "Ganesh Utsav 2025", category: "Festival Photos", image: imageUrl("gallery-ganesh-utsav", 600, 800) },
	{ title: "Cotton Harvest Season", category: "City Photos", image: imageUrl("gallery-cotton-harvest", 600, 800) },
	{ title: "Malkapur Lake Evening", category: "City Photos", image: imageUrl("gallery-lake-evening", 600, 800) },
	{ title: "Palkhi Procession", category: "Festival Photos", image: imageUrl("gallery-palkhi", 600, 800) },
	{ title: "Local Street Market", category: "City Photos", image: imageUrl("gallery-street-market", 600, 800) },
	{ title: "Cricket Finals 2025", category: "City Photos", image: imageUrl("gallery-cricket", 600, 800) },
	{ title: "Diwali Celebrations", category: "Festival Photos", image: imageUrl("gallery-diwali", 600, 800) },
	{ title: "Temple Architecture", category: "Festival Photos", image: imageUrl("gallery-temple", 600, 800) },
	{ title: "Sunset at Fort", category: "City Photos", image: imageUrl("gallery-fort-sunset", 600, 800) },
]

const VIDEOS_DATA = [
	{ type: "instagram", titleEn: "Panchamukhi Mandir Malkapur", titleMr: "\u092A\u0902\u091A\u092E\u0941\u0916\u0940 \u092E\u0902\u0926\u093F\u0930 \u092E\u0932\u0915\u093E\u092A\u0942\u0930", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/Panchamukhi Mandir Malkapur.mp4", thumbnailUrl: "", views: "125K", date: "2026-01-01", duration: "0:45", featured: false },
	{ type: "instagram", titleEn: "Tirupati Balaji Nandura", titleMr: "\u0924\u093F\u0930\u0941\u092A\u0924\u0940 \u092C\u093E\u0932\u093E\u091C\u0940 \u0928\u093E\u0902\u0926\u0941\u0930\u093E", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/Tirupati Balaji Nandura.mp4", thumbnailUrl: "", views: "89K", date: "2026-01-01", duration: "1:12", featured: false },
	{ type: "instagram", titleEn: "Ek Rahenge Nek Rahenge", titleMr: "\u090F\u0915 \u0930\u0939\u0947\u0902\u0917\u0947 \u0928\u0947\u0915 \u0930\u0939\u0947\u0902\u0917\u0947", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/Sopan kenerkar.mp4", thumbnailUrl: "", views: "210K", date: "2026-01-01", duration: "0:58", featured: false },
	{ type: "instagram", titleEn: "Ganpati Visarjan Malkapur", titleMr: "\u0917\u0923\u092A\u0924\u0940 \u0935\u093F\u0938\u0930\u094D\u091C\u0928 \u092E\u0932\u0915\u093E\u092A\u0942\u0930", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/\u0917\u0923\u092A\u0924\u0940 \u0935\u093F\u0938\u0930\u094D\u091C\u0928 \u092E\u0932\u0915\u093E\u092A\u0942\u0930.mp4", thumbnailUrl: "", views: "156K", date: "2026-01-01", duration: "1:30", featured: false },
	{ type: "instagram", titleEn: "Malkapur City View", titleMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930\u091A\u093E \u0928\u091C\u093E\u0930\u093E", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/\u092E\u0932\u0915\u093E\u092A\u0942\u0930\u091A\u093E \u0928\u091C\u093E\u0930\u093E.mp4", thumbnailUrl: "", views: "67K", date: "2026-01-01", duration: "0:32", featured: false },
	{ type: "instagram", titleEn: "Mujhe Chadh Gaya Bhagwa Rang", titleMr: "\u092E\u0941\u091D\u0947 \u091A\u0922 \u0917\u092F\u093E \u092D\u0917\u0935\u093E \u0930\u0902\u0917 \u0930\u0902\u0917 \u092F\u0947 \u092D\u0917\u0935\u093E \u0930\u0902\u0917", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/\u092E\u0941\u091D\u0947 \u091A\u0922 \u0917\u092F\u093E \u092D\u0917\u0935\u093E \u0930\u0902\u0917 \u0930\u0902\u0917 \u092F\u0947 \u092D\u0917\u0935\u093E \u0930\u0902\u0917.mp4", thumbnailUrl: "", views: "98K", date: "2026-01-01", duration: "1:05", featured: false },
	{ type: "instagram", titleEn: "Ram Navami Malkapur 2025", titleMr: "\u0930\u093E\u092E\u0928\u0935\u092E\u0940 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 2025", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/\u0930\u093E\u092E\u0928\u0935\u092E\u0940 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 2025.mp4", thumbnailUrl: "", views: "110K", date: "2026-01-01", duration: "0:50", featured: false },
	{ type: "instagram", titleEn: "Shri Sant Gajanan Maharaj Ghirni, Malkapur", titleMr: "\u0936\u094D\u0930\u0940 \u0938\u0902\u0924 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u0918\u093F\u0930\u094D\u0923\u0940, \u092E\u0932\u0915\u093E\u092A\u0942\u0930", descriptionEn: "Instagram Reel from Malkapur", descriptionMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u092F\u0947\u0925\u0940\u0932 \u0907\u0902\u0938\u094D\u091F\u093E\u0917\u094D\u0930\u093E\u092E \u0930\u0940\u0932", videoUrl: "/reels/\u0936\u094D\u0930\u0940 \u0938\u0902\u0924 \u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u0918\u093F\u0930\u094D\u0923\u0940, \u092E\u0932\u0915\u093E\u092A\u0942\u0930.mp4", thumbnailUrl: "", views: "75K", date: "2026-01-01", duration: "0:40", featured: false },
]

const POLLS_DATA = [
	{ id: "poll-1", category: "events", questionKey: "polls.poll1q", options: [{ id: "o1", labelKey: "polls.poll1o1" }, { id: "o2", labelKey: "polls.poll1o2" }, { id: "o3", labelKey: "polls.poll1o3" }, { id: "o4", labelKey: "polls.poll1o4" }], votes: { o1: 142, o2: 89, o3: 156, o4: 67 } },
	{ id: "poll-2", category: "civic", questionKey: "polls.poll2q", options: [{ id: "o1", labelKey: "polls.poll2o1" }, { id: "o2", labelKey: "polls.poll2o2" }, { id: "o3", labelKey: "polls.poll2o3" }, { id: "o4", labelKey: "polls.poll2o4" }], votes: { o1: 98, o2: 134, o3: 76, o4: 112 } },
	{ id: "poll-3", category: "general", questionKey: "polls.poll3q", options: [{ id: "o1", labelKey: "polls.poll3o1" }, { id: "o2", labelKey: "polls.poll3o2" }, { id: "o3", labelKey: "polls.poll3o3" }], votes: { o1: 201, o2: 87, o3: 145 } },
]

const GENERAL_SETTINGS = {
	siteName: "Malkapur Katta Official",
	logoUrl: "/logo.jpeg",
	faviconUrl: "/favicon.ico",
	facebook: "https://facebook.com/malkapurkatta",
	instagram: "https://instagram.com/malkapurkatta",
	youtube: "https://youtube.com/malkapurkatta",
	stats: [
		{ label: "Community Members", value: 52000, suffix: "+" },
		{ label: "Local Businesses", value: 850, suffix: "+" },
		{ label: "Events This Year", value: 120, suffix: "+" },
		{ label: "Years of Heritage", value: 400, suffix: "+" },
	],
}

const CONTACT_SETTINGS = {
	phone: "+91 7262 123456",
	email: "hello@malkapurkatta.com",
	addressEn: "Malkapur, Buldhana District, Maharashtra 443101",
	addressMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930, \u092C\u0941\u0932\u0922\u093E\u0923\u093E \u091C\u093F\u0932\u094D\u0939\u093E, \u092E\u0939\u093E\u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u096A\u096A\u0969\u0967\u0966\u0967",
	mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119058.123456789!2d76.2!3d20.88!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd71e1234567890%3A0xabcdef1234567890!2sMalkapur%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1234567890",
	facebook: "https://facebook.com/malkapurkatta",
	instagram: "https://instagram.com/malkapurkatta",
	youtube: "https://youtube.com/malkapurkatta",
	twitter: "https://twitter.com/malkapurkatta",
}

const HOME_SETTINGS = {
	headlines: [
		"Ganesh Utsav 2026 preparations begin across Malkapur \u2014 community committees meet today",
		"New cotton market rates announced \u2014 farmers celebrate record prices this season",
		"Malkapur Municipal Council approves smart city lighting project for main roads",
		"Annual Gajanan Maharaj Palkhi procession route finalized \u2014 lakhs expected to participate",
		"Malkapur Katta community crosses 50,000 followers \u2014 thank you Malkapur!",
	],
	headlinesMr: [
		"\u0917\u0923\u0947\u0936 \u0909\u0924\u094D\u0938\u0935 \u0968\u0966\u0968\u096C\u091A\u0940 \u0924\u092F\u093E\u0930\u0940 \u092E\u0932\u0915\u093E\u092A\u0942\u0930\u092D\u0930 \u0938\u0941\u0930\u0942 \u2014 \u0938\u092E\u0941\u0926\u093E\u092F \u0938\u092E\u093F\u0924\u0940\u0902\u091A\u0940 \u0906\u091C \u092C\u0948\u0920\u0915",
		"\u0915\u093E\u092A\u0942\u0938 \u092C\u093E\u091C\u093E\u0930 \u092D\u093E\u0935 \u091C\u093E\u0939\u0940\u0930 \u2014 \u092F\u093E \u0939\u0902\u0917\u093E\u092E\u093E\u0924 \u0936\u0947\u0924\u0915\u0930\u094D\u092F\u093E\u0902\u0928\u093E \u0935\u093F\u0915\u094D\u0930\u092E\u0940 \u0926\u0930\u093E\u091A\u093E \u0906\u0928\u0902\u0926",
		"\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0928\u0917\u0930\u092A\u093E\u0932\u093F\u0915\u0947\u0928\u0947 \u092E\u0941\u0916\u094D\u092F \u0930\u0938\u094D\u0924\u094D\u092F\u093E\u0902\u0938\u093E\u0920\u0940 \u0938\u094D\u092E\u093E\u0930\u094D\u091F \u0938\u093F\u091F\u0940 \u0932\u093E\u0907\u091F\u093F\u0902\u0917 \u092E\u0902\u091C\u0942\u0930 \u0915\u0947\u0932\u0947",
		"\u0917\u091C\u093E\u0928\u0928 \u092E\u0939\u093E\u0930\u093E\u091C \u092A\u093E\u0932\u0916\u0940 \u092E\u093E\u0930\u094D\u0917 \u0905\u0902\u0924\u093F\u092E \u2014 \u0932\u093E\u0916\u094B \u092D\u093E\u0935\u093F\u0915 \u0938\u0939\u092D\u093E\u0917\u0940 \u0939\u094B\u0923\u094D\u092F\u093E\u091A\u0940 \u0905\u092A\u0947\u0915\u094D\u0937\u093E",
		"\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u091F\u094D\u091F\u093E \u0938\u092E\u0941\u0926\u093E\u092F \u096B\u0966,\u0966\u0966\u0966 \u092B\u0949\u0932\u094B\u0905\u0930\u094D\u0938 \u092A\u093E\u0930 \u2014 \u0927\u0928\u094D\u092F\u0935\u093E\u0926 \u092E\u0932\u0915\u093E\u092A\u0942\u0930!",
	],
}

const ABOUT_SETTINGS = {
	aboutEn: "Malkapur Katta was born from a simple vision \u2014 to give our beloved city a digital home that reflects its warmth, heritage, and dynamism. Located in the Buldhana district of Maharashtra, Malkapur has been a center of cotton trade, spiritual devotion, and vibrant community life for centuries.\n\nFrom the bustling cotton market yards to the serene shores of Malkapur Lake, from the grand Ganesh Utsav celebrations to the sacred Palkhi processions \u2014 our platform captures every facet of life in this extraordinary city.\n\nWhether you're a resident staying connected, a visitor planning your trip, or a business looking to reach the community \u2014 Malkapur Katta is your gateway to everything Malkapur.",
	aboutMr: "\u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u091F\u094D\u091F\u093E \u0939\u0940 \u0906\u092A\u0932\u094D\u092F\u093E \u092A\u094D\u0930\u093F\u092F \u0936\u0939\u0930\u093E\u0932\u093E \u0921\u093F\u091C\u093F\u091F\u0932 \u0918\u0930 \u0926\u0947\u0923\u094D\u092F\u093E\u091A\u0940 \u0938\u0902\u0915\u0932\u094D\u092A\u0928\u093E \u0906\u0939\u0947. \u092C\u0941\u0932\u0921\u093E\u0923\u093E \u091C\u093F\u0932\u094D\u0939\u094D\u092F\u093E\u0924\u0940\u0932 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0936\u0924\u0915\u093E\u0928\u0941\u0935\u093E\u091A\u0947 \u0915\u093E\u092A\u0942\u0938 \u0935\u094D\u092F\u093E\u092A\u093E\u0930, \u092D\u0915\u094D\u0924\u0940 \u0906\u0923\u093F \u0938\u092E\u0941\u0926\u093E\u092F \u091C\u0940\u0935\u0928\u093E\u091A\u0947 \u0915\u0947\u0902\u0926\u094D\u0930 \u0906\u0939\u0947.\n\n\u0915\u093E\u092A\u0942\u0938 \u092C\u093E\u091C\u093E\u0930\u093E\u092A\u093E\u0938\u0942\u0928 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0924\u0932\u093E\u0935\u093E\u092A\u0930\u094D\u092F\u0902\u0924, \u0917\u0923\u0947\u0936 \u0909\u0924\u094D\u0938\u0935\u093E\u092A\u093E\u0938\u0942\u0928 \u092A\u0935\u093F\u0924\u094D\u0930 \u092A\u093E\u0932\u0916\u0940 \u092E\u093F\u0930\u0935\u0923\u0941\u0915\u0940\u092A\u0930\u094D\u092F\u0902\u0924 \u2014 \u0906\u092E\u091A\u0947 \u0935\u094D\u092F\u093E\u0938\u092A\u0940\u0920 \u0936\u0939\u0930\u093E\u091A\u094D\u092F\u093E \u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u092A\u0948\u0932\u0942\u091A\u0947 \u0926\u0938\u094D\u0924\u093E\u0935\u0947\u091C\u0940\u0915\u0930\u0923 \u0915\u0930\u0924\u0947.\n\n\u0906\u092A\u0923 \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0930\u0939\u093F\u0935\u093E\u0938\u0940, \u092A\u0930\u094D\u092F\u091F\u0915 \u0915\u093F\u0902\u0935\u093E \u0935\u094D\u092F\u0935\u0938\u093E\u092F \u0905\u0938\u093E\u0932 \u2014 \u092E\u0932\u0915\u093E\u092A\u0942\u0930 \u0915\u091F\u094D\u091F\u093E \u0939\u0947 \u0938\u0930\u094D\u0935 \u0915\u093E\u0939\u0940 \u090F\u0915\u093E\u091A \u0920\u093F\u0915\u093E\u0923\u0940.",
	missionEn: "To empower the community by delivering reliable local news, highlighting heritage, and supporting local commerce.",
	missionMr: "\u0935\u093F\u0936\u094D\u0935\u093E\u0938\u093E\u0930\u094D\u0939 \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u092C\u093E\u0924\u092E\u094D\u092F\u093E \u0926\u0947\u090A\u0928, \u0935\u093E\u0930\u0938\u093E \u0939\u093E\u092F\u0932\u093E\u0907\u091F \u0915\u0930\u0942\u0928 \u0906\u0923\u093F \u0938\u094D\u0925\u093E\u0928\u093F\u0915 \u0935\u094D\u092F\u093E\u092A\u093E\u0930\u093E\u0932\u093E \u092A\u093E\u0920\u093F\u0902\u092C\u093E \u0926\u0947\u090A\u0928 \u0938\u092E\u0941\u0926\u093E\u092F\u093E\u0932\u093E \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0923\u0947.",
	team: [
		{ id: "1", nameEn: "Nikhil Chopade", nameMr: "\u0928\u093F\u0916\u093F\u0932 \u091A\u094B\u092A\u0921\u0947", roleEn: "Founder & Editor", roleMr: "\u0938\u0902\u0938\u094D\u0925\u093E\u092A\u0915 \u0906\u0923\u093F \u0938\u0902\u092A\u093E\u0926\u0915", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
	],
}

async function seedCollection(name, data) {
	const model = getModel(name)
	const count = await model.estimatedDocumentCount()
	if (count > 0) {
		console.log(`\u2705 [${name}] already has ${count} docs \u2014 skipping`)
		return
	}
	for (const item of data) {
		const { id, ...rest } = item
		const _id = id || randomUUID()
		await model.create({ _id, ...rest, createdAt: new Date().toISOString() })
	}
	console.log(`\uD83D\uDCE5 [${name}] seeded ${data.length} docs`)
}

async function seedDoc(name, id, data) {
	const model = getModel(name)
	const existing = await model.findById(id).lean()
	if (existing) {
		console.log(`\u2705 [${name}/${id}] already exists \u2014 skipping`)
		return
	}
	await model.create({ _id: id, ...data, updatedAt: new Date().toISOString() })
	console.log(`\uD83D\uDCE5 [${name}/${id}] seeded`)
}

async function seedAdmin() {
	const admins = getModel("admins")
	const users = getModel("users")
	const email = (process.env.ADMIN_EMAIL || "admin@malkapurkatta.com").toLowerCase()
	const existing = await admins.findOne({ email }).lean()
	if (existing) {
		// Ensure the owner account is always the super admin, even if it was
		// seeded by an older version that used role "admin".
		if (existing.role !== "superadmin") {
			await admins.findByIdAndUpdate(existing._id, {
				$set: { role: "superadmin" },
			})
			await users.findByIdAndUpdate(
				existing._id,
				{ $set: { role: "superadmin" } },
				{ upsert: true },
			)
			console.log(`upgraded existing admin to super admin: ${email}`)
		} else {
			console.log(`\u2705 super admin already exists: ${email}`)
		}
		return
	}
	const passwordHash = await bcrypt.hash(
		process.env.ADMIN_PASSWORD || "Admin@12345",
		10,
	)
	const uid = randomUUID()
	await admins.create({
		_id: uid,
		email,
		passwordHash,
		name: process.env.ADMIN_NAME || "Malkapur Katta Admin",
		role: "superadmin",
		permissions: [],
	})
	// Mirror a users/{uid} profile so the frontend AuthContext role check passes
	// regardless of the admin email.
	await users.findByIdAndUpdate(
		uid,
		{ $set: { _id: uid, email, role: "superadmin", points: 0, history: [], votes: {} } },
		{ upsert: true },
	)
	console.log(`\uD83D\uDD11 admin created: ${email} (password from ADMIN_PASSWORD)`)
}

async function main() {
	await connectDB(
		process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/malkapur_katta",
	)
	await seedCollection("news", NEWS_DATA)
	await seedCollection("events", EVENTS_DATA)
	await seedCollection("places", PLACES_DATA)
	await seedCollection("businesses", BUSINESSES_DATA)
	await seedCollection("gallery", GALLERY_DATA)
	await seedCollection("videos", VIDEOS_DATA)
	await seedCollection("polls", POLLS_DATA)
	await seedDoc("settings", "general", GENERAL_SETTINGS)
	await seedDoc("settings", "contact", CONTACT_SETTINGS)
	await seedDoc("settings", "home", HOME_SETTINGS)
	await seedDoc("about", "main", ABOUT_SETTINGS)
	await seedAdmin()
	await mongoose.disconnect()
	console.log("\n\uD83C\uDF89 Seeding complete!")
}

main().catch((e) => {
	console.error(e)
	process.exit(1)
})

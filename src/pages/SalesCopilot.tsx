import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Check,
  Copy,
  AlertTriangle,
  ShieldCheck,
  Search,
  Sparkles,
  Send,
  BadgeIndianRupee,
  CheckCircle2,
  RefreshCw,
  Plus,
  Minus,
  MessageSquare,
  Info,
  Zap,
  ArrowRight,
  ExternalLink,
  Percent,
  FileText,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  RotateCcw,
  Clock,
  PhoneCall,
  Flame,
  Award,
  Globe,
  Code2,
  TrendingUp,
  MapPin,
  Navigation,
  Car,
  Route,
  Loader2,
  X
} from 'lucide-react';

export interface ServiceOption {
  id: string;
  name: string;
  shortName: string;
  category: 'Websites' | 'Software & CRM' | 'Local & SEO' | 'Creative & Video' | 'Marketing & Ads' | 'Support & AMC';
  price: number;
  unit: string;
  timeline: string;
  pitchHinglish: string;
  pitchEnglish: string;
  inclusions: string[];
  whatNotToPromise: string;
  commonObjection: {
    question: string;
    answer: string;
  };
  recommendedFor: string;
}

export const SERVICES_CATALOG: ServiceOption[] = [
  {
    id: 'srv-static-web',
    name: 'Static Website Development',
    shortName: 'Static Website',
    category: 'Websites',
    price: 12000,
    unit: 'one-time',
    timeline: '5 to 7 working days',
    pitchHinglish: 'Sir, 5-7 din me lightning-fast 5-page brochure website milegi jisme direct WhatsApp aur Call buttons honge taaki local customers aapse instantly jud sakein.',
    pitchEnglish: 'Get a lightning-fast 5-page mobile responsive brochure website in 5-7 days, equipped with instant WhatsApp & Call buttons to convert local visitors.',
    inclusions: [
      'Up to 5 custom-designed mobile-responsive pages (Home, About, Services, Gallery, Contact)',
      'Direct Click-to-WhatsApp & Click-to-Call buttons for instant customer connect',
      'Lead contact inquiry form with direct email alerts',
      'Google Maps location embed & social media links',
      'Free SSL Security Certificate setup & 1-year hosting guidance'
    ],
    whatNotToPromise: 'Never promise a self-editable blog/CMS backend or free lifetime domain in the ₹12,000 static package.',
    commonObjection: {
      question: 'Market me 3,000 me website mil rahi hai, aapka 12,000 kyu hai?',
      answer: 'Sir, 3,000 me standard templates me logo daal kar dete hain jo phone par 8 second leti hai aur crash hoti hai. Hum clean code par custom banate hain jo 1.5s me khulti hai aur direct WhatsApp leads laati hai.'
    },
    recommendedFor: 'Clinics, Salons, Tutors, Local Showrooms & Service Professionals'
  },
  {
    id: 'srv-dynamic-web',
    name: 'Dynamic Website Development (CMS)',
    shortName: 'Dynamic CMS Website',
    category: 'Websites',
    price: 28000,
    unit: 'one-time',
    timeline: '12 to 16 working days',
    pitchHinglish: 'Sir, isme aapko ek easy Admin Panel login milta hai jisse aap khud phone se bhi naye photos, offers, blogs aur service details bina developer ke 2 minute me update kar sakte hain.',
    pitchEnglish: 'Includes a dedicated custom Admin Dashboard where your staff can update services, upload project galleries, and publish blogs with zero coding knowledge.',
    inclusions: [
      'Custom Admin Panel with login credentials (manage text, blogs & photos)',
      'Unlimited dynamic pages, service offerings and portfolio galleries',
      'Lead inquiry database with 1-click CSV download',
      'Video testimonials manager & interactive reviews slider',
      '1-on-1 staff training session + 1 year technical warranty'
    ],
    whatNotToPromise: 'Never promise full multi-vendor e-commerce cart or automated inventory checkout in standard dynamic CMS package.',
    commonObjection: {
      question: 'Static aur Dynamic me farak kya hai?',
      answer: 'Static website printed brochure jaisi hai jisme change ke liye developer chahiye. Dynamic me aap khud phone se photo aur text change kar sakte hain 2 minute me.'
    },
    recommendedFor: 'Real Estate, Colleges, Hospitals, Architecture Firms & Growing B2B Brands'
  },
  {
    id: 'srv-ecommerce',
    name: 'E-commerce Website (UPI / COD / Shiprocket)',
    shortName: 'E-commerce D2C Store',
    category: 'Websites',
    price: 35000,
    unit: 'one-time',
    timeline: '14 to 20 working days',
    pitchHinglish: 'Sir, Instagram DMs par order lene me time waste hota hai aur Amazon 25-30% commission leta hai. Hum complete D2C store banate hain jisme Razorpay UPI, COD aur courier tracking automated hoti hai.',
    pitchEnglish: 'Own your customer data and eliminate marketplace commissions. We build high-converting D2C stores with instant UPI QR checkout, COD pincode verification, and automated courier tracking.',
    inclusions: [
      'Mobile-first D2C store layout (up to 50 products catalog upload included)',
      'Razorpay / PhonePe Payment Gateway integration (0% commission to Vahlay)',
      'Cash on Delivery (COD) setup with pincode availability check',
      'Shiprocket / Delhivery courier API integration with label printing',
      'Automated GST invoices & instant WhatsApp order alerts'
    ],
    whatNotToPromise: 'Never promise 0% bank payment gateway fees (Razorpay charges ~2% directly). Never guarantee courier delivery speeds.',
    commonObjection: {
      question: 'Payment gateway me Vahlay ka koi transaction cut hoga?',
      answer: 'Nahi sir, sara paisa 100% direct aapke bank account me aata hai. Vahlay koi transaction commission nahi leta.'
    },
    recommendedFor: 'Fashion Brands, Ayurvedic Products, Cosmetics, Electronics & Packaged Foods'
  },
  {
    id: 'srv-crm',
    name: 'Sales Flow CRM (Lead Management & WhatsApp API)',
    shortName: 'Vahlay Sales CRM',
    category: 'Software & CRM',
    price: 45000,
    unit: 'one-time',
    timeline: '18 to 25 working days',
    pitchHinglish: 'Sir, agar sales team diary ya Excel par chal rahi hai toh 40% leads bina timely follow-up ke cold ho jati hain. Hamara CRM ensure karta hai ki har lead track ho aur manager ko live dashboard par pata chale kaunsa executive kitni calling kar raha hai.',
    pitchEnglish: 'Stop lead leakage and missed follow-ups. Our custom Sales CRM features automated lead routing, official Meta WhatsApp Cloud API messaging, and transparent manager dashboards.',
    inclusions: [
      'Up to 15 internal sales executive logins + Manager Leadership Dashboard',
      'Multi-source lead capture (Website, Facebook Ads, Google & Sheets)',
      'Daily follow-up reminders, task agendas & call logging tracker',
      'Official Meta WhatsApp Cloud API 1-click messaging templates',
      'Kanban pipeline stages, conversion reports & secure cloud database'
    ],
    whatNotToPromise: 'Do not promise automated phone call recording without third-party telephony (Exotel/Knowlarity) API costs.',
    commonObjection: {
      question: 'Hum Excel me manage karte hain, CRM ki kya zaroorat?',
      answer: 'Excel me reminders nahi aate aur executive chhodte hi pura data chori hone ka darr rehta hai. CRM me data company ka safe rehta hai aur leads drop nahi hoti.'
    },
    recommendedFor: 'Real Estate Brokers, Immigration Agents, B2B Traders, Loan & Financial Agencies'
  },
  {
    id: 'srv-erp',
    name: 'Modular Business ERP (Inventory / GST / POs)',
    shortName: 'Enterprise ERP System',
    category: 'Software & CRM',
    price: 120000,
    unit: 'one-time',
    timeline: '35 to 50 working days',
    pitchHinglish: 'Sir, agar factory ya warehouse me manual registers ki wajah se stock mismatch aur billing delay ho raha hai, toh Vahlay ka customized ERP procurement, godown inventory, purchase orders aur GST invoicing ko ek synchronized platform par le aata hai.',
    pitchEnglish: 'Synchronize your entire factory floor and warehouse. Modular enterprise ERP integrating inventory stock tracking, purchase orders, GST billing, and accounts payable/receivable.',
    inclusions: [
      'Inventory & Multi-Warehouse Godown Management module',
      'Vendor management, raw material purchase orders & dispatch tracking',
      'Sales invoicing, GST tax calculation & delivery challan generation',
      'Accounts receivable/payable ledger with multi-level manager approvals',
      'Role-based permissions for up to 30 staff members + 3 months support'
    ],
    whatNotToPromise: 'Never promise 1-week delivery for ERP. Minimum delivery timeline is 35 working days.',
    commonObjection: {
      question: 'Tally chal raha hai hamara, ERP kyu chahiye?',
      answer: 'Sir Tally accounting ke liye accha hai par wo real-time warehouse inventory, production batches aur purchase approvals ko live control nahi karta. ERP me production se lekar dispatch sab live sync hota hai.'
    },
    recommendedFor: 'Manufacturing Units, FMCG Stockists, Textile Mills, Pharma & Building Material Suppliers'
  },
  {
    id: 'srv-gmb',
    name: 'Google Business Profile (GMB / Google Maps)',
    shortName: 'GMB Local 3-Pack',
    category: 'Local & SEO',
    price: 9500,
    unit: 'setup + 1st month',
    timeline: '15 to 25 days ranking push',
    pitchHinglish: 'Sir, jab koi nearby customer Google Maps par search karta hai, top 3 profiles ko hi 70% direct phone calls aati hain. Hum aapka profile top 3 me rank karate hain.',
    pitchEnglish: 'Dominate your local catchment area. We optimize your Google Business Profile to rank in the Google Maps 3-Pack where 70% of high-intent local phone calls happen.',
    inclusions: [
      'Google Maps 3-Pack local ranking optimization & primary category alignment',
      '40+ High-authority Indian local business citations (NAP consistency)',
      'Weekly Geotagged high-res photos & promotional offer posts',
      'Review acceleration strategy & custom QR review standee design',
      'Removal/reporting of fake spam competitor listings pushing you down'
    ],
    whatNotToPromise: 'STRICT RULE: Never guarantee #1 rank in 7 days and never promise/sell fake Google reviews.',
    commonObjection: {
      question: 'Kya aap 100 fake 5-star reviews daal kar de sakte ho?',
      answer: 'Sir, Google AI fake reviews pakad kar profile suspend kar deta hai. Hum aapke real happy customers se genuine 5-star reviews lene ka automated system setup karte hain.'
    },
    recommendedFor: 'Dentists, Doctors, Salons, Tattoo Artists, Restaurants, Cafes & Local Repair Workshops'
  },
  {
    id: 'srv-seo',
    name: 'Search Engine Optimization (SEO)',
    shortName: 'Organic SEO Retainer',
    category: 'Local & SEO',
    price: 18000,
    unit: 'monthly retainer',
    timeline: '60 to 90 days compounding',
    pitchHinglish: 'Sir, ads par jab tak budget dalenge tab tak call aayegi. SEO se aapki website Google ke page 1 par organically rank hoti hai jisse roz bina ad spend ke genuine client calls aati hain.',
    pitchEnglish: 'Build a permanent inbound asset. Organic SEO pushes your target keywords to Google Page 1, delivering high-intent client inquiries every day without per-click ad costs.',
    inclusions: [
      '15 Target high-intent commercial keywords (Competitor search volume research)',
      'Complete On-page Technical SEO (Meta titles, H1 tags, Schema, PageSpeed)',
      '4 High-authority SEO Articles / Blogs published monthly on your website',
      'Indian business directory citations & contextual authority backlink outreach',
      'Monthly Google Analytics keyword progression & lead tracking report'
    ],
    whatNotToPromise: 'Never promise instant rankings in 10-15 days. SEO strictly requires 60-90 days for compounding organic authority.',
    commonObjection: {
      question: 'SEO ka result kitne time me dikhta hai?',
      answer: 'Initial indexation aur keyword movement 30-45 din me dikhta hai, aur consistent genuine customer inquiries 60 se 90 din me aana start hoti hain.'
    },
    recommendedFor: 'Clinics, Lawyers, CA Firms, Exporters, Interior Designers & Coaching Centers'
  },
  {
    id: 'srv-paid-ads',
    name: 'Paid Performance Ads (Meta & Google Ads)',
    shortName: 'Meta & Google Lead Ads',
    category: 'Marketing & Ads',
    price: 18000,
    unit: 'monthly retainer',
    timeline: 'Leads start in 24 to 48 hours',
    pitchHinglish: 'Sir, agar aap chahte hain ki kal se hi aapki sales team ke paas 10-15 genuine inquiries aana shuru ho jayein, toh Paid Ads sabse fast solution hai. Hum qualifying questions lagakar sirf serious leads filter karte hain.',
    pitchEnglish: 'Turn inquiries into predictable math. We build hyper-targeted Meta & Google ad funnels with qualifying questions to deliver verified leads directly to your sales team.',
    inclusions: [
      'Complete Campaign Architecture on Meta (FB/IG) or Google Search Ads',
      'High-converting ad copywriting in Hindi & English with compelling hooks',
      '4 Custom ad graphics / video motion edits produced monthly',
      'Meta Pixel, Conversion API & Google Tag Manager tracking integration',
      'Junk lead filter setup (budget/location qualification questions)',
      'Weekly reporting on Spend, Impressions, Cost Per Lead (CPL) & Closures'
    ],
    whatNotToPromise: 'Never guarantee exact number of closed sales (we deliver qualified leads; closing depends on client sales team). Ad spend is paid directly by client to Meta/Google.',
    commonObjection: {
      question: 'Pehle bhi ads chalaye the, faltu log phone nahi uthate the?',
      answer: 'Sir Instagram par Boost Post karne se kisi ko bhi ad dikhta hai. Hum qualifying questions lagate hain jisse sirf verified budget wale log hi form submit kar paate hain.'
    },
    recommendedFor: 'Real Estate Brokers, Aesthetic Clinics, Coaching Centers & High-Ticket B2B Traders'
  },
  {
    id: 'srv-reels-combo',
    name: 'Reels Shoot + 12 Reels Editing Combo',
    shortName: 'Reels Production Combo',
    category: 'Creative & Video',
    price: 28000,
    unit: 'per package',
    timeline: 'Shoot in 5 days, delivery in 10 days',
    pitchHinglish: 'Sir, phone video se clinic ya salon premium nahi dikhta. Hum 4K cinema camera crew bhejte hain jo half-day shoot karegi aur 12 viral retention reels banakar degi trending audio ke sath.',
    pitchEnglish: 'Elevate your brand authority. Our cinema camera crew visits your premises for a half-day shoot and delivers 12 viral retention reels with hooks, color grading, and trending music.',
    inclusions: [
      'Half-day on-site shoot with 4K cinema camera, wireless mics & lighting setup',
      '12 Retention-focused short-form edited reels (9:16 vertical for Instagram & Shorts)',
      'Trending audio selection, hook text, animated captions & sound effects',
      'Professional color grading & b-roll facility tour coverage'
    ],
    whatNotToPromise: 'Never guarantee 10 lakh viral views on day 1. We guarantee cinema-grade visual credibility that builds customer trust.',
    commonObjection: {
      question: 'Hum phone se hi reels bana lete hain, crew kyu bulayein?',
      answer: 'Sir high-ticket clients (jaise ₹30,000 ke implant ya bridal makeup) phone video dekh kar nahi aate. Cinema lighting aur clear audio se aapka brand 10x trust generate karta hai.'
    },
    recommendedFor: 'Tattoo Studios, Dentists, Hair Transplants, Fine-Dining Cafes & Luxury Salons'
  },
  {
    id: 'srv-reels-shoot',
    name: 'On-Site 4K Cinema Camera Shoot',
    shortName: 'On-Site Video Shoot',
    category: 'Creative & Video',
    price: 18000,
    unit: 'per shoot day',
    timeline: '1 Shoot Day (up to 4 hours)',
    pitchHinglish: 'Sir, hamari professional videography team aapke premise par aakar high-end cinema camera, gimbal stabilizer aur studio lighting ke sath raw footage shoot karegi jo poore mahine ke video content ke liye kaafi hoga.',
    pitchEnglish: 'Professional on-location cinema camera crew capture for high-end facility tours, founder interviews, procedure b-rolls, and customer testimonials.',
    inclusions: [
      'Cinema Camera + Gimbal Stabilizer + Studio Softbox Lighting',
      'Wireless Lapel Microphones for crisp founder and customer audio',
      'Pre-shoot concept sheet & hook direction provided',
      'Sufficient raw 4K footage captured for 10-14 short-form video assets'
    ],
    whatNotToPromise: 'Does not include editing (paired with Reels Editing or editing package). Travel outside city limits billed at actuals.',
    commonObjection: {
      question: 'Shoot ke din hume kya taiyar rakhna hoga?',
      answer: 'Sir hum 2 din pehle concept script share karte hain. Aapko sirf location clean rakhni hai aur camera-ready staff plan karna hai.'
    },
    recommendedFor: 'Showrooms, Luxury Salons, Hospitals, Manufacturing Units & Real Estate Villas'
  },
  {
    id: 'srv-smm',
    name: 'Social Media Marketing (16 Branded Creatives)',
    shortName: 'Social Media SMM',
    category: 'Creative & Video',
    price: 15000,
    unit: 'monthly retainer',
    timeline: 'Ongoing monthly content',
    pitchHinglish: 'Sir, jab bhi koi naya customer aapka naam sunta hai, wo sabse pehle aapka Instagram check karta hai. Agar page dead hai toh trust nahi banta. Hum monthly 16 cohesive branded creatives post karte hain.',
    pitchEnglish: 'Your social media is your modern credibility certificate. We curate a monthly content calendar of 16 custom branded graphics, carousels, and stories to keep your business top of mind.',
    inclusions: [
      '12 Custom Branded Static / Carousel Graphic Creatives',
      '4 Motion Graphic / Animated Story Creatives',
      'Engaging captions + researched trending industry hashtags',
      'Instagram Bio revamp & Highlight covers design',
      'Monthly performance analytics & reach growth report'
    ],
    whatNotToPromise: 'Do not promise viral reach on organic graphic posts without ad spend. SMM builds brand credibility and aesthetics.',
    commonObjection: {
      question: 'Social media post karne se direct customer aayega?',
      answer: 'Social media dukan ki decoration aur credibility jaisi hai. Jab customer website ya ad se aate hain, wo Instagram check karte hain. Wahan accha content dekh kar closing 3x easy ho jati hai.'
    },
    recommendedFor: 'Boutiques, Spas, Interior Decorators, Cafes & Service Providers'
  },
  {
    id: 'srv-amc',
    name: 'Website Maintenance & Cloud Security (AMC)',
    shortName: 'Website AMC Retainer',
    category: 'Support & AMC',
    price: 4500,
    unit: 'monthly retainer',
    timeline: 'Ongoing monthly support',
    pitchHinglish: 'Sir, website live hone ke baad cloud backups, security updates aur minor changes zaroori hote hain taaki site kabhi hack na ho ya down na ho. Hum 24/7 uptime monitor karte hain.',
    pitchEnglish: 'Keep your web asset bulletproof. Monthly retainer covering 24/7 uptime monitoring, malware protection, weekly cloud backups, and priority developer turnaround.',
    inclusions: [
      '24/7 Uptime monitoring & proactive malware firewall scanning',
      'Weekly automated cloud backups (restore within 2 hours if needed)',
      'Minor text, phone number, and banner image changes every month',
      'Priority developer support ticket response within 4 hours'
    ],
    whatNotToPromise: 'Never promise complete website redesign or custom coding in standard ₹4,500 AMC.',
    commonObjection: {
      question: 'Website banne ke baad kya turant AMC lena zaroori hai?',
      answer: 'First 30 days ka warranty support hum free dete hain. Uske baad continuous safety aur backup ke liye AMC recommend karte hain.'
    },
    recommendedFor: 'Any active business website where downtime results in direct financial loss.'
  }
];

type PillarKey = 'website' | 'software' | 'marketing';

interface PillarConfig {
  key: PillarKey;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  description: string;
  serviceIds: string[];
}

const PILLARS: PillarConfig[] = [
  {
    key: 'website',
    title: 'Website Development',
    shortTitle: 'Website',
    icon: Globe,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Static, Dynamic CMS, E-commerce D2C Store & AMC',
    serviceIds: ['srv-static-web', 'srv-dynamic-web', 'srv-ecommerce', 'srv-amc']
  },
  {
    key: 'software',
    title: 'Software & CRM / ERP',
    shortTitle: 'Software',
    icon: Code2,
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Custom Lead Management CRM & Modular Factory ERP',
    serviceIds: ['srv-crm', 'srv-erp']
  },
  {
    key: 'marketing',
    title: 'Digital Marketing & Growth',
    shortTitle: 'Digital Marketing',
    icon: TrendingUp,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Google Maps 3-Pack, SEO, Paid Ads, Reels & Social Media',
    serviceIds: ['srv-gmb', 'srv-seo', 'srv-paid-ads', 'srv-reels-combo', 'srv-reels-shoot', 'srv-smm']
  }
];

export const COMPANY_OFFICE_ADDRESS =
  'Dev Aurum Commercial Complex, C 515, 100 Feet Anand Nagar Rd, nr. Dev Aurum Deer circle, Prahlad Nagar, Ahmedabad, Gujarat 380015';

// Fixed Office Origin Coordinates: Dev Aurum, Prahlad Nagar, Ahmedabad (22.9982° N, 72.5025° E)
export const AHMEDABAD_HQ_COORDS = { lat: 22.9982, lon: 72.5025 };

// Real road distance calculator using Haversine formula + Indian highway curvature factor
export function calculateRoadDistanceKm(targetLat: number, targetLon: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (targetLat - AHMEDABAD_HQ_COORDS.lat) * (Math.PI / 180);
  const dLon = (targetLon - AHMEDABAD_HQ_COORDS.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(AHMEDABAD_HQ_COORDS.lat * (Math.PI / 180)) *
    Math.cos(targetLat * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineKm = R * c;

  let factor = 1.25;
  if (straightLineKm <= 12) factor = 1.32;
  else if (straightLineKm <= 50) factor = 1.26;
  else if (straightLineKm <= 250) factor = 1.22;
  else factor = 1.18;

  return Math.max(1, Math.round(straightLineKm * factor));
}

export const PRESET_LOCATIONS: { name: string; km: number; note: string }[] = [
  { name: 'Local Ahmedabad (Satellite / SG Highway)', km: 6, note: 'Free Metro Zone (≤20km)' },
  { name: 'Bopal / South Bopal', km: 8, note: 'Free Metro Zone (≤20km)' },
  { name: 'Vastrapur / Bodakdev', km: 7, note: 'Free Metro Zone (≤20km)' },
  { name: 'Navrangpura / CG Road / Ashram Rd', km: 11, note: 'Free Metro Zone (≤20km)' },
  { name: 'Maninagar / Kankaria', km: 14, note: 'Free Metro Zone (≤20km)' },
  { name: 'SP Ring Road / Vaishnodevi Circle', km: 16, note: 'Free Metro Zone (≤20km)' },
  { name: 'Changodar / Moraiya Industrial', km: 22, note: '2 km Billable' },
  { name: 'Sanand GIDC', km: 25, note: '5 km Billable' },
  { name: 'GIFT City / Gandhinagar', km: 32, note: '12 km Billable' },
  { name: 'Kadi / Chhatral GIDC', km: 48, note: '28 km Billable' },
  { name: 'Nadiad / Anand', km: 70, note: '50 km Billable' },
  { name: 'Mehsana', km: 75, note: '55 km Billable' },
  { name: 'Vadodara (Baroda)', km: 115, note: '95 km Billable' },
  { name: 'Bhavnagar', km: 175, note: '155 km Billable' },
  { name: 'Bharuch / Ankleshwar', km: 190, note: '170 km Billable' },
  { name: 'Morbi (Ceramic Hub)', km: 195, note: '175 km Billable' },
  { name: 'Rajkot', km: 215, note: '195 km Billable' },
  { name: 'Surat (Diamond & Textile)', km: 270, note: '250 km Billable' },
  { name: 'Udaipur, Rajasthan', km: 260, note: '240 km Billable' },
  { name: 'Jamnagar', km: 305, note: '285 km Billable' },
  { name: 'Bhuj / Kutch', km: 335, note: '315 km Billable' },
  { name: 'Vapi / Valsad', km: 350, note: '330 km Billable' },
  { name: 'Indore, Madhya Pradesh', km: 390, note: '370 km Billable' },
  { name: 'Mumbai, Maharashtra', km: 530, note: '510 km Billable' },
  { name: 'Pune, Maharashtra', km: 660, note: '640 km Billable' },
  { name: 'Jaipur, Rajasthan', km: 660, note: '640 km Billable' },
  { name: 'Delhi / NCR / Gurgaon', km: 890, note: '870 km Billable' },
  { name: 'Bangalore / Bengaluru', km: 1480, note: '1460 km Billable' }
];

interface SalesCopilotProps {
  onNavigate?: (path: string) => void;
}

export const SalesCopilot: React.FC<SalesCopilotProps> = ({ onNavigate }) => {
  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Services in the calculator combo (no service selected by default)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Active Focused Service for the live talking guide
  const [focusedServiceId, setFocusedServiceId] = useState<string | null>(null);

  // Language toggle for pitch script
  const [pitchLang, setPitchLang] = useState<'hinglish' | 'english'>('hinglish');

  // Discount percentage
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Open/Close state for the 3 dropdown pillars (collapsed by default)
  const [openDropdowns, setOpenDropdowns] = useState<Record<PillarKey, boolean>>({
    website: false,
    software: false,
    marketing: false
  });

  const toggleDropdown = (key: PillarKey) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allOpen = Object.values(openDropdowns).every(Boolean);
  const toggleAllDropdowns = () => {
    const nextState = !allOpen;
    setOpenDropdowns({
      website: nextState,
      software: nextState,
      marketing: nextState
    });
  };

  // Grouped Services
  const websiteServices = useMemo(
    () => SERVICES_CATALOG.filter((s) => ['srv-static-web', 'srv-dynamic-web', 'srv-ecommerce', 'srv-amc'].includes(s.id)),
    []
  );

  const softwareServices = useMemo(
    () => SERVICES_CATALOG.filter((s) => ['srv-crm', 'srv-erp'].includes(s.id)),
    []
  );

  const marketingServices = useMemo(
    () =>
      SERVICES_CATALOG.filter((s) =>
        ['srv-gmb', 'srv-seo', 'srv-paid-ads', 'srv-reels-combo', 'srv-reels-shoot', 'srv-smm'].includes(s.id)
      ),
    []
  );

  // Filter helper for query
  const filterByQuery = (services: ServiceOption[]) => {
    if (!searchQuery.trim()) return services;
    const q = searchQuery.toLowerCase().trim();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.pitchHinglish.toLowerCase().includes(q) ||
        s.commonObjection.question.toLowerCase().includes(q) ||
        s.recommendedFor.toLowerCase().includes(q)
    );
  };

  // Quick select handler from dropdowns
  const handleQuickSelect = (srvId: string) => {
    if (!srvId) return;
    if (!selectedServiceIds.includes(srvId)) {
      toggleService(srvId);
    }
    setFocusedServiceId(srvId);
    const targetPillar = PILLARS.find((p) => p.serviceIds.includes(srvId));
    if (targetPillar && !openDropdowns[targetPillar.key]) {
      setOpenDropdowns((prev) => ({ ...prev, [targetPillar.key]: true }));
    }
  };

  // Right side active view: 'calculation' | 'km' | 'select_services'
  const [rightView, setRightView] = useState<'calculation' | 'km' | 'select_services'>('calculation');

  // Kilometer Finder State (Fixed HQ: Prahlad Nagar, Ahmedabad) - Empty by default
  const [clientLocation, setClientLocation] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [travelPurpose, setTravelPurpose] = useState<'shoot' | 'visit' | 'delivery'>('shoot');
  const [includeTravelInQuote, setIncludeTravelInQuote] = useState<boolean>(true);

  // Google Maps Style Live Location Suggestions State
  interface LocationResult {
    id: string;
    title: string;
    subtitle: string;
    fullAddress: string;
    km: number;
  }
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationResult[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);

  // Search effect: debounced geocoding + local presets
  useEffect(() => {
    if (!locationInput || locationInput.trim().length < 2) {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
      return;
    }

    const query = locationInput.trim().toLowerCase();

    // 1. Instant local preset matching
    const localMatches: LocationResult[] = PRESET_LOCATIONS.filter((p) => {
      const pLower = p.name.toLowerCase();
      return pLower.includes(query) || query.includes(pLower.split(/[\s,()/]+/)[0].toLowerCase());
    })
      .slice(0, 4)
      .map((p, idx) => ({
        id: `preset-${idx}-${p.name}`,
        title: p.name.split('(')[0].trim(),
        subtitle: p.name.includes('(') ? p.name.slice(p.name.indexOf('(') + 1, -1) : 'Gujarat / India',
        fullAddress: p.name,
        km: p.km
      }));

    if (localMatches.length > 0) {
      setLocationSuggestions(localMatches);
    }

    // 2. Live geocoding via OpenStreetMap Photon API
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(locationInput.trim())}&limit=6`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          const features = data.features || [];
          const apiResults: LocationResult[] = features.map((f: any, idx: number) => {
            const [lon, lat] = f.geometry?.coordinates || [AHMEDABAD_HQ_COORDS.lon, AHMEDABAD_HQ_COORDS.lat];
            const p = f.properties || {};
            const title = p.name || p.street || locationInput;
            const subParts = [p.locality, p.city || p.district || p.county, p.state, p.country].filter(Boolean);
            const subtitle = subParts.join(', ');
            const km = calculateRoadDistanceKm(lat, lon);
            return {
              id: `photon-${idx}-${p.osm_id || idx}`,
              title,
              subtitle,
              fullAddress: subtitle ? `${title}, ${subtitle}` : title,
              km
            };
          });

          // Merge without duplicate titles
          const combined = [...localMatches];
          for (const apiItem of apiResults) {
            if (!combined.some((c) => c.title.toLowerCase() === apiItem.title.toLowerCase())) {
              combined.push(apiItem);
            }
          }

          if (combined.length > 0) {
            setLocationSuggestions(combined);
            setShowLocationDropdown(true);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Keep local matches if API is unreachable
        }
      } finally {
        setIsSearchingLocation(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [locationInput]);

  const selectLocation = (item: LocationResult) => {
    setClientLocation(item.fullAddress);
    setLocationInput(item.fullAddress);
    setDistanceKm(item.km);
    setShowLocationDropdown(false);
  };

  // Travel calculation helpers
  const ratePerKm = useMemo(() => {
    switch (travelPurpose) {
      case 'shoot':
        return 25; // 4K camera gear & cinema crew transit
      case 'visit':
        return 15; // In-person sales executive / consultant visit
      case 'delivery':
        return 12; // Standard material / setup delivery
      default:
        return 25;
    }
  }, [travelPurpose]);

  const travelPurposeLabel = useMemo(() => {
    switch (travelPurpose) {
      case 'shoot':
        return '4K Cinema Crew & Heavy Gear Transit';
      case 'visit':
        return 'In-Person Consultant / Executive Visit';
      case 'delivery':
        return 'Standard Material / Setup Delivery';
    }
  }, [travelPurpose]);

  const freeAllowanceKm = 20; // First 20 km inside metro city is complimentary
  const billableKm = Math.max(0, distanceKm - freeAllowanceKm);
  const calculatedTravelCost = billableKm * ratePerKm;
  const travelCostToApply = includeTravelInQuote ? calculatedTravelCost : 0;

  // Focused Service
  const focusedService = useMemo(() => {
    if (!focusedServiceId) return null;
    return SERVICES_CATALOG.find((s) => s.id === focusedServiceId) || null;
  }, [focusedServiceId]);

  // Selected Services Objects
  const selectedServices = useMemo(() => {
    return SERVICES_CATALOG.filter((s) => selectedServiceIds.includes(s.id));
  }, [selectedServiceIds]);

  // Price Calculations
  const grossTotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const currentDiscountINR = Math.round(grossTotal * (discountPercent / 100));
  const finalPriceToQuote = selectedServices.length === 0
    ? 0
    : Math.max(0, grossTotal - currentDiscountINR + travelCostToApply);

  // Full quote text for clipboard
  const quoteText = useMemo(() => {
    const servicesList = selectedServices
      .map((s, idx) => `${idx + 1}. ${s.name} - ₹${s.price.toLocaleString('en-IN')}`)
      .join('\n');
    let text =
      `*VAHLAY DIGITAL - QUOTATION SUMMARY*\n\n` +
      `*Services Included:*\n${servicesList || 'None'}\n\n` +
      `*Standard Total:* ₹${grossTotal.toLocaleString('en-IN')}\n`;
    if (discountPercent > 0) {
      text += `*Special Discount (${discountPercent}%):* -₹${currentDiscountINR.toLocaleString('en-IN')}\n`;
    }
    if (includeTravelInQuote && calculatedTravelCost > 0) {
      text += `*Transit / Travel (${billableKm} km @ ₹${ratePerKm}/km):* +₹${calculatedTravelCost.toLocaleString('en-IN')}\n`;
    }
    text +=
      `*Final Payable Amount:* ₹${finalPriceToQuote.toLocaleString('en-IN')}\n\n` +
      `*Office Origin:* Dev Aurum, Prahlad Nagar, Ahmedabad\n` +
      `*Client Location:* ${clientLocation || 'Ahmedabad/Gujarat'}\n` +
      `*Validity:* 7 Days\n` +
      `_Terms: 50% advance to initiate project execution._`;
    return text;
  }, [
    selectedServices,
    grossTotal,
    discountPercent,
    currentDiscountINR,
    includeTravelInQuote,
    calculatedTravelCost,
    billableKm,
    ratePerKm,
    finalPriceToQuote,
    clientLocation
  ]);

  // Travel text for clipboard
  const travelSummaryText = useMemo(() => {
    return (
      `*VAHLAY DIGITAL - TRAVEL & TRANSIT ESTIMATE*\n\n` +
      `*Office Origin (Fixed HQ):* ${COMPANY_OFFICE_ADDRESS}\n` +
      `*Client Destination:* ${clientLocation || 'Client Premise'}\n` +
      `*Total Distance:* ${distanceKm} km from Ahmedabad HQ\n` +
      `*Complimentary Allowance:* 20 km (Free Local Metro Zone)\n` +
      `*Billable Distance:* ${billableKm} km\n` +
      `*Transit Purpose / Vehicle:* ${travelPurposeLabel}\n` +
      `*Rate:* ₹${ratePerKm}/km\n` +
      `*Total Travel Charges:* ₹${calculatedTravelCost.toLocaleString('en-IN')}\n` +
      `\n_Note: Includes fuel, toll taxes, and crew transit insurance._`
    );
  }, [clientLocation, distanceKm, billableKm, travelPurposeLabel, ratePerKm, calculatedTravelCost]);

  // Toggle Service in Combo
  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        const updated = prev.filter((sId) => sId !== id);
        if (focusedServiceId === id) {
          setFocusedServiceId(updated.length > 0 ? updated[0] : null);
        }
        return updated;
      } else {
        setFocusedServiceId(id);
        return [...prev, id];
      }
    });
  };

  // Reset Combo Calculator
  const handleReset = () => {
    setSelectedServiceIds([]);
    setFocusedServiceId(null);
    setDiscountPercent(0);
    setClientLocation('');
    setLocationInput('');
    setDistanceKm(0);
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2200);
  };

  return (
    <div className="space-y-6 pb-16 w-full animate-in fade-in duration-150">
      {/* ── TOP HERO HEADER BANNER ────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#041622] via-[#072435] to-[#0A3D52] p-5 sm:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.18)] relative overflow-hidden text-white border border-[#103448]">
        {/* Subtle geometric & mountain landscape SVG silhouettes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-35">
          <svg
            className="absolute bottom-0 right-0 w-[600px] h-[180px] text-teal-800/20"
            viewBox="0 0 600 180"
            fill="none"
            preserveAspectRatio="none"
          >
            <path d="M0 180 L120 70 L240 130 L380 40 L490 110 L600 20 L600 180 Z" fill="currentColor" />
            <path d="M60 180 L180 90 L300 145 L420 75 L520 125 L600 60 L600 180 Z" fill="currentColor" opacity="0.5" />
          </svg>
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#00D4DD]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-72 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>

            <h1 className="text-2xl sm:text-[27px] font-bold tracking-tight text-white leading-tight">
              Complete Services Catalog &amp; Combo Rate Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal mt-1">
              Instant pricing estimation, client talking points, objection rebuttals, and verified travel transit calculators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#062A2F]/80 border border-[#0A4D4A] text-xs text-[#00E5A3] font-medium backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#00E5A3] shrink-0" />
              <span>
                Agent Discount Limit: <strong className="font-bold text-white">10% Max</strong>
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('/pricing')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold shadow-sm transition active:scale-[0.98] border border-slate-200/50 cursor-pointer"
              >
                <BadgeIndianRupee className="w-3.5 h-3.5 text-slate-500" />
                <span>Rate Chart</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN LAYOUT: SERVICES ON LEFT, CALCULATOR ON RIGHT ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT PANEL: ALL SERVICES CATALOG & TALKING POINTS (7 COLS) ─── */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Services Selection Card: Clean 3-Category Dropdowns */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Services Selection</span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAllDropdowns}
                  className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/80 transition cursor-pointer"
                >
                  {allOpen ? 'Collapse All' : 'Expand All'}
                </button>

                <button
                  type="button"
                  onClick={() => setRightView('select_services')}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${selectedServiceIds.length > 0
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                  {selectedServiceIds.length > 0
                    ? `${selectedServiceIds.length} in Combo (View) →`
                    : '0 in Combo'}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. static website, CRM, ERP, SEO, reels, ads)..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition font-medium text-slate-900 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 3 Clean Category Dropdown Cards */}
            <div className="space-y-3 pt-1">
              {PILLARS.map((pillar) => {
                const PillarIcon = pillar.icon;
                const pillarServices = SERVICES_CATALOG.filter((s) => pillar.serviceIds.includes(s.id));
                const filtered = filterByQuery(pillarServices);
                const isOpen = openDropdowns[pillar.key] || searchQuery.trim().length > 0;
                const inComboCount = pillarServices.filter((s) => selectedServiceIds.includes(s.id)).length;
                const inComboTotal = pillarServices
                  .filter((s) => selectedServiceIds.includes(s.id))
                  .reduce((sum, s) => sum + s.price, 0);

                return (
                  <div
                    key={pillar.key}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition"
                  >
                    {/* Collapsible Dropdown Header Button */}
                    <button
                      type="button"
                      onClick={() => toggleDropdown(pillar.key)}
                      className="w-full p-3.5 flex items-center justify-between text-left bg-slate-50/70 hover:bg-slate-100/70 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg border bg-white ${pillar.accentColor} shadow-2xs`}>
                          <PillarIcon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{pillar.title}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                            {pillarServices.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {inComboCount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ {inComboCount} in Combo (₹{inComboTotal.toLocaleString('en-IN')})
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">0 selected</span>
                        )}

                        <div className={`transition-transform duration-200 text-slate-500 ${isOpen ? 'rotate-180' : ''}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Dropdown Items List */}
                    {isOpen && (
                      <div className="p-3 border-t border-slate-200/80 space-y-2 bg-slate-50/30">
                        {filtered.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            No matching services in {pillar.title}
                          </div>
                        ) : (
                          filtered.map((srv) => {
                            const isSelected = selectedServiceIds.includes(srv.id);
                            const isFocused = focusedServiceId === srv.id;

                            return (
                              <div
                                key={srv.id}
                                onClick={() => setFocusedServiceId(srv.id)}
                                className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${isFocused
                                    ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/25'
                                    : isSelected
                                      ? 'border-blue-200 bg-blue-50/10'
                                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                  }`}
                              >
                                {/* Left Info & Checkbox */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleService(srv.id);
                                    }}
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold transition cursor-pointer ${isSelected
                                        ? 'bg-blue-600 text-white shadow-2xs'
                                        : 'border border-slate-300 bg-white text-transparent hover:border-blue-400'
                                      }`}
                                    title={isSelected ? 'Remove from combo calculation' : 'Add to combo calculation'}
                                  >
                                    ✓
                                  </button>

                                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <span className="text-xs font-bold text-slate-900 hover:text-blue-600 transition truncate">
                                      {srv.name}
                                    </span>
                                    {isSelected && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                                        In Combo
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Right Price & Add/Remove Button */}
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="text-xs font-bold text-slate-900">
                                    ₹{srv.price.toLocaleString('en-IN')}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleService(srv.id);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${isSelected
                                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                      }`}
                                  >
                                    {isSelected ? 'Remove' : '+ Add'}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* ── DETAILED LIVE TALKING GUIDE & SALES PITCH BOX ─────────────── */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            {focusedService ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                      Live Calling &amp; Discovery Guide
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {focusedService.name} (₹{focusedService.price.toLocaleString('en-IN')})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      ⏱️ {focusedService.timeline}
                    </span>

                    {/* Pitch Language Toggle */}
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setPitchLang('hinglish')}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${pitchLang === 'hinglish' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                      >
                        Hinglish
                      </button>
                      <button
                        type="button"
                        onClick={() => setPitchLang('english')}
                        className={`px-2.5 py-1 rounded-md font-bold transition ${pitchLang === 'english' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                          }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pitch Script Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Phone Par Client Ko Kya Bolna Hai (Pitch):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          pitchLang === 'hinglish' ? focusedService.pitchHinglish : focusedService.pitchEnglish,
                          'pitch-copy'
                        )
                      }
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'pitch-copy' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      <span>{copiedKey === 'pitch-copy' ? 'Copied' : 'Copy Pitch'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-900 font-medium leading-relaxed">
                    "{pitchLang === 'hinglish' ? focusedService.pitchHinglish : focusedService.pitchEnglish}"
                  </div>
                </div>

                {/* Inclusions List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">What Client Gets (Key Deliverables / Inclusions):</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {focusedService.inclusions.map((inc, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-snug">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Red Line Compliance Alert */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong className="font-bold">Strict Rule (Do NOT Promise):</strong> {focusedService.whatNotToPromise}
                  </span>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No Service Focused Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click on any service card in the catalog above to view its live phone pitch script, key deliverables, and client objection rebuttals.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: DYNAMIC AGENT VIEW (CALCULATION / KM / SERVICES) ───── */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          {/* Agent View Navigation Tabs */}
          <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 grid grid-cols-3 gap-1 shadow-2xs">
            <button
              id="tab-calculation"
              type="button"
              onClick={() => setRightView('calculation')}
              className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${rightView === 'calculation'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculation</span>
            </button>

            <button
              id="tab-km"
              type="button"
              onClick={() => setRightView('km')}
              className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${rightView === 'km'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>KM Finder</span>
            </button>

            <button
              id="tab-services"
              type="button"
              onClick={() => setRightView('select_services')}
              className={`py-2 px-2 text-center text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${rightView === 'select_services'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Services ({selectedServices.length})</span>
            </button>
          </div>

          {/* ── TAB 1: CALCULATION VIEW ── */}
          {rightView === 'calculation' && (
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Live Price Calculation</h2>
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Quick Selected Services Preview Bar */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800">
                    {selectedServices.length} Service{selectedServices.length === 1 ? '' : 's'} Selected
                  </span>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-[260px]">
                    {selectedServices.length > 0
                      ? selectedServices.map((s) => s.shortName).join(' + ')
                      : 'Select services from the left catalog'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRightView('select_services')}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50 text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Itemized Calculation Breakdown */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="font-semibold text-slate-600">Standard Services Subtotal:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{grossTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Discount Row */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span>Client Discount ({discountPercent}%):</span>
                  </span>
                  <span className={`font-bold ${discountPercent > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {discountPercent > 0 ? `-₹${currentDiscountINR.toLocaleString('en-IN')}` : '₹0'}
                  </span>
                </div>

                {/* Travel Cost Row */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                    <span>Outstation Transit ({billableKm} km):</span>
                    <button
                      type="button"
                      onClick={() => setRightView('km')}
                      className="text-[10px] text-emerald-600 hover:underline font-bold cursor-pointer"
                    >
                      (View KM)
                    </button>
                  </span>
                  <span className={`font-bold ${selectedServices.length > 0 && includeTravelInQuote && calculatedTravelCost > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {selectedServices.length === 0
                      ? '₹0'
                      : includeTravelInQuote && calculatedTravelCost > 0
                        ? `+₹${calculatedTravelCost.toLocaleString('en-IN')}`
                        : includeTravelInQuote ? 'Free (≤20km)' : 'Not Included'}
                  </span>
                </div>

                {/* Discount Quick Select */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-600" />
                      <span>Apply Quick Discount:</span>
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">{discountPercent}% Selected</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '0%', pct: 0 },
                      { label: '5%', pct: 5 },
                      { label: '7%', pct: 7 },
                      { label: '10%', pct: 10 }
                    ].map((btn) => (
                      <button
                        key={btn.pct}
                        type="button"
                        onClick={() => setDiscountPercent(btn.pct)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer text-center ${discountPercent === btn.pct
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>0%</span>
                    <span className="text-emerald-600 font-bold">10% (Sales Policy Limit)</span>
                    <span className="text-rose-500">15%</span>
                  </div>
                </div>
              </div>

              {/* Final Price Box */}
              <div className="p-5 rounded-xl bg-slate-900 text-white space-y-3.5 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Final Payable Price:
                    </p>
                    <div className="flex items-baseline gap-2.5 mt-1">
                      <span className="text-3xl font-extrabold text-blue-400 tracking-tight">
                        ₹{finalPriceToQuote.toLocaleString('en-IN')}
                      </span>
                      {selectedServices.length > 0 && (discountPercent > 0 || (includeTravelInQuote && calculatedTravelCost > 0)) && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{(grossTotal + (includeTravelInQuote ? calculatedTravelCost : 0)).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`₹${finalPriceToQuote.toLocaleString('en-IN')}`, 'quote-btn')}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    {copiedKey === 'quote-btn' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === 'quote-btn' ? 'Copied' : 'Copy Price'}</span>
                  </button>
                </div>

                {discountPercent > 0 && (
                  <p className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800">
                    ✓ Total savings: ₹{currentDiscountINR.toLocaleString('en-IN')} ({discountPercent}% discount applied)
                  </p>
                )}

                {/* Copy WhatsApp Ready Quote */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(quoteText, 'quote-full')}
                  className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  {copiedKey === 'quote-full' ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-white" />
                  )}
                  <span>{copiedKey === 'quote-full' ? 'Quotation Copied to Clipboard!' : 'Copy WhatsApp Quotation'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: KM FINDER VIEW ── */}
          {rightView === 'km' && (
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Kilometer &amp; Transit Details</h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRightView('calculation')}
                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Back to Quote</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Google Maps Style Location Search & Live Autocomplete */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-blue-600" />
                    <span>Search Client Location:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Auto-calculates road KM from HQ
                  </span>
                </div>

                {/* Google Maps Styled Search Input */}
                <div className="relative">
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-2xs focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-500 transition overflow-hidden">
                    <div className="pl-3.5 pr-1.5 text-rose-500">
                      <MapPin className="w-4 h-4 fill-rose-500 text-white" />
                    </div>

                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => {
                        setLocationInput(e.target.value);
                        setClientLocation(e.target.value);
                      }}
                      onFocus={() => {
                        if (locationSuggestions.length > 0) setShowLocationDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (locationSuggestions.length > 0) {
                            selectLocation(locationSuggestions[0]);
                          } else {
                            setShowLocationDropdown(false);
                          }
                        } else if (e.key === 'Escape') {
                          setShowLocationDropdown(false);
                        }
                      }}
                      placeholder="Type any city, area, pincode (e.g. Bandra Mumbai, Sector 29 Gurgaon, SG Highway)..."
                      className="w-full py-2.5 px-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
                    />

                    <div className="flex items-center pr-2 gap-1 shrink-0">
                      {isSearchingLocation && (
                        <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                      )}
                      {locationInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setLocationInput('');
                            setClientLocation('');
                            setLocationSuggestions([]);
                            setShowLocationDropdown(false);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                          title="Clear input"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (locationSuggestions.length > 0) {
                            selectLocation(locationSuggestions[0]);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Search className="w-3 h-3" />
                        <span>Search</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Google Maps-like Autocomplete Dropdown */}
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowLocationDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-slate-100">
                        <div className="p-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                          <span>Google Maps Suggestions</span>
                          <span>KM from HQ</span>
                        </div>
                        {locationSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectLocation(item)}
                            className="w-full p-2.5 text-left hover:bg-blue-50/60 transition flex items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-rose-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition shrink-0 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition truncate">
                                  {item.title}
                                </div>
                                {item.subtitle && (
                                  <div className="text-[11px] text-slate-500 truncate">
                                    {item.subtitle}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5">
                              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {item.km} KM
                              </span>
                              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Location & Route Breakdown */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                {/* Active Destination Route Indicator */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Route className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Destination</span>
                      <span className="font-bold text-slate-900 truncate block text-xs">
                        {clientLocation || 'No location selected'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    📍 {distanceKm} KM Away
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Total Distance</span>
                      <span className="text-[9px] text-slate-400 font-medium">Direct Edit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Math.max(0, Number(e.target.value)))}
                        className="w-16 px-1.5 py-0.5 text-base font-extrabold text-slate-900 border border-slate-200 rounded text-center bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-400"
                      />
                      <span className="text-xs font-bold text-slate-600">KM</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-emerald-600 font-bold block uppercase">Free Metro Limit</span>
                    <span className="text-base font-extrabold text-emerald-700">7 KM (Free)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Billable Outstation Distance:</span>
                    <p className="text-xs font-extrabold text-emerald-950">{billableKm} KM</p>
                  </div>
                  <span className="text-xs text-emerald-800 font-semibold">
                    ({distanceKm} - 20 km free allowance)
                  </span>
                </div>
              </div>

              {/* Transit Rate & Purpose */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Vehicle &amp; Rate Category:</span>
                  </span>
                  <span className="text-xs font-bold text-blue-700 px-2 py-0.5 rounded-md bg-blue-100">
                    ₹{ratePerKm} / km
                  </span>
                </div>

                <p className="text-slate-600 text-[11px]">
                  {travelPurposeLabel}
                </p>

                {/* Math formula */}
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Calculation Formula:</span>
                    <span>{billableKm} km × ₹{ratePerKm}/km</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Calculated Travel Surcharge:</span>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      ₹{calculatedTravelCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusion Toggle Card */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeTravelInQuote}
                    onChange={(e) => setIncludeTravelInQuote(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                  />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-950">
                      Include ₹{calculatedTravelCost.toLocaleString('en-IN')} Travel Charges in Quote
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      When enabled, this travel cost is automatically added to the customer's total payable bill.
                    </p>
                  </div>
                </label>

                {/* Button to view in Calculation */}
                <button
                  type="button"
                  onClick={() => setRightView('calculation')}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>View Updated Total in Calculation (₹{finalPriceToQuote.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Policy Alert */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Transit Policy Note:</span>
                </p>
                <p className="leading-relaxed text-slate-600">
                  First 20 km inside metro limits is 100% free. Any outstation distance beyond 20 km covers dedicated driver, equipment transit insurance, fuel and toll charges.
                </p>
              </div>

              {/* Copy Travel Estimate */}
              <button
                type="button"
                onClick={() => copyToClipboard(travelSummaryText, 'travel-copy')}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedKey === 'travel-copy' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                )}
                <span>{copiedKey === 'travel-copy' ? 'Travel Summary Copied!' : 'Copy Travel Summary for Client'}</span>
              </button>
            </div>
          )}

          {/* ── TAB 3: SELECTED SERVICES VIEW ── */}
          {rightView === 'select_services' && (
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Selected Services ({selectedServices.length})
                    </h2>
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* List */}
              {selectedServices.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs space-y-2">
                  <p className="font-semibold text-slate-600">No services selected in combo yet</p>
                  <p className="text-[11px] text-slate-400">
                    Please check Website, Software or Digital Marketing services from the left catalog.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {selectedServices.map((s) => (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                            {s.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                          <p className="text-[11px] text-slate-500">⏱️ Delivery: {s.timeline}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-extrabold text-slate-900 block">
                            ₹{s.price.toLocaleString('en-IN')}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleService(s.id)}
                            className="mt-1 text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                          >
                            Remove ✕
                          </button>
                        </div>
                      </div>

                      {/* Inclusions summary */}
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Key Deliverables:</p>
                        <ul className="text-[11px] text-slate-600 space-y-0.5">
                          {s.inclusions.slice(0, 3).map((inc, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Subtotal & Go to Calculation Button */}
              {selectedServices.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Services Subtotal:</span>
                    <span className="text-lg font-extrabold text-blue-400">
                      ₹{grossTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRightView('calculation')}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Calculate Discounts &amp; Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import {
  User,
  ServiceItem,
  Course,
  ObjectionItem,
  MockCallScenario,
  Lead,
  Proposal,
  EscalationTicket,
  Announcement,
  BadgeInfo
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-vahlay',
    name: 'Piyush Gond',
    email: 'vahlaydigital@gmail.com',
    role: 'super_admin',
    avatar: '',
    title: 'Super Administrator',
    phone: '+91 83479 30515',
    department: 'Executive Administration',
    joinedDate: '2026-01-01',
    readinessScore: 100,
    learningXp: 5000,
    streakDays: 30,
    completedLessons: [],
    completedQuizzes: [],
    badges: ['badge-founder'],
    assignedTargetRevenueINR: 0,
    leadsWon: 0,
    revenueGenerated: 0
  }
];

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-static-web',
    slug: 'static-website-development',
    name: 'Static Website Development',
    category: 'Web Development',
    shortDescription: 'High-speed, conversion-focused brochure websites for clinics, salons, local businesses & service providers.',
    definition: 'A static website delivers fixed HTML, CSS, and JavaScript content to visitors. It does not require a database to render pages, making it exceptionally fast, secure, and cost-effective for businesses that need to showcase services and collect leads.',
    howItWorks: 'Our team designs a mobile-first UI in Figma, writes optimized code, connects instant WhatsApp call buttons and lead enquiry forms (sent directly to the client email/phone), and hosts it on high-performance cloud networks with SSL security.',
    commonProblemsSolved: [
      'Business has no professional online existence when customers search on Google.',
      'Existing WordPress site is slow, constantly hacked, or broken.',
      'Customer inquiries drop because there is no direct click-to-WhatsApp or call button.'
    ],
    businessBenefits: [
      'Loads in under 1.5 seconds on Indian 4G/5G mobile networks.',
      'Near-zero maintenance and highest security (no database to exploit).',
      'Clean professional portfolio showcasing address, phone, services, and Google Maps embed.'
    ],
    targetIndustries: [
      'Clinics & Doctors',
      'Salons, Spas & Tattoo Studios',
      'Local Retailers & Wholesalers',
      'Chartered Accountants & Legal Advisors',
      'Manufacturing & Fabrication Units'
    ],
    packages: [
      {
        id: 'pkg-static-starter',
        name: 'Starter Business Brochure (5 Pages)',
        priceINR: 12000,
        pricingUnit: 'one-time',
        deliveryTimeline: '5 to 7 working days',
        status: 'approved',
        inclusions: [
          'Up to 5 custom-designed pages (Home, About, Services, Gallery, Contact)',
          '100% Mobile Responsive design',
          'Direct Click-to-WhatsApp & Click-to-Call buttons',
          'Lead contact form with instant email alerts',
          'Google Maps location embed',
          'Free SSL certificate setup & 1 year hosting setup assistance'
        ],
        exclusions: [
          'Content management system (CMS) to edit text without developer',
          'Online payment gateway or shopping cart',
          'Domain registration fee (client buys or pays at cost)'
        ],
        recommendedFor: 'Small clinics, tattoo studios, individual professionals and local workshops.',
        paymentMilestones: ['50% advance on project kickoff', '50% on final client approval before live deployment']
      },
      {
        id: 'pkg-static-pro',
        name: 'Corporate Presence (8-10 Pages)',
        priceINR: 22000,
        pricingUnit: 'one-time',
        deliveryTimeline: '8 to 12 working days',
        status: 'approved',
        inclusions: [
          'Up to 10 custom pages with custom iconography',
          'Speed optimization (90+ mobile Google PageSpeed score)',
          'Basic On-Page SEO setup (Meta titles, descriptions, OpenGraph)',
          'Dynamic lead capture modal popup',
          'Social media links & customer reviews carousel'
        ],
        exclusions: ['Self-editable blog backend', 'E-commerce cart'],
        recommendedFor: 'Growing service businesses, manufacturing exporters, diagnostic centers.',
        paymentMilestones: ['50% advance', '50% upon demo approval']
      }
    ],
    optionalAddons: [
      { name: 'Extra Custom Page', priceINR: 1500, description: 'Additional responsive page with client content' },
      { name: 'Multi-language (Hindi + English)', priceINR: 4000, description: 'Language switcher with translated pages' }
    ],
    discoveryQuestions: [
      'Currently jab koi customer aapka naam Google par search karta hai, toh unhe kya dikhta hai?',
      'Website ka primary goal kya hai — phone calls laana ya company profile showcase karna?',
      'Kya aapke paas ready photos, logo aur text content available hai?'
    ],
    commonObjections: [
      {
        objection: 'Mujhe to saste me 3,000 rupaye me website mil rahi hai market me.',
        quickResponse: 'Sir 3,000 me log standard templates me aapka naam daal dete hain jo phone par theek se khulti bhi nahi aur load hone me 8 second leti hai. Hum custom conversion-focused website banate hain jo call button se direct customer laaye.',
        detailedResponse: 'Sir, market me bohot log free WordPress themes clone karke de dete hain. Par agar customer call click kare aur page crash ho jaye toh lead waste ho jati hai. Vahlay Digital me hum lightweight, ultra-fast website banate hain jo Google par rank ho aur WhatsApp par direct inquiries bheje.',
        doNotPromise: 'Do not promise free lifetime changes or free domain names without payment approval.'
      }
    ],
    technicalLimitations: [
      'Client cannot add new blog posts or change text via an admin dashboard without HTML editing.',
      'No user login or database storage.'
    ],
    approvalRequirements: ['Manager approval needed for any discount exceeding 10%.'],
    faqs: [
      {
        question: 'Kya static website me text change karna possible hai?',
        answer: 'Haan sir, text change possible hai par developer ke through. Agar aapko regular updates chahiye toh hum dynamic website recommend karte hain.'
      },
      {
        question: 'Domain aur hosting kiska hoga?',
        answer: 'Domain aur hosting 100% aapke business ke naam par register hota hai. Vahlay Digital complete setup karke credentials hand over karta hai.'
      }
    ],
    pitchScript: {
      hinglish: 'Namaste Sir, agar koi new customer aapki locality me aapki service dhoondh raha ho, toh bina clean website ke wo competitor ke paas chala jata hai. Vahlay Digital aapko 5-7 din me modern, fast website deliver karta hai jisme direct WhatsApp aur Call buttons honge taaki client instantly aapse jud sake.',
      english: 'Good afternoon Sir. A professional, lightning-fast website is your 24/7 digital storefront. We build high-converting, mobile-first websites within 7 days, complete with direct WhatsApp connect, Google Maps integration, and lead capture forms.',
      discoveryQuestion: 'Sir, currently mahine me lagbhag kitne customers aapse online contact karte hain?',
      closingHook: 'Sir, kya main aapko 2-3 live examples share kar sakta hoon jo humne aapke jaise businesses ke liye banaye hain?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/static-clinic',
    portfolioExamples: ['https://dentistclinicdelhi.example.com', 'https://craftsalonmumbai.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '2.4'
  },
  {
    id: 'srv-dynamic-web',
    slug: 'dynamic-website-development',
    name: 'Dynamic Website Development',
    category: 'Web Development',
    shortDescription: 'Full-featured CMS websites with custom admin panels, blog management, and real-time database content.',
    definition: 'A dynamic website uses a backend database to store and serve content. It comes with a secure, user-friendly Admin Dashboard where the business owner or staff can add products, post blogs, edit contact details, and review customer inquiries without touching a line of code.',
    howItWorks: 'Built with modern tech (Next.js/React or custom Headless CMS). The client logs into a simple admin panel (vahlay admin) to create new service pages, upload team pictures, or publish articles.',
    commonProblemsSolved: [
      'Client needs to update prices, offers, or news weekly but does not want to pay developers every time.',
      'Business needs filterable catalogs, dynamic enquiry forms, and multi-user login.'
    ],
    businessBenefits: [
      'Complete ownership: Edit photos, text, and blogs in under 2 minutes.',
      'Scalable: Start with 10 services and scale to 500 without rebuilding.',
      'Lead Database: All form submissions saved securely in your backend dashboard.'
    ],
    targetIndustries: [
      'Real Estate Brokers & Developers',
      'Training Institutes & Colleges',
      'B2B Exporters & Distributors',
      'Event Planners & Architects',
      'Consultancies & Healthcare Centers'
    ],
    packages: [
      {
        id: 'pkg-dynamic-business',
        name: 'Business Dynamic CMS',
        priceINR: 28000,
        pricingUnit: 'one-time',
        deliveryTimeline: '12 to 16 working days',
        status: 'approved',
        inclusions: [
          'Custom Admin Dashboard (Login with ID & Password)',
          'Manage Unlimited Service Pages & Blogs',
          'Interactive Filterable Portfolio / Project Showcase',
          'Enquiry management system with CSV export',
          'Video player integration & testimonials manager',
          '1 Year Technical Support & Admin Training Session'
        ],
        exclusions: ['Full e-commerce checkout with automated inventory tracking'],
        recommendedFor: 'Growing enterprises needing frequent content updates and lead logging.',
        paymentMilestones: ['40% kickoff advance', '40% upon staging demo', '20% on live handover']
      }
    ],
    optionalAddons: [
      { name: 'WhatsApp Bot API Integration', priceINR: 6000, description: 'Direct webhook sending form leads to WhatsApp' }
    ],
    discoveryQuestions: [
      'Kitni frequently aapko apni website par offers, new projects ya services update karni hoti hain?',
      'Kya aapke paas koi team member hai jo simple dashboard me text/photo upload kar sake?'
    ],
    commonObjections: [
      {
        objection: 'Static aur Dynamic me difference kya hai? Mujhe samajh nahi aaya.',
        quickResponse: 'Sir simple shabdon me: Static website ek printed brochure jaisi hai jisme change karne ke liye designer chahiye. Dynamic website me aapko ek secure login milta hai jisse aap khud phone se bhi photo aur text badal sakte hain.',
        detailedResponse: 'Static website unke liye best hai jinke services saal bhar same rehte hain. Par agar aapko regular offers, new photos ya blogs daalne hain, toh Dynamic me aap khud bina kisi developer ke control kar sakte hain.',
        doNotPromise: 'Never guarantee unlimited free custom feature additions post handover.'
      }
    ],
    technicalLimitations: ['Requires database hosting and regular automated backups.'],
    approvalRequirements: ['Standard rate card approved. Custom modules require technical scoping.'],
    faqs: [
      {
        question: 'Kya admin panel use karna mushkil hoga?',
        answer: 'Nahi sir, hum 30-minute ka 1-on-1 screen share training dete hain aur video guide bhi provide karte hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar aap chahte hain ki website par new projects, team photos ya service prices aap khud 2 minute me update kar lein bina kisi developer ke chakkar kaate, toh Dynamic Website aapke liye best solution hai.',
      english: 'With our Dynamic CMS Website, your team gets a dedicated admin panel to update services, publish blogs, and view leads with zero technical knowledge required.',
      discoveryQuestion: 'Sir, kya aapke paas koi specific features hain jo website par dynamically update hone chahiye?',
      closingHook: 'Main aapko 5 minute me hamare dynamic admin panel ka demo dikha deta hoon.'
    },
    demoUrl: 'https://demo.vahlaydigital.com/dynamic-cms',
    portfolioExamples: ['https://estatebuildersdelhi.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '2.1'
  },
  {
    id: 'srv-ecommerce',
    slug: 'ecommerce-website-development',
    name: 'E-commerce Website Development',
    category: 'Web Development',
    shortDescription: 'Conversion-optimized online stores with Indian payment gateways (Razorpay/Cashfree), COD, and courier APIs.',
    definition: 'A digital commerce store that allows customers to browse product catalogs, select variants (size, color), add to cart, and checkout seamlessly via UPI, Credit/Debit cards, Net Banking, or Cash on Delivery (COD), integrated with Indian logistics partners.',
    howItWorks: 'We build the store using Shopify or Custom WooCommerce/React stack, integrate Razorpay/PhonePe payment gateway, configure automated tax (GST) invoices, setup SMS/WhatsApp order confirmations, and link courier tracking (Shiprocket/Delhivery).',
    commonProblemsSolved: [
      'Client selling only on WhatsApp/Instagram DMs and losing orders due to delayed manual replies.',
      'High marketplace commissions (paying 25-35% on Amazon/Flipkart) eating business profits.',
      'Fake COD orders causing heavy courier return (RTO) losses.'
    ],
    businessBenefits: [
      'Direct-to-Consumer (D2C): 100% customer data and repeat business ownership.',
      'Automated checkout with instant UPI QR & One-Click OTP login.',
      'Courier integration: Print shipping labels in 1 click and automate order tracking.'
    ],
    targetIndustries: [
      'Fashion, Sarees & Apparel Brands',
      'Ayurveda, Cosmetics & Skincare',
      'Packaged Food, Spices & Organic Products',
      'Electronics, Mobile Accessories & Gadgets',
      'Jewelry & Handmade Crafts'
    ],
    packages: [
      {
        id: 'pkg-ecom-starter',
        name: 'D2C Store Launch (Up to 50 Products)',
        priceINR: 35000,
        pricingUnit: 'one-time',
        deliveryTimeline: '14 to 20 working days',
        status: 'approved',
        inclusions: [
          'Complete Store UI/UX design (Mobile-first optimization)',
          'Product catalog setup (up to 50 products upload included)',
          'Razorpay / Cashfree / PhonePe Payment Gateway integration',
          'COD setup with pincode verification',
          'Shiprocket / Delhivery courier API integration',
          'Automated GST invoice generation',
          'WhatsApp / SMS order notification setup',
          'Abandoned cart recovery automation'
        ],
        exclusions: ['Third-party payment gateway transaction fees (approx 2% charged by Razorpay)'],
        recommendedFor: 'Brands transitioning from Instagram/Amazon to their own website.',
        paymentMilestones: ['40% advance', '40% after catalog & payment testing', '20% before public launch']
      }
    ],
    optionalAddons: [
      { name: 'COD OTP Verification Module', priceINR: 5000, description: 'Reduces RTO by verifying COD buyer via SMS OTP' }
    ],
    discoveryQuestions: [
      'Aapke paas kitne SKU / products hain launch karne ke liye?',
      'Monthly kitne orders expected hain — and kya aapka GST certificate ready hai payment gateway ke liye?'
    ],
    commonObjections: [
      {
        objection: 'Amazon aur Flipkart par hi bech rahe hain, apni website ki kya zaroorat?',
        quickResponse: 'Sir Amazon par 25-30% commission lagta hai aur customer ka data bhi aapka nahi hota. Apni website par 2% payment fee hoti hai aur repeat customer direct aapke paas aate hain bina commission ke.',
        detailedResponse: 'Amazon brand discovery ke liye accha hai par profit margins ke liye nahi. Apni website hone se aapka khud ka brand banta hai jisse customer lifetime value badhti hai.',
        doNotPromise: 'Do not promise 0% payment gateway fees or guarantee courier delivery speeds.'
      }
    ],
    technicalLimitations: ['Payment gateway approval requires legitimate business documents (PAN, GST, Bank statement).'],
    approvalRequirements: ['Standard packages approved. Multi-vendor marketplaces require custom enterprise proposal.'],
    faqs: [
      {
        question: 'Kya payment gateway me Vahlay Digital commission lega?',
        answer: 'Nahi sir, sara paisa direct aapke bank account me transfer hota hai. Vahlay Digital koi transaction commission nahi leta.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar aap Instagram ya marketplaces par bech rahe hain toh har order par heavy commission cut hota hai. Hum aapko complete D2C store bana kar dete hain jisme UPI, COD, aur Shiprocket courier direct connect hota hai.',
      english: 'Own your customer relationships and stop losing 25% margins to marketplaces. We build high-converting D2C stores with instant UPI, OTP checkout, and automated shipping.',
      discoveryQuestion: 'Sir, current me WhatsApp ya DM par order lene me kitna time waste hota hai?',
      closingHook: 'Kya main aapko ek live store dikhaoon jo humne issi month launch kiya hai?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/ecom-store',
    portfolioExamples: ['https://ayurvedicherbs.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '2.0'
  },
  {
    id: 'srv-crm',
    slug: 'crm-development',
    name: 'CRM Development',
    category: 'Software Solutions',
    shortDescription: 'Custom Customer Relationship Management software tailored for Indian sales teams and field executives.',
    definition: 'A centralized software system designed to track leads from acquisition to closure. It eliminates lost leads, tracks agent calling activities, automates WhatsApp follow-ups, and gives managers real-time visibility into the sales pipeline.',
    howItWorks: 'Accessible via web browser and mobile. Leads from Google Ads, Facebook, Indiamart, and Website automatically land into the CRM. Agents get follow-up reminders and managers view conversion ratios.',
    commonProblemsSolved: [
      'Sales agents manage leads on personal WhatsApp or rough diaries; leads are forgotten or stolen.',
      'Management has zero visibility into how many calls an agent actually attempted today.',
      'No structured follow-up reminder causing 60% of interested leads to go cold.'
    ],
    businessBenefits: [
      '100% Lead accountability: Automatic lead distribution to agents.',
      'Integrated WhatsApp messaging with pre-approved business templates.',
      'Live Manager Dashboard showing call counts, pipeline value, and deal closures.'
    ],
    targetIndustries: [
      'Real Estate Agencies & Builders',
      'Study Abroad & Immigration Consultancies',
      'B2B Wholesale Traders & Distributors',
      'Finance, Loans & Insurance Brokers',
      'Interior Designers & Contractors'
    ],
    packages: [
      {
        id: 'pkg-crm-standard',
        name: 'Vahlay Sales Flow CRM (Up to 15 Users)',
        priceINR: 45000,
        pricingUnit: 'one-time',
        deliveryTimeline: '18 to 25 working days',
        status: 'approved',
        inclusions: [
          'Lead capture from Website, Facebook Ads & Google Sheets',
          'Agent Role & Manager Role with granular permissions',
          'Automated Follow-up Reminders & Daily Agenda',
          'Kanban Sales Pipeline (New -> Contacted -> Demo -> Won)',
          'Call logging and meeting notes tracking',
          'Manager Performance & Conversion Reports',
          'Data backup & secure Cloud hosting setup'
        ],
        exclusions: ['Official Meta WhatsApp Cloud API conversation charges (billed directly by Meta)'],
        recommendedFor: 'Businesses with 3 to 15 sales executives suffering from lead leakage.',
        paymentMilestones: ['40% kickoff', '40% after pipeline configuration demo', '20% on user rollout']
      }
    ],
    optionalAddons: [
      { name: 'Official WhatsApp Business Cloud API Integration', priceINR: 10000, description: '1-click WhatsApp message triggers directly from lead card' }
    ],
    discoveryQuestions: [
      'Aapki sales team me currently kitne executives hain aur wo leads kahan note karte hain?',
      'Indiamart, Facebook ya website se aane wali leads kis process ke through distribute hoti hain?'
    ],
    commonObjections: [
      {
        objection: 'Hum Excel sheet me maintain kar lete hain, CRM ki zaroorat nahi.',
        quickResponse: 'Sir Excel sheet me agent duplicate entry kar sakta hai, reminders nahi aate, aur jab koi agent company chhodta hai toh pura data chori hone ka risk rehta hai. CRM me data company ka rehta hai aur follow-ups automate ho jaate hain.',
        detailedResponse: 'Excel me managers ko real-time call tracking nahi milti. CRM use karne se average lead response time 4 hours se ghat kar 5 minutes ho jata hai, jisse conversion 30% badhta hai.',
        doNotPromise: 'Do not promise that CRM will automatically record call audio without telephony hardware setup.'
      }
    ],
    technicalLimitations: ['Telephony IVR call recording requires telecom partner (e.g., Exotel/Knowlarity) API costs.'],
    approvalRequirements: ['Standard package approved. Custom ERP integration requires technical review ticket.'],
    faqs: [
      {
        question: 'Kya agent doosre agent ki lead dekh sakta hai?',
        answer: 'Nahi sir, CRM me role-based privacy hoti hai. Agent sirf apni assigned leads dekh sakta hai, jabki manager sabhi ka data dekh sakta hai.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar aapki sales team Excel ya diary par chal rahi hai toh 40% leads bina timely follow-up ke cold ho jati hain. Hamara CRM ensure karta hai ki har lead track ho aur manager ko live dashboard par pata chale kaunsa executive kitni calling kar raha hai.',
      english: 'Stop losing high-value sales to forgotten follow-ups and unorganized spreadsheets. Our custom CRM delivers automated lead routing, WhatsApp integration, and complete executive transparency.',
      discoveryQuestion: 'Sir, kya kabhi aisa hua hai ki agent ne follow-up miss kiya aur customer ne competitor se khareed liya?',
      closingHook: 'Sir, kya main aapke manager ke sath ek 15-minute ka live CRM demo schedule karoon?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/sales-crm',
    portfolioExamples: ['https://realtypro-crm.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '3.0'
  },
  {
    id: 'srv-erp',
    slug: 'erp-development',
    name: 'ERP Development',
    category: 'Software Solutions',
    shortDescription: 'Enterprise Resource Planning systems integrating inventory, manufacturing, billing, and accounting.',
    definition: 'A comprehensive software platform that ties together all critical operational departments of a company — procurement, inventory stock, manufacturing batch tracking, sales orders, GST billing, and supplier payments — into a unified real-time database.',
    howItWorks: 'Modular architecture where warehouse, factory floor, sales department, and accounts operate on one synchronized database, eliminating manual paper registers and duplicate data entry.',
    commonProblemsSolved: [
      'Warehouse stock in registers does not match actual physical inventory.',
      'Purchase department over-orders raw materials because sales pipeline is not connected.',
      'Delayed GST invoicing and manual calculation errors leading to audit discrepancies.'
    ],
    businessBenefits: [
      'Real-time inventory valuation across multiple godowns / locations.',
      'Automated purchase order triggers when raw material reaches minimum threshold.',
      'Complete financial audit trail with multi-level managerial approval workflows.'
    ],
    targetIndustries: [
      'Manufacturing Units & Factories',
      'FMCG Distributors & Stockists',
      'Textile & Garment Manufacturers',
      'Pharmaceutical Suppliers',
      'Construction & Building Materials Suppliers'
    ],
    packages: [
      {
        id: 'pkg-erp-modular',
        name: 'Modular Business ERP (Core 4 Modules)',
        priceINR: 120000,
        pricingUnit: 'one-time',
        deliveryTimeline: '35 to 50 working days',
        status: 'approved',
        inclusions: [
          'Inventory & Multi-Warehouse Management module',
          'Purchases, Vendor Management & PO generation',
          'Sales Invoicing, Dispatch & GST calculation',
          'Accounts Receivable / Payable & Ledger tracking',
          'Multi-level Manager Approval hierarchy',
          'Role-based access controls for up to 30 staff members',
          '3 Months dedicated on-site/remote training & deployment support'
        ],
        exclusions: ['Custom hardware scanners or biometric punch machines (client procurement)'],
        recommendedFor: 'Manufacturing and distribution businesses with annual turnover of ₹1Cr to ₹25Cr.',
        paymentMilestones: ['30% advance', '30% after prototype module signoff', '25% upon User Acceptance Testing (UAT)', '15% on final deployment']
      }
    ],
    optionalAddons: [
      { name: 'Barcode / QR Scanner Integration', priceINR: 18000, description: 'Rapid warehouse item check-in and dispatch' }
    ],
    discoveryQuestions: [
      'Aapka production cycle aur inventory currently kis software (jaise Tally ya Excel) me manage hota hai?',
      'Kitne locations/godowns hain aur kitne departments ko system me integrate karna hai?'
    ],
    commonObjections: [
      {
        objection: 'Tally chal raha hai hamara, ERP kyu chahiye?',
        quickResponse: 'Sir Tally accounting aur GST ke liye accha hai par wo warehouse inventory, production batches, aur multi-level purchase approvals ko live control nahi karta. ERP me production floor se lekar sales dispatch sab ek sath sync hota hai.',
        detailedResponse: 'Tally me post-transaction entry hoti hai. ERP me live process control hota hai — jaise jab tak quality check pass na ho, dispatch allow nahi hoti.',
        doNotPromise: 'Never promise 1-week delivery for ERP. Minimum timeline is 35 working days.'
      }
    ],
    technicalLimitations: ['Data migration from legacy systems requires clean Excel sheets from client.'],
    approvalRequirements: ['MANDATORY: Requires Technical Delivery Lead scoping call before proposal quotation.'],
    faqs: [
      {
        question: 'Kya hamara purana data migrate ho jayega?',
        answer: 'Haan sir, hum initial setup me aapke existing vendor, customer aur inventory data ko structured format me import karte hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar aapki factory ya distribution me inventory mismatch aur manual registers ki wajah se leakage ho rahi hai, toh Vahlay Digital ka customized ERP aapke inventory, purchase aur sales ko ek single screen par live control deta hai.',
      english: 'Eliminate stock discrepancies and operational blind spots. We build tailor-made ERP systems integrating warehouse inventory, purchase orders, production tracking, and multi-branch billing.',
      discoveryQuestion: 'Sir, kitne departments hain jinme daily reporting me delay hota hai?',
      closingHook: 'Sir, hamare Technical Architect ke sath ek 30-minute requirement scoping call plan karein?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/enterprise-erp',
    portfolioExamples: ['https://precisionparts-erp.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '3.2'
  },
  {
    id: 'srv-seo',
    slug: 'search-engine-optimization',
    name: 'Search Engine Optimization (SEO)',
    category: 'Digital Marketing',
    shortDescription: 'Organic Google search ranking strategies to generate continuous high-intent business inquiries.',
    definition: 'Search Engine Optimization is the systematic process of improving a website’s technical structure, content relevance, and domain authority so that it ranks on the first page of Google for profitable search keywords without paying for every ad click.',
    howItWorks: 'Comprehensive technical audit, in-depth competitor keyword research, on-page optimization, localized schema markup, high-quality blog publishing, and authority backlink building.',
    commonProblemsSolved: [
      'Website exists but gets zero visitors because Google ranks competitors on page 1.',
      'Business is spending heavy money on Google Ads; the moment ads stop, inquiries stop.',
      'Low brand credibility in organic search results.'
    ],
    businessBenefits: [
      'High-intent leads: People searching on Google are actively looking to buy right now.',
      'Long-term asset: Organic ranking delivers free inquiries 24/7 for months and years.',
      'Substantially lower Customer Acquisition Cost (CAC) compared to permanent paid ads.'
    ],
    targetIndustries: [
      'Hospitals, Dental Clinics & Cosmetic Surgeons',
      'Lawyers, Tax Consultants & CA Firms',
      'Industrial Equipment Manufacturers',
      'Luxury Interior Designers & Architects',
      'Educational Academies & Coaching Institutes'
    ],
    packages: [
      {
        id: 'pkg-seo-growth',
        name: 'Growth Organic SEO (15 Target Keywords)',
        priceINR: 18000,
        pricingUnit: 'monthly',
        deliveryTimeline: 'Ongoing monthly retainer (Minimum 3-month contract)',
        status: 'approved',
        inclusions: [
          'In-depth competitor & keyword search volume research (15 Focus Keywords)',
          'Complete On-page Technical SEO (Meta tags, H1-H6, Image Alt, Speed)',
          '4 High-authority SEO Articles / Blogs published monthly',
          'Local Indian directory citations & quality backlink outreach',
          'Google Search Console & Google Analytics monthly ranking report',
          'Dedicated SEO account manager monthly review call'
        ],
        exclusions: ['Paid advertising budget (SEO is 100% organic)'],
        recommendedFor: 'Businesses aiming to dominate local or national organic search within 3 to 6 months.',
        paymentMilestones: ['Advance at the beginning of each billing month']
      }
    ],
    optionalAddons: [
      { name: 'Extra 10 Keywords Coverage', priceINR: 8000, description: 'Expanded commercial intent keyword tracking' }
    ],
    discoveryQuestions: [
      'Aapke industry me customers Google par sabse zyada kya search karte hain?',
      'Kya aapke top competitors Google ke first page par rank kar rahe hain?'
    ],
    commonObjections: [
      {
        objection: 'Kya aap #1 ranking ki guarantee dete ho 15 din me?',
        quickResponse: 'Sir, Google khud official guidelines me kehta hai ki koi bhi legitimate agency first rank guarantee nahi de sakti. Par hum 90 din me target keywords par measurable top-page ranking progress deliver karte hain.',
        detailedResponse: 'Sir jo log 15 din me #1 rank ka vaada karte hain wo black-hat spam techniques use karte hain jisse website Google par permanently ban ho sakti hai. Hum transparent, white-hat SEO karte hain jisse safe aur permanent business growth mile.',
        doNotPromise: 'STRICT COMPLIANCE: NEVER GUARANTEE #1 GOOGLE RANKING IN A SPECIFIC NUMBER OF DAYS.'
      }
    ],
    technicalLimitations: ['SEO takes 60 to 90 days to show compounding organic results.'],
    approvalRequirements: ['Standard monthly retainers approved.'],
    faqs: [
      {
        question: 'SEO ka result kitne time me dikhta hai?',
        answer: 'Initial indexation aur keyword movements 30-45 din me dikhte hain, jabki consistent leads 3 se 4 mahine me aana start hoti hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, Google Ads par aap jab tak paise dalenge tab tak lead aayegi. SEO se aapki website Google ke first page par organically rank hoti hai jisse aapko mahino tak free aur genuine customer calls aati hain.',
      english: 'Paid ads stop delivering the minute your budget runs dry. SEO builds enduring organic authority, driving ready-to-buy customers straight to your website every day without per-click costs.',
      discoveryQuestion: 'Sir, agar aapka business aapke city ke top 3 Google search results me aaye toh aapke revenue me kitna fark padega?',
      closingHook: 'Sir, main aapki website ka ek free SEO audit report share kar doon jisme dikhega aapke competitors kahan aage hain?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/seo-audit-sample',
    portfolioExamples: ['https://delhidentalcare.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Digital Marketing Lead',
    approvalStatus: 'approved',
    version: '2.3'
  },
  {
    id: 'srv-gmb',
    slug: 'google-business-profile-optimization',
    name: 'Google Business Profile Optimization (GMB/GBP)',
    category: 'Digital Marketing',
    shortDescription: 'Local Google Maps 3-Pack ranking to capture nearby high-converting local footfall and direct calls.',
    definition: 'Specialized optimization of your Google Business Profile (formerly Google My Business) to rank in the coveted "Google Maps 3-Pack" when local customers search for businesses "near me" on mobile or desktop.',
    howItWorks: 'Complete category auditing, NAP (Name, Address, Phone) consistency across 40+ Indian local directories, high-intent product/service catalog updates, geotagged photo uploads, weekly Google updates, and automated review generation workflows.',
    commonProblemsSolved: [
      'Business profile does not appear in top 3 Google Maps recommendations for nearby searchers.',
      'Profile has low or negative reviews and no regular updates.',
      'Competitors located further away rank higher due to better local SEO signals.'
    ],
    businessBenefits: [
      'Direct phone calls from high-intent local buyers within a 5-15 km radius.',
      'Instant direction requests driving footfall to your shop, clinic, salon, or showroom.',
      'Highest conversion rate among all digital marketing channels for local retail/services.'
    ],
    targetIndustries: [
      'Salons, Spas & Beauty Parlours',
      'Tattoo Studios & Body Art Centers',
      'Clinics, Doctors & Diagnostics',
      'Car & Bike Detailing Workshops',
      'Restaurants, Cafes & Bakeries'
    ],
    packages: [
      {
        id: 'pkg-gmb-local',
        name: 'Local Maps Dominance Package',
        priceINR: 9500,
        pricingUnit: 'monthly',
        deliveryTimeline: 'Monthly continuous management',
        status: 'approved',
        inclusions: [
          'Full Profile Audit & Category Alignment (Primary + Secondary categories)',
          '40+ High-Authority Indian Local Business Citations (NAP Consistency)',
          'Weekly Geotagged high-resolution photo uploads',
          'Weekly Google Posts with promotional banners & Call-To-Action',
          'Review Acceleration strategy & QR Code review standee design',
          'Spam competitor profile fighting (reporting fake listings pushing you down)',
          'Monthly Google Insights call & direction requests report'
        ],
        exclusions: ['Buying fake Google reviews (strictly prohibited by Google and Vahlay policy)'],
        recommendedFor: 'Any local shop, salon, clinic, or service provider relying on city footfall.',
        paymentMilestones: ['Monthly advance']
      }
    ],
    optionalAddons: [
      { name: 'Custom NFC / QR Review Standee (Physical Delivery)', priceINR: 1500, description: 'Smart counter standee for instant customer 5-star reviews' }
    ],
    discoveryQuestions: [
      'Jab koi customer aapke area me aapki service Google Maps par search karta hai, toh aapki shop kaunse number par dikhti hai?',
      'Currently profile par kitne reviews hain aur mahine me lagbhag kitni calls Maps se aati hain?'
    ],
    commonObjections: [
      {
        objection: 'Kya aap 100 fake 5-star reviews daal kar de sakte ho?',
        quickResponse: 'Sir, Vahlay Digital kabhi fake reviews nahi bechta kyunki Google ka AI fake reviews detect karke profile permanently suspend kar deta hai. Hum aapke real happy customers se genuine reviews collect karne ka system setup karte hain.',
        detailedResponse: 'Google ke latest updates me fake reviews par strict penalization hai. Hum verified techniques use karte hain jisse aapka rank permanent rahe aur suspend na ho.',
        doNotPromise: 'STRICT RULE: NEVER PROMISE OR SELL FAKE GOOGLE REVIEWS.'
      }
    ],
    technicalLimitations: ['Physical verification OTP/video by Google may be required for unverified listings.'],
    approvalRequirements: ['Standard packages approved.'],
    faqs: [
      {
        question: 'Google Maps par rank badhne me kitna time lagta hai?',
        answer: 'Generally 3 se 6 hafte me local radius expand hota hai aur direct calls me noticeable increase aata hai.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, aaj kal koi bhi clinic ya salon dhoondhta hai toh Google Maps par top 3 me jo naam dikhta hai, usi ko call karta hai. Agar aapka profile wahan nahi hai toh ready-to-visit customer competitor ke paas ja raha hai. Hum aapka profile top 3 me rank karate hain.',
      english: 'When local customers search for your services nearby, the top 3 spots on Google Maps get 70% of all direct phone calls. We optimize your profile to dominate your local catchment area.',
      discoveryQuestion: 'Sir, kya aap dekhna chahenge ki aapke competitors Google Maps par kaise aage nikal rahe hain?',
      closingHook: 'Sir, main aapke current profile ka 2-minute local ranking heatmap share karta hoon.'
    },
    demoUrl: 'https://demo.vahlaydigital.com/gmb-heatmap-report',
    portfolioExamples: ['https://inkmastertattoo.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Digital Marketing Lead',
    approvalStatus: 'approved',
    version: '2.1'
  },
  {
    id: 'srv-smm',
    slug: 'social-media-marketing',
    name: 'Social Media Marketing',
    category: 'Content & Creative',
    shortDescription: 'Consistent brand building, creative graphic design, and audience engagement across Instagram, Facebook & LinkedIn.',
    definition: 'End-to-end management of your brand’s social media channels. We curate content calendars, design premium graphic creatives, write persuasive captions with targeted hashtags, and handle community engagement to build brand credibility.',
    howItWorks: 'Our creative team creates a monthly content strategy, designs branded posts reflecting your color palette, writes engaging Hindi/English captions, and posts on scheduled peak engagement hours.',
    commonProblemsSolved: [
      'Social media accounts are dead or post irregular low-quality mobile screenshots.',
      'Potential customers check Instagram to verify credibility and leave seeing zero activity.',
      'Business owner lacks time to brainstorm, design, and post consistently.'
    ],
    businessBenefits: [
      'Establishes strong social proof and brand trust for premium pricing.',
      'Keeps your brand top-of-mind so customers think of you first when they need your service.',
      'Drives organic direct message (DM) inquiries and referral sharing.'
    ],
    targetIndustries: [
      'Salons, Spas & Skin Clinics',
      'Interior Designers & Architects',
      'Boutique Clothing & Jewelry Brands',
      'Cafes, Lounges & Restaurants',
      'Fitness Centers, Gyms & Nutritionists'
    ],
    packages: [
      {
        id: 'pkg-smm-growth',
        name: 'Brand Growth Monthly Plan (16 Creatives)',
        priceINR: 15000,
        pricingUnit: 'monthly',
        deliveryTimeline: 'Ongoing monthly retainer',
        status: 'approved',
        inclusions: [
          '12 Custom Branded Static / Carousel Graphic Posts',
          '4 Motion Graphic / Animated Story Creatives',
          'Engaging captions + researched trending hashtags',
          'Festive & seasonal greeting posts included',
          'Instagram Bio optimization & Highlight covers design',
          'Monthly performance analytics report'
        ],
        exclusions: ['Physical on-site video shooting (covered under Reels Shooting service)'],
        recommendedFor: 'Businesses wanting a clean, high-prestige social media presence.',
        paymentMilestones: ['Monthly advance payment']
      }
    ],
    optionalAddons: [
      { name: 'Community DM Management', priceINR: 5000, description: 'Replying to Instagram DMs and comments within 30 minutes' }
    ],
    discoveryQuestions: [
      'Aapka target customer Instagram par active hai ya Facebook / LinkedIn par?',
      'Last post aapne kab kari thi aur kya aapka brand look consistent lagta hai?'
    ],
    commonObjections: [
      {
        objection: 'Social media post karne se direct sales aati hai kya?',
        quickResponse: 'Sir social media brand ki dukan ki decoration aur credibility jaisi hai. Jab customer website ya ad se aate hain, wo Instagram check karte hain. Agar wahan accha content hai toh trust instantly build hota hai aur closing aasan ho jati hai.',
        detailedResponse: 'Pure organic social media brand awareness ke liye hota hai. Direct immediate sales ke liye hum Paid Ads recommend karte hain. Dono sath chalne se maximum conversions aate hain.',
        doNotPromise: 'Do not promise viral reach on organic graphic posts without ad spend.'
      }
    ],
    technicalLimitations: ['Organic reach on static images is lower than reels or paid ads.'],
    approvalRequirements: ['Standard monthly plans approved.'],
    faqs: [
      {
        question: 'Kya creatives publish hone se pehle mujhe approval ke liye milenge?',
        answer: 'Haan sir, hum poore month ka content calendar 1 week pehle approval ke liye share karte hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, jab bhi koi naya customer aapka naam sunta hai, wo sabse pehle aapka Instagram check karta hai. Agar page dead hai ya design poor hai toh wo trust nahi karta. Hum aapka page ek premium brand jaisa look provide karte hain.',
      english: 'Your social media profile is your modern credibility certificate. We deliver cohesive, high-design brand creatives that position your company as the premium leader in your industry.',
      discoveryQuestion: 'Sir, kya aap chahte hain ki aapke competitors ke comparison me aapka page zyada professional dikhe?',
      closingHook: 'Main aapko 3 creatives ka sample moodboard dikhaoon jo humne aapke sector me design kiya hai?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/smm-portfolio',
    portfolioExamples: ['https://instagram.com/samplevahlaybrand'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Creative Lead',
    approvalStatus: 'approved',
    version: '2.0'
  },
  {
    id: 'srv-paid-ads',
    slug: 'paid-digital-advertising',
    name: 'Paid Digital Advertising (Meta & Google Ads)',
    category: 'Digital Marketing',
    shortDescription: 'High-ROI Meta (Facebook/Instagram) and Google Search ads that generate qualified customer leads within 48 hours.',
    definition: 'Performance-driven advertising campaigns managed across Google Search, YouTube, Instagram, and Facebook. We design high-converting ad copies, target hyper-specific customer demographics, build dedicated landing pages, and optimize for lowest Cost Per Qualified Lead (CPL).',
    howItWorks: 'Setup of Meta Pixel and Google Conversion tags, crafting offer hooks, testing 3-5 visual creatives, narrowing audiences by location, income, and behavior, and daily monitoring to cut ad spend wastage.',
    commonProblemsSolved: [
      'Business owner wasted ₹20,000 "boosting posts" on Instagram with zero sales.',
      'High Cost Per Lead with junk inquiries (unreachable numbers, wrong budget leads).',
      'Zero predictability: Business does not know how many leads will come tomorrow.'
    ],
    businessBenefits: [
      'Immediate results: High-intent leads start landing within 24 to 48 hours of campaign launch.',
      'Scalable: Put ₹1,000 ad budget, get 10 leads; put ₹5,000, get 50 leads.',
      'Hyper-targeted: Show ads only to people who have the purchasing capacity in specific pin codes.'
    ],
    targetIndustries: [
      'Real Estate Brokers & Builders',
      'Education, Coaching & Skill Training',
      'Dentists, IVF & Aesthetic Clinics',
      'B2B Machinery & Chemical Suppliers',
      'High-Ticket Luxury Services'
    ],
    packages: [
      {
        id: 'pkg-ads-performance',
        name: 'Lead Generation Performance Retainer',
        priceINR: 18000,
        pricingUnit: 'monthly',
        deliveryTimeline: 'Ongoing monthly campaign management',
        status: 'approved',
        inclusions: [
          'Complete Campaign Architecture (Meta or Google Ads)',
          'High-converting Ad Copywriting in Hindi & English',
          '4 Custom Ad Creatives (Graphics / Video Ad edits) included monthly',
          'Pixel, Conversion API & Google Tag Manager tracking setup',
          'A/B testing of target audiences, headlines, and call-to-actions',
          'Junk Lead Filter setup (OTP validation / Qualifying questions)',
          'Weekly reporting on Spend, Impressions, CPL, and Leads Delivered'
        ],
        exclusions: ['Media ad spend budget (paid directly by client to Meta / Google via their credit card)'],
        recommendedFor: 'Businesses with minimum ₹20,000 monthly ad spend looking for consistent sales pipelines.',
        paymentMilestones: ['Monthly management fee in advance']
      }
    ],
    optionalAddons: [
      { name: 'High-Converting Landing Page Design', priceINR: 10000, description: 'Custom single-page landing page designed for 15%+ conversion rate' }
    ],
    discoveryQuestions: [
      'Aapka monthly advertising budget kitna hai jo aap Meta ya Google ko direct pay kar sakte hain?',
      'Ek new customer se aapko average kitna revenue ya profit hota hai?'
    ],
    commonObjections: [
      {
        objection: 'Pehle bhi ads chalaye the, sirf faltu leads aati hain jo phone nahi uthati.',
        quickResponse: 'Sir Instagram par Boost Post karne se algorithm kisi ko bhi ad dikha deta hai. Hum custom Lead Forms banate hain jisme qualifying questions hote hain (jaise budget aur requirement type) jisse sirf serious log hi form submit kar paate hain.',
        detailedResponse: 'Junk leads aane ka main reason weak ad targeting aur zero lead filtration hota hai. Hum OTP verification ya conditional questions lagate hain taaki fake clicks filter ho jayein.',
        doNotPromise: 'NEVER GUARANTEE EXACT NUMBER OF SALES. We deliver qualified leads, closing depends on client sales team.'
      }
    ],
    technicalLimitations: ['Ad account must comply with Meta & Google advertising policies (no restricted claims).'],
    approvalRequirements: ['Standard management fee approved. Budget management above ₹1,00,000/mo has custom tier.'],
    faqs: [
      {
        question: 'Ad budget kahan pay karna hota hai?',
        answer: 'Ad budget direct aapke Google ya Facebook ad account me aapke credit/debit card se deduct hota hai. Vahlay Digital sirf management fee charge karta hai.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar aap chahte hain ki kal se hi aapke sales executives ke paas 10 se 15 genuine customer inquiries aana shuru ho jayein, toh Paid Digital Ads sabse fast aur predictable tareeqa hai. Hum target audience filter karke sirf high-intent buyers tak ad pahunchate hain.',
      english: 'Transform your pipeline from guessing to predictable math. We build targeted Meta and Google ad funnels with strict qualification filters to deliver high-intent leads straight to your sales team.',
      discoveryQuestion: 'Sir, agar hum aapko daily 5 qualified leads deliver karein, toh aapki team unhe close karne ke liye ready hai?',
      closingHook: 'Sir, kya main aapke specific niche ke liye ek projected CPL aur budget calculation share karoon?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/performance-funnel',
    portfolioExamples: ['https://realtyleads-case-study.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Performance Marketing Lead',
    approvalStatus: 'approved',
    version: '3.1'
  },
  {
    id: 'srv-reels-shoot',
    slug: 'reels-shooting',
    name: 'Reels Shooting (On-Site Video Production)',
    category: 'Content & Creative',
    shortDescription: 'Professional on-location cinema-grade 4K camera & lighting crew to shoot viral reels, client testimonials & facility tours.',
    definition: 'Physical on-site video production where our professional videographer, lighting technician, and creative director visit your clinic, salon, studio, restaurant, or factory with cinema cameras, wireless lapel microphones, and studio lights to shoot high-impact short-form video content.',
    howItWorks: 'Pre-production script alignment, 1 dedicated shoot day on client premises, professional gimbal stabilization, multi-angle b-roll capture, founder interviews, customer transformations, and audio capture.',
    commonProblemsSolved: [
      'Client wants to do Reels but feels awkward on camera or shoots shaky phone videos with poor audio.',
      'Showroom, clinic, or restaurant looks beautiful in person but looks amateur on social media.',
      'Lack of script and direction causing wasted time on shoot days.'
    ],
    businessBenefits: [
      'Viral potential: Short-form video is favored 10x by Instagram & YouTube algorithms.',
      'Human connection: Founder and doctor/artist on video creates massive trust with buyers.',
      'Content batching: Shoot an entire month’s worth of video assets in just 1 single productive day.'
    ],
    targetIndustries: [
      'Tattoo Artists & Piercing Studios',
      'Aesthetic Clinics, Dentists & Hair Transplants',
      'Fine Dining Restaurants, Cafes & Bakeries',
      'Luxury Interior Showrooms & Furniture Studios',
      'Real Estate Model Villas & Luxury Apartments'
    ],
    packages: [
      {
        id: 'pkg-shoot-halfday',
        name: 'Half-Day On-Site Production (10 Reels Content)',
        priceINR: 18000,
        pricingUnit: 'per-project',
        deliveryTimeline: '1 Shoot Day (up to 4 hours on location)',
        status: 'approved',
        inclusions: [
          'Professional Videographer with 4K Cinema Camera + Gimbal Stabilizer',
          'Studio Lighting Setup & Wireless Lapel Audio Microphones',
          'Pre-shoot scripted concepts & hook ideas provided',
          'On-site creative direction & coaching for camera-shy founders',
          'Raw footage capture sufficient for 10-12 high-engagement reels',
          'B-roll shots of clinic equipment, procedures, and customer interaction'
        ],
        exclusions: ['Travel/accommodation outside local metro city limits', 'Editing (paired with Reels Editing service)'],
        recommendedFor: 'Salons, clinics, and studios wanting a professional batch of authentic videos.',
        paymentMilestones: ['50% advance to lock shoot date', '50% upon completion of shoot day']
      }
    ],
    optionalAddons: [
      { name: 'Drone Aerial 4K Footage', priceINR: 6000, description: 'Outdoor exterior architecture / factory aerial shots' }
    ],
    discoveryQuestions: [
      'Aapka studio ya showroom kahan located hai aur kya aap khud camera par aane me comfortable hain?',
      'Kya aapke paas happy customers ya staff members hain jinhe hum video me feature kar sakein?'
    ],
    commonObjections: [
      {
        objection: 'Hum phone se hi shoot kar lete hain, camera team ki kya zaroorat?',
        quickResponse: 'Sir phone me lighting aur audio capture poor hota hai. Clinic ya salon me agar audio me echo ho aur light dull ho toh brand cheap lagta hai. Professional lighting aur mic se content 10 guna zyada trustworthy lagta hai.',
        detailedResponse: 'Phone videos casual lagti hain. Par jab customer high-ticket treatments dekh raha hota hai, cinema quality visuals unhe premium price pay karne ke liye convince karti hain.',
        doNotPromise: 'Do not promise infinite shoot hours; overtime beyond package requires prior approval.'
      }
    ],
    technicalLimitations: ['Requires clean, well-lit shooting environment and shoot permission from venue.'],
    approvalRequirements: ['Standard metro city packages approved. Outstation shoots require travel quote ticket.'],
    faqs: [
      {
        question: 'Shooting me kitna time lagta hai?',
        answer: 'Half-day shoot lagbhag 4 ghante ka hota hai jisme hum 10-12 reels ka complete raw footage batch kar lete hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, phone se shoot karne me lighting aur audio weak rehti hai jisse brand standard nahi lagta. Hamari professional crew cinema camera, wireless mics aur studio lights lekar aati hai aur 4 ghante me aapke pure mahine ke 10-12 viral reels shoot kar leti hai.',
      english: 'Elevate your brand beyond shaky mobile clips. Our production crew brings cinema 4K rigs, wireless audio, and studio lighting directly to your premises, capturing a full month of captivating video content in half a day.',
      discoveryQuestion: 'Sir, kya aapke clinic/salon me koi signature transformation ya service hai jo video me dikhane se customer attract ho?',
      closingHook: 'Sir, kya main aapko hamari recent salon video shoot ka before-after comparison dikhaoon?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/reels-shoot-behindthescenes',
    portfolioExamples: ['https://inkmaster-reels.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Video Production Lead',
    approvalStatus: 'approved',
    version: '2.0'
  },
  {
    id: 'srv-reels-edit',
    slug: 'reels-editing',
    name: 'Reels Editing & Post-Production',
    category: 'Content & Creative',
    shortDescription: 'Snappy pacing, trending audio, viral hook animations, dynamic subtitles, and motion graphics that retain viewers.',
    definition: 'Specialized video post-production designed for Instagram Reels and YouTube Shorts. We take raw mobile or camera footage and transform it into viral-ready videos featuring trending pacing, animated dynamic subtitles (Hormozi style), sound effects (SFX), zooms, color grading, and retention-maximizing hooks.',
    howItWorks: 'Client uploads raw footage to Google Drive; our editors trim silences, add jump-cuts, color correct, embed dynamic text popups, insert relevant b-roll overlays, and sync with trending audio tracks.',
    commonProblemsSolved: [
      'Raw videos are slow, boring, and drop 80% of viewers within the first 3 seconds.',
      '85% of people watch social media videos on mute; videos without engaging subtitles get skipped.',
      'Business owner has raw videos but editing takes 4 hours per video.'
    ],
    businessBenefits: [
      'High viewer retention which triggers the Instagram algorithm to push reels to non-followers.',
      'Dynamic typography ensures viewer absorbs your offer even with sound turned off.',
      'Turnaround in 48 hours: Regular flow of ready-to-post content.'
    ],
    targetIndustries: [
      'Fitness Trainers & Nutritionists',
      'Doctors, Dentists & Surgeons',
      'Finance, Stock Market & Real Estate Creators',
      'Tattoo Artists & Nail Salons',
      'Founders Building Personal Brands'
    ],
    packages: [
      {
        id: 'pkg-edit-pack12',
        name: 'Viral Reels Editing Pack (12 Videos)',
        priceINR: 12000,
        pricingUnit: 'per-project',
        deliveryTimeline: 'Rolling delivery within 7 to 10 days',
        status: 'approved',
        inclusions: [
          'Editing of up to 12 Short-form Videos (up to 60 seconds each)',
          'High-retention dynamic colored animated subtitles with emojis',
          'Sound effects (whooshes, pops, ding) and sound design',
          'Motion graphic title cards & zoom cutaways',
          'Color grading & skin smoothing adjustments',
          'Trending audio recommendations included',
          'Up to 2 revision rounds per reel'
        ],
        exclusions: ['On-site physical shooting (editing only)'],
        recommendedFor: 'Creators or businesses who shoot their own raw clips and need professional post-production.',
        paymentMilestones: ['50% advance', '50% upon batch delivery']
      }
    ],
    optionalAddons: [
      { name: 'Same-day 24hr Rush Delivery', priceINR: 3000, description: 'Priority editor turnaround for urgent event clips' }
    ],
    discoveryQuestions: [
      'Kya aapke paas already phone se record kiye hue raw videos Google Drive me pade hain?',
      'Aapko reels me kis type ka style pasand hai — fast dynamic cuts ya classy clean aesthetic?'
    ],
    commonObjections: [
      {
        objection: 'CapCut par toh hum khud hi 5 minute me filter laga lete hain.',
        quickResponse: 'Sir filter lagane aur high-retention video edit karne me bohot farak hota hai. Hum sound effects, retention hooks, aur customized subtitle animations daalte hain jisse viewer 3 second me swipe na kare aur pura offer sune.',
        detailedResponse: 'Professional editing retention badhati hai. Agar viewer 70% video dekhta hai, tabhi Instagram usse naye prospective clients ke feed par bhejta hai.',
        doNotPromise: 'Do not promise millions of views guaranteed, as algorithm reach depends also on hook idea.'
      }
    ],
    technicalLimitations: ['Raw footage must have decent audio clarity to sync subtitles.'],
    approvalRequirements: ['Standard editing packs approved.'],
    faqs: [
      {
        question: 'Reels banne ke baad revision karwa sakte hain?',
        answer: 'Haan sir, har reel par 2 round of text ya cut revisions included hoti hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, 80% log reels bina sound ke dekhte hain. Agar aapki video me dynamic subtitles, sound effects aur quick cuts nahi hain toh log 2 second me scroll kar dete hain. Hamari team aapke raw clips ko viral-ready standard me convert karke deti hai.',
      english: 'Turn raw footage into algorithm magnets. We edit your clips with retention-focused jump cuts, dynamic animated subtitles, crisp SFX, and sound design to keep viewers hooked till your call-to-action.',
      discoveryQuestion: 'Sir, kya aapke paas koi raw clips hain jinka hum 1 free sample reel edit karke dikha sakein?',
      closingHook: 'Sir, ek 30-second raw clip WhatsApp kijiye, hum aapko sample edit dikhate hain.'
    },
    demoUrl: 'https://demo.vahlaydigital.com/reels-before-after',
    portfolioExamples: ['https://reels-samples.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Video Production Lead',
    approvalStatus: 'approved',
    version: '2.1'
  },
  {
    id: 'srv-custom-software',
    slug: 'custom-software-development',
    name: 'Custom Software Development',
    category: 'Software Solutions',
    shortDescription: 'Bespoke web applications, SaaS platforms, client portals, and automation tools built from scratch.',
    definition: 'Tailor-made software engineered precisely to your unique business workflows where off-the-shelf software falls short. Built using modern, enterprise-grade frameworks (React, Node.js, PostgreSQL) with robust APIs, bank-grade authentication, and role-based access.',
    howItWorks: 'Requirements engineering, clickable Figma prototype, architecture blueprint, iterative sprint development, security testing, and cloud deployment on AWS / Google Cloud.',
    commonProblemsSolved: [
      'Business has unique operational logic that ready-made SaaS tools cannot accommodate.',
      'Need a multi-tenant client portal with secure document exchange and automated PDF reports.',
      'SaaS subscription fees are escalating into lakhs per year.'
    ],
    businessBenefits: [
      '100% intellectual property (IP) and software source code ownership.',
      'Zero recurring per-user software licensing penalties.',
      'Seamless custom integrations with any third-party API, WhatsApp, or hardware device.'
    ],
    targetIndustries: [
      'Logistics & Fleet Transport Companies',
      'Fintech & Microfinance Institutions',
      'EdTech & Online Examination Portals',
      'Healthcare Diagnostics & Telemedicine',
      'Aggregator Marketplaces & B2B Portals'
    ],
    packages: [
      {
        id: 'pkg-custom-mvp',
        name: 'Custom Application MVP (Phase 1)',
        priceINR: 150000,
        pricingUnit: 'per-project',
        deliveryTimeline: '45 to 60 working days',
        status: 'approved',
        inclusions: [
          'Detailed Software Requirement Specification (SRS) & Database Architecture',
          'Interactive UI/UX Prototype in Figma with full user flows',
          'Frontend React Web Application + Backend Node.js REST / GraphQL API',
          'PostgreSQL Database design with encrypted data protection',
          'Role-based User Permissions & JWT Authentication',
          'Automated email/SMS notification integration',
          'Full Source Code Handover with deployment documentation'
        ],
        exclusions: ['Cloud server hosting charges (paid directly to AWS / GCP by client)'],
        recommendedFor: 'Startups and enterprises building proprietary business software.',
        paymentMilestones: ['30% kickoff advance', '30% upon frontend prototype signoff', '25% upon feature completion', '15% on UAT and live deployment']
      }
    ],
    optionalAddons: [
      { name: 'Dedicated Android Mobile App (Flutter/React Native)', priceINR: 80000, description: 'Companion mobile app connected to software backend' }
    ],
    discoveryQuestions: [
      'Aapka current workflow kya hai aur market ke existing software me kahan limitation aa rahi hai?',
      'Kitne active users ya external clients system ko use karenge?'
    ],
    commonObjections: [
      {
        objection: 'Custom software bohot mehenga aur time-taking hota hai.',
        quickResponse: 'Sir custom software initial me investment lagta hai, par ready-made software me aap har saal per-user subscription bharte hain aur workflow me compromise karna padta hai. Custom software aapka permanent asset ban jata hai.',
        detailedResponse: 'Hum phased approach me banate hain jisme Phase 1 MVP 6-8 hafte me live ho jata hai, jisse business operations jaldi streamline ho sakein.',
        doNotPromise: 'MANDATORY: NEVER quote fixed price or timeline without technical feasibility ticket signoff.'
      }
    ],
    technicalLimitations: ['Requires structured client signoffs at every sprint milestone.'],
    approvalRequirements: ['STRICT ESCALATION: Proposal requires Technical Delivery Lead written signoff.'],
    faqs: [
      {
        question: 'Source code kiska hoga?',
        answer: '100% source code aur Intellectual Property (IP) client ki hoti hai. Handover me complete repository access provide kiya jata hai.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, agar market ke readymade software aapke specific business logic ko suit nahi kar rahe aur aap lakhs of rupees subscription me de rahe hain, toh Vahlay Digital aapke liye bespoke software build karta hai jiska 100% code aur ownership aapki hoti hai.',
      english: 'When off-the-shelf software limits your operational scalability, custom engineering is the answer. We build robust, scalable web platforms and portals tailored precisely to your company’s unique workflows.',
      discoveryQuestion: 'Sir, kya main hamare Technical Solutions Architect ke sath ek brief discovery call schedule kar sakta hoon?',
      closingHook: 'Sir, kal 3:30 PM par technical feasibility discuss karne ke liye suitable rahega?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/custom-portal',
    portfolioExamples: ['https://logisticsflow.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '3.0'
  },
  {
    id: 'srv-maintenance',
    slug: 'website-maintenance-support',
    name: 'Website Maintenance & Support (AMC)',
    category: 'Maintenance',
    shortDescription: '24/7 uptime monitoring, security patching, cloud backups, bug fixing, and monthly content updates.',
    definition: 'An Annual Maintenance Contract (AMC) providing proactive health checks, database backups, malware scans, SSL renewals, core updates, and dedicated developer hours to update text, banners, and promotions without hiring an in-house IT team.',
    howItWorks: 'Our maintenance bots monitor your site every 5 minutes. If downtime occurs, an alert triggers immediate engineer intervention. The client gets a dedicated WhatsApp / email ticketing desk for instant content updates.',
    commonProblemsSolved: [
      'Website crashes right when high-budget ads are running, wasting marketing spend.',
      'Hacked or infected with malware showing spam popups to customers.',
      'Client needs small text or price updates but previous freelance developer has disappeared.'
    ],
    businessBenefits: [
      'Peace of mind: 99.9% uptime guarantee with continuous monitoring.',
      'Daily off-site cloud backups so data can be restored in 1 click.',
      'Dedicated developer on call for monthly updates.'
    ],
    targetIndustries: [
      'All businesses running websites or e-commerce stores',
      'Corporate Exporters & Institutions',
      'High-traffic Clinics & Service Portals'
    ],
    packages: [
      {
        id: 'pkg-amc-standard',
        name: 'Standard Care AMC Retainer',
        priceINR: 4500,
        pricingUnit: 'monthly',
        deliveryTimeline: 'Ongoing monthly coverage',
        status: 'approved',
        inclusions: [
          '24/7 Automated Uptime Monitoring with 15-minute response SLA',
          'Daily off-site Cloud Backups (retention for 30 days)',
          'Monthly Core, Plugin, and Security Patch Updates',
          'Malware scans & SSL Certificate renewal monitoring',
          'Up to 3 hours of monthly developer time for text/image/banner updates',
          'Speed audit and database cleanup every 30 days'
        ],
        exclusions: ['Major redesigns or building entirely new modules from scratch'],
        recommendedFor: 'Any business that cannot afford even a single day of website downtime.',
        paymentMilestones: ['Quarterly or Annual advance (10% discount on Annual advance)']
      }
    ],
    optionalAddons: [
      { name: 'Emergency 1-Hour SLA Incident Response', priceINR: 2500, description: 'Guaranteed 60-minute engineer response 24/7' }
    ],
    discoveryQuestions: [
      'Last time aapki website ka backup kab liya gaya tha?',
      'Agar kal website down ho jaye, toh currently kaunsa engineer fix karega?'
    ],
    commonObjections: [
      {
        objection: 'Website ban gayi hai, ab maintenance ka paisa kyu dena?',
        quickResponse: 'Sir jaise nayi car khareedne ke baad regular service aur oil change zaroori hota hai taaki gaadi beech raaste band na ho, waise hi website ko security patches aur backup chahiye hote hain taaki hack ya crash na ho.',
        detailedResponse: 'Internet par daily thousands of malware bots scan karte hain. Bina updates ke website hack ho sakti hai aur Google usse "Dangerous Site" mark karke search se hata deta hai. AMC aapki digital asset ka insurance hai.',
        doNotPromise: 'Do not promise infinite hours of new feature development under a basic AMC.'
      }
    ],
    technicalLimitations: ['Legacy unmaintained websites may require initial cleanup fee.'],
    approvalRequirements: ['Standard AMC packages approved.'],
    faqs: [
      {
        question: 'Agar hume koi text change karwana ho toh kitna time lagta hai?',
        answer: 'Normal content updates 24 to 48 business hours ke andar live kar diye jaate hain.'
      }
    ],
    pitchScript: {
      hinglish: 'Sir, website launch hone ke baad agar wo slow ho jaye, hack ho jaye ya crash kare toh direct business ka loss hota hai. Hamara AMC package aapko daily cloud backups, 24/7 uptime monitoring aur developer support deta hai taaki aapka business smoothly run kare.',
      english: 'Protect your digital investment. Our website maintenance retainer guarantees 99.9% uptime, daily automated cloud backups, security hardening, and dedicated monthly developer hours for your business.',
      discoveryQuestion: 'Sir, kya aapke paas koi dedicated technical person hai jo website ki security aur backups sambhal raha hai?',
      closingHook: 'Sir, hum aapki current site ka ek free Health & Security audit run karke dikha sakte hain?'
    },
    demoUrl: 'https://demo.vahlaydigital.com/amc-health-dashboard',
    portfolioExamples: ['https://corporate-amc-report.example.com'],
    lastReviewedDate: '2026-10-01',
    contentOwner: 'Technical Delivery Lead',
    approvalStatus: 'approved',
    version: '2.0'
  }
];

export const INITIAL_ACADEMY_COURSES: Course[] = [
  {
    id: 'course-15-day-bootcamp',
    title: 'Vahlay Digital 15-Day Sales Masterclass Bootcamp',
    description: 'The mandatory foundation training program transforming fresh sales agents into high-confidence B2B digital sales advisors capable of requirement discovery, objection handling, and closing deals.',
    totalDays: 15,
    level: 'Beginner',
    lessons: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Company Introduction, Vahlay Culture & Service Ecosystem Overview',
        serviceCategory: 'Company Overview',
        durationMinutes: 45,
        learningObjective: 'Understand Vahlay Digital’s mission, domestic market positioning, full range of 13 IT & marketing services, and the core responsibilities of a trusted sales advisor.',
        summary: 'Vahlay Digital is not a cheap template mill. We are a high-trust digital transformation partner for Indian businesses. Learn our value proposition, who our clients are, and how to represent our brand with pride.',
        fullContent: `
# Welcome to Vahlay Digital Sales Academy

## 1. Who We Are
Vahlay Digital is an established IT services, website development, business software, and digital marketing firm. We operate in the fast-growing Indian domestic B2B landscape. 

Our core philosophy: **"We don't sell websites or software; we sell business growth, operational efficiency, and customer conversions."**

## 2. Our Target Market
We cater to diverse Indian domestic business owners:
- Local Retailers, Salons, Tattoo Studios, and Medical Clinics
- B2B Manufacturers, Exporters, and Wholesale Distributors
- Service Providers: Lawyers, Chartered Accountants, Real Estate Brokers, Architects
- Growing Startups and Direct-to-Consumer (D2C) Brands

## 3. The 13 Core Pillars of Vahlay Services
1. Static Website Development (Speed & High-converting brochures)
2. Dynamic Website Development (CMS-driven editable sites)
3. E-commerce Website Development (Direct D2C stores with UPI/COD)
4. CRM Development (Lead management & WhatsApp automation)
5. ERP Development (Factory, inventory, and multi-branch operations)
6. Search Engine Optimization (SEO) (Organic high-intent Google ranking)
7. Google Business Profile Optimization (GMB/GBP) (Local Maps 3-Pack)
8. Social Media Marketing (Brand credibility on Instagram/LinkedIn)
9. Paid Digital Advertising (Meta & Google performance ads)
10. Reels Shooting (On-site cinema camera video production)
11. Reels Editing (Retention-focused short-form post-production)
12. Custom Software Development (Bespoke portals and automation)
13. Website Maintenance & Support (24/7 AMC and security monitoring)

## 4. The Golden Rule of a Vahlay Sales Agent
- **Never Lie, Never Guess:** If you do not know a technical answer or custom price, say: *"Sir, let me verify this with our technical delivery architect to ensure 100% precision."*
- **Listen More Than You Talk:** A great salesperson asks diagnostic discovery questions.
- **Value Over Price:** Low prices attract bad clients; high perceived value closes high-ticket deals.
        `,
        businessCaseExample: {
          client: 'Shree Balaji Hardware & Electricals (Wholesaler)',
          industry: 'B2B Wholesale / Manufacturing',
          problem: 'Retailers were calling constantly for basic product catalogs and prices; orders were mixed up on personal WhatsApp.',
          recommendedSolution: 'Dynamic B2B Catalog Website + WhatsApp CRM integration.',
          outcome: 'Saved 3 hours of daily manual catalog sharing and increased wholesale inquiries by 40% in 60 days.'
        },
        pitchScript: {
          hinglish: 'Namaste Sir, main Rohan baat kar raha hoon Vahlay Digital se. Hum Indian businesses ko digital tools aur custom websites provide karte hain jisse unka business Google par top par aaye aur daily genuine customer inquiries generate ho sakein.',
          english: 'Good afternoon Sir. This is Rohan from Vahlay Digital. We help ambitious Indian businesses build high-converting digital infrastructure — from fast websites to sales CRMs and Google ranking.',
          hook: 'Sir, kya aapke paas currently 2 minute ka time hai ek quick business conversation ke liye?'
        },
        flashcards: [
          { front: 'What is Vahlay Digital’s core positioning?', back: 'A high-trust digital transformation partner providing high-converting websites, software, and marketing for Indian businesses.' },
          { front: 'How many core services does Vahlay Digital provide?', back: '13 specialized services spanning Web, Software, Digital Marketing, Video Production, and Maintenance.' },
          { front: 'What should an agent do if they do not know a technical answer?', back: 'Never guess or make false promises. Escalate to the Technical Delivery Lead or Sales Manager for verified confirmation.' },
          { front: 'Who are our primary target customers in India?', back: 'Clinics, salons, manufacturers, retailers, real estate firms, distributors, and growing startups.' },
          { front: 'What is the golden rule of pricing?', back: 'Only quote officially approved rate chart packages. Custom requirements require management approval.' }
        ],
        quizQuestions: [
          {
            id: 'q-d1-1',
            type: 'single',
            question: 'When a customer asks a complex technical integration question you are unsure about, what is the approved action?',
            options: [
              'Make an educated guess so you look smart',
              'Tell them it is completely impossible',
              'Politely state that you will confirm with the Technical Delivery Lead and get back with verified specs',
              'Promise that anything can be done for free'
            ],
            correctAnswer: 2,
            explanation: 'Honesty and discipline maintain trust. Guessing or false commitments harm the company and client.',
            category: 'compliance'
          },
          {
            id: 'q-d1-2',
            type: 'single',
            question: 'Which of the following is NOT one of Vahlay Digital’s 13 core service offerings?',
            options: [
              'Custom CRM Development',
              'Cryptocurrency Trading Bot Development',
              'Google Business Profile Optimization',
              'On-Site Reels Shooting'
            ],
            correctAnswer: 1,
            explanation: 'Crypto trading bots are not part of Vahlay Digital’s domestic service catalog.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Practice introducing Vahlay Digital in 30 seconds to a busy salon owner who has never heard of us before.',
        assignment: 'Write down a 30-second elevator pitch in your own words (both English and Hinglish) and practice speaking it aloud.'
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Static Website vs Dynamic Website: The Sales Battlecard',
        serviceCategory: 'Web Development',
        durationMinutes: 50,
        learningObjective: 'Master the technical and business differences between static and dynamic websites so you can prescribe the exact right solution to clients.',
        summary: 'Learn why a static site is like a printed glossy brochure (ultra-fast, zero maintenance) while a dynamic site is like a live interactive portal with an admin panel. Never oversell or undersell.',
        fullContent: `
# Static vs Dynamic Websites: Complete Breakdown

## 1. What is a Static Website?
A static website consists of pre-built HTML, CSS, and JavaScript. 
- **Key Analogy:** A printed, high-gloss brochure.
- **Speed:** Ultra-fast (<1.5 seconds loading).
- **Security:** Near 100% immune to database hacks.
- **Maintenance:** Near zero cost.
- **Limitation:** Client cannot edit text or images without asking a web developer.
- **Best For:** Small clinics, tattoo artists, local service shops, chartered accountants who just need an address, portfolio, phone button, and Google map.
- **Approved Starting Price:** ₹12,000 for 5 pages.

## 2. What is a Dynamic Website?
A dynamic website connects to a database and comes with an Admin Dashboard.
- **Key Analogy:** An interactive portal or digital magazine.
- **Admin Control:** The client logs in with username and password to create new blogs, change product pictures, post announcements, or view submitted leads.
- **Best For:** Businesses with regular updates — builders with new projects, coaching institutes with batches, exporters with seasonal catalogs.
- **Approved Starting Price:** ₹28,000.

## 3. The 3 Diagnostic Questions to Ask:
1. *"Sir, aapko website par information kitni frequently change karni hogi — saal me ek baar ya har hafte?"*
2. *"Kya aapke office me koi staff member hai jo admin dashboard login karke photo ya text update karega?"*
3. *"Website ka main motive kya hai — sirf phone call aana ya regular blogs/projects publish karna?"*
        `,
        businessCaseExample: {
          client: 'Dr. Alok Verma, Smile Dental Care',
          industry: 'Healthcare / Clinic',
          problem: 'Previous freelancer charged ₹40,000 for a complex WordPress site that broke every time an update came.',
          recommendedSolution: '5-Page Static Website with direct WhatsApp appointment booking.',
          outcome: 'Page load time dropped from 7 seconds to 1.1 seconds; appointment bookings increased by 80%.'
        },
        pitchScript: {
          hinglish: 'Sir, agar aapka clinic ka address aur services fixed hain, toh aapko mehenga dynamic portal lene ki zaroorat nahi hai. Hamara 5-page static website ultra-fast khulta hai aur direct WhatsApp call button deta hai. Par agar aapko monthly offers khud change karne hain, toh hum dynamic CMS provide karte hain.',
          english: 'Sir, if your core offerings are established, a static website provides maximum speed and zero maintenance at ₹12,000. If you require weekly updates and blog management, our dynamic CMS at ₹28,000 is the ideal fit.',
          hook: 'Sir, kya aap chahte hain ki customer aapse direct WhatsApp par connect kare bina kisi page delay ke?'
        },
        flashcards: [
          { front: 'What is the main limitation of a static website?', back: 'Content cannot be edited without touching the code (no admin panel).' },
          { front: 'Why do static websites load faster than dynamic websites?', back: 'They serve pre-rendered HTML/CSS directly without database querying.' },
          { front: 'When should you recommend a dynamic website?', back: 'When the client needs regular content updates, blogs, project showcases, or an admin dashboard.' },
          { front: 'What is the approved starting price for a 5-page static website?', back: '₹12,000 (Starter Business Brochure).' },
          { front: 'What is the approved starting price for a dynamic CMS website?', back: '₹28,000 (Business Dynamic CMS).' }
        ],
        quizQuestions: [
          {
            id: 'q-d2-1',
            type: 'single',
            question: 'A local dentist wants a website to display their clinic address, doctor qualifications, and a WhatsApp appointment button. They will not post weekly blogs. Which package is ideal?',
            options: [
              'Custom Enterprise ERP',
              'Starter Static Website (5 Pages) at ₹12,000',
              'Multi-Vendor E-commerce Platform',
              'Custom SaaS Application'
            ],
            correctAnswer: 1,
            explanation: 'A static website is the fastest, most cost-effective, and low-maintenance choice for a local doctor.',
            category: 'product_knowledge'
          },
          {
            id: 'q-d2-2',
            type: 'single',
            question: 'Can a client with a static website log into an admin panel to change their phone number without a developer?',
            options: [
              'Yes, static websites always have an admin dashboard',
              'No, static websites do not have an admin CMS; they require developer editing or an upgrade to dynamic',
              'Yes, by hacking into the server',
              'Only on weekends'
            ],
            correctAnswer: 1,
            explanation: 'Static websites have no backend CMS. If self-editing is needed, recommend a dynamic website.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Explain the difference between static and dynamic to a non-technical shop owner in simple Hindi/Hinglish in under 45 seconds.',
        assignment: 'Record yourself explaining the difference using the "Glossy Printed Brochure vs Digital Board" analogy.'
      },
      {
        id: 'day-3',
        dayNumber: 3,
        title: 'E-commerce Websites: D2C, Payment Gateways & Logistics',
        serviceCategory: 'Web Development',
        durationMinutes: 50,
        learningObjective: 'Understand how Indian D2C e-commerce operates: Razorpay/UPI integration, Cash on Delivery (COD) verification, Shiprocket logistics, and marketplace commission savings.',
        summary: 'How to pitch an online store to apparel, jewelry, ayurveda, and organic food brands selling on Amazon or Instagram.',
        fullContent: `
# E-commerce Sales Mastery

## 1. Why Indian Brands Need Their Own E-commerce Store
- **Marketplace Commission Bleed:** Amazon & Flipkart take 20% to 35% commission on every order.
- **Zero Customer Ownership:** On Amazon, you never get the buyer's phone number or email for repeat marketing.
- **Instagram DM Chaos:** Taking orders over WhatsApp chats leads to missed messages, payment disputes, and manual stock errors.

## 2. Core Components of a Vahlay E-commerce Store
1. **Mobile-First Product Catalog:** High-speed product pages with size/color variants and high-res zoom.
2. **Indian Payment Gateways:** Razorpay / Cashfree / PhonePe supporting instant UPI QR codes, Credit Cards, Net Banking, and Wallets.
3. **Automated Cash On Delivery (COD):** Pincode serviceability check and optional SMS OTP verification to prevent fake orders.
4. **Logistics Integration:** Shiprocket / Delhivery API connection for 1-click shipping label generation and live tracking links.
5. **Abandoned Cart Automation:** Automated WhatsApp/Email triggers to recover 20-30% of lost shoppers.

## 3. Approved Pricing & Delivery
- **D2C Store Launch (Up to 50 Products):** ₹35,000 (14-20 working days).
        `,
        businessCaseExample: {
          client: 'Ruhaniyat Organic Spices, Jaipur',
          industry: 'Packaged Spices & Food',
          problem: 'Selling on Instagram DMs with high manual errors; lost 15 orders a week due to delayed bank transfer confirmations.',
          recommendedSolution: 'D2C Store with Razorpay UPI & Shiprocket courier sync.',
          outcome: 'Order volume tripled; payment collection became 100% automated with zero manual reconciliation.'
        },
        pitchScript: {
          hinglish: 'Sir, agar aap Instagram ya Amazon par sell kar rahe hain, toh har order par heavy commission cut hota hai aur customer repeat aapke paas nahi aata. Apni website hone se sara profit aapka hota hai aur customer direct UPI se 30 second me payment karta hai.',
          english: 'Stop losing 25% of your hard-earned margins to third-party marketplaces. Our custom D2C stores give you instant UPI payments, automated courier tracking, and complete customer ownership.',
          hook: 'Sir, currently monthly kitne orders aapke manual WhatsApp replies me delay hone ki wajah se drop ho jaate hain?'
        },
        flashcards: [
          { front: 'Why do Indian D2C brands prefer their own website over Amazon?', back: 'They save 20-30% marketplace commissions and own direct customer data for repeat marketing.' },
          { front: 'Which payment gateways are standardly integrated in India?', back: 'Razorpay, Cashfree, and PhonePe supporting instant UPI, Cards, NetBanking, and COD.' },
          { front: 'What is RTO in Indian e-commerce?', back: 'Return To Origin — when a Cash on Delivery (COD) package is rejected by the buyer, costing the seller courier charges.' },
          { front: 'What is the starting price for Vahlay’s D2C E-commerce package?', back: '₹35,000 for up to 50 products.' }
        ],
        quizQuestions: [
          {
            id: 'q-d3-1',
            type: 'single',
            question: 'Does Vahlay Digital charge a per-transaction commission on customer sales made on an e-commerce website?',
            options: [
              'Yes, 10% on every sale',
              'No, Vahlay Digital charges zero commission; payment gateway charges ~2% directly to the bank',
              'Yes, 25% like Amazon',
              'Only during Diwali'
            ],
            correctAnswer: 1,
            explanation: 'Vahlay Digital builds and delivers the website; we take 0% sales commission. Only standard payment gateway fees (~2%) apply.',
            category: 'pricing'
          }
        ],
        practicalRoleplayPrompt: 'A clothing boutique owner says "I already sell on Instagram DMs, why spend ₹35,000 on a website?" Respond with authority and empathy.',
        assignment: 'Calculate the monthly commission savings for a boutique doing ₹2,00,000 monthly sales on Amazon vs their own website.'
      },
      {
        id: 'day-4',
        dayNumber: 4,
        title: 'CRM Software: Stopping Lead Leakage & WhatsApp Automation',
        serviceCategory: 'Software Solutions',
        durationMinutes: 55,
        learningObjective: 'Master CRM value propositions: lead distribution, activity tracking, follow-up discipline, and WhatsApp triggers.',
        summary: 'How to diagnose lead leakage in real estate, immigration, and B2B trading firms where sales agents lose 40% of deals due to messy diaries and unrecorded calls.',
        fullContent: `
# CRM Sales Enablement Guide

## 1. The Core Pain Point: "Lead Leakage"
Most Indian businesses spend thousands of rupees on Facebook Ads, Google Ads, or Indiamart.
What happens next?
- Leads sit in an unread Google Sheet for 4 hours.
- Agents write numbers on scrap paper or personal diaries.
- When an agent leaves the company, **they take the client database with them**.
- Follow-ups are forgotten: 70% of sales require 4 to 6 follow-up touches, but agents give up after 1 call.

## 2. What Vahlay Sales Flow CRM Delivers
1. **Instant Lead Capture:** Leads from Website, Meta Ads, and Indiamart land in CRM within 5 seconds.
2. **Automated Distribution:** Round-robin lead assignment to active executives.
3. **Daily Follow-up Reminders:** Executives see exactly who to call today with previous call notes.
4. **Role-Based Security:** Sales agents see only their own assigned leads; managers see the full team performance.
5. **WhatsApp Integration:** 1-click pre-approved WhatsApp templates sent directly from the lead profile.

## 3. Approved Pricing:
- **Vahlay Sales Flow CRM (Up to 15 Users):** ₹45,000 (one-time setup, 18-25 working days).
        `,
        businessCaseExample: {
          client: 'Apex Immigration & Visa Consultants, Chandigarh',
          industry: 'Education & Visa Consultancy',
          problem: '6 telecallers managing 1,200 monthly leads in an Excel file; 40% of leads were called after 24 hours, causing high dropouts.',
          recommendedSolution: 'Vahlay Sales Flow CRM with Round-Robin allocation & WhatsApp notifications.',
          outcome: 'Lead response time dropped to 4 minutes; visa consultation walk-ins jumped by 55%.'
        },
        pitchScript: {
          hinglish: 'Sir, aap mahine me lakho rupaye ads me laga rahe hain, par agar aapke telecallers ne 2 ghante me lead ko contact nahi kiya toh customer competitor se consult kar leta hai. Hamara CRM lead aate hi executive ko assign karta hai aur unki conversation history maintain karta hai.',
          english: 'Stop pouring ad budget into a leaky sales bucket. Our custom CRM captures leads instantly, enforces daily follow-up discipline, and prevents your customer database from walking out the door.',
          hook: 'Sir, kya aapko har shaam pata chalta hai ki kis executive ne kitne follow-ups successfully connect kiye?'
        },
        flashcards: [
          { front: 'What is "Lead Leakage"?', back: 'Losing interested prospective customers due to slow initial contact, forgotten follow-ups, or unorganized spreadsheets.' },
          { front: 'Why is Excel risky for managing sales leads?', back: 'No automated reminders, no call timestamp tracking, high risk of data theft when employees leave.' },
          { front: 'What is the starting price for Vahlay Sales Flow CRM?', back: '₹45,000 for up to 15 users.' },
          { front: 'Can an agent see other agents’ private leads in Vahlay CRM?', back: 'No, role-based access restricts agents to their own assigned pipeline.' }
        ],
        quizQuestions: [
          {
            id: 'q-d4-1',
            type: 'single',
            question: 'A real estate broker has 8 sales executives who manage leads in their personal phone WhatsApp. What is the biggest business risk they face?',
            options: [
              'Their phone battery drains quickly',
              'If an executive resigns, they take the entire customer contact database and ongoing deals with them',
              'WhatsApp might change their font',
              'The broker will receive too many awards'
            ],
            correctAnswer: 1,
            explanation: 'Personal WhatsApp usage poses severe data theft and continuity risks. A centralized CRM keeps the data secure with the company.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Pitch Vahlay CRM to a skeptic business owner who insists "Mere paas Excel sheet hai, wahi kaafi hai."',
        assignment: 'Write down 3 diagnostic questions you would ask a real estate sales manager to identify their lead leakage points.'
      },
      {
        id: 'day-5',
        dayNumber: 5,
        title: 'ERP Software: Manufacturing, Inventory & Billing Integration',
        serviceCategory: 'Software Solutions',
        durationMinutes: 60,
        learningObjective: 'Understand how ERP connects inventory, manufacturing, procurement, and billing for factories and distributors.',
        summary: 'Learn the difference between Tally (accounting) and ERP (operational workflow management). Master how to qualify ERP leads and route them to Technical Delivery.',
        fullContent: `
# ERP Knowledge & Qualification

## 1. What is an ERP?
Enterprise Resource Planning is the backbone software for companies that manufacture, assemble, or distribute goods.
It bridges:
- **Raw Material Inventory**
- **Production / Job Works**
- **Finished Goods Warehouse**
- **Sales Orders & Dispatch**
- **GST Invoicing & Payments**

## 2. Why Tally is NOT an ERP
Clients will frequently say: *"Hum toh Tally use karte hain."*
- **The Answer:** Tally is an outstanding post-facto **accounting** and GST tax tool. But Tally does not stop a warehouse manager from dispatching goods without a manager approval signature, nor does it automatically track live raw material consumption on a factory production machine.
- An ERP provides **live operational process control**.

## 3. Mandatory Rule for Sales Agents
- **NEVER quote an instant price or 1-week timeline for an ERP.**
- Standard base package starts at ₹1,20,000 for 4 core modules (35-50 working days).
- **All ERP inquiries require a technical escalation ticket** and a joint scoping call with our Technical Delivery Lead.
        `,
        businessCaseExample: {
          client: 'Vanguard Auto Components, Pune',
          industry: 'Automobile Parts Manufacturing',
          problem: 'Stock in factory registers showed 4,000 brass bolts, but physical warehouse had only 1,200 due to unrecorded scrap loss.',
          recommendedSolution: 'Modular ERP with Raw Material & Production Batch Tracking.',
          outcome: 'Inventory variance reduced to under 1.5%; avoided production stoppage on critical OEM contracts.'
        },
        pitchScript: {
          hinglish: 'Sir, Tally billing ke liye theek hai, par agar warehouse me stock mismatch ho raha hai aur purchase department ko live pata nahi chal raha ki kaunsa raw material khatam hone wala hai, toh ERP aapke factory operations ko digitally sync kar deta hai.',
          english: 'Tally records what already happened; an ERP controls what is happening right now on your warehouse and shop floor. We build custom modular ERPs designed for Indian manufacturing workflows.',
          hook: 'Sir, kya aapke godown aur accounts ke stock registers me kabhi difference aata hai?'
        },
        flashcards: [
          { front: 'What is the main difference between Tally and an ERP?', back: 'Tally is for post-transaction accounting; ERP is for live operational control of inventory, manufacturing, and orders.' },
          { front: 'What is the mandatory sales agent rule when dealing with ERP inquiries?', back: 'Never quote fixed custom prices or short timelines without a technical scoping call with the Technical Delivery Lead.' },
          { front: 'What is the approved starting price for Vahlay Modular ERP (4 core modules)?', back: '₹1,20,000 (35 to 50 working days).' }
        ],
        quizQuestions: [
          {
            id: 'q-d5-1',
            type: 'single',
            question: 'Can a sales agent promise an ERP deployment within 7 working days?',
            options: [
              'Yes, if the client offers a bonus',
              'No, ERP requires database design, workflow testing, and minimum 35 to 50 working days',
              'Yes, by using AI',
              'Only for small companies'
            ],
            correctAnswer: 1,
            explanation: 'ERP systems require deep process integration and User Acceptance Testing. Promising 7 days is a severe compliance violation.',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'Handle the customer objection: "Humara Tally me sab chal raha hai, hume ERP ki kya zaroorat hai?"',
        assignment: 'Fill out a mock Technical Escalation ticket for a manufacturing client requesting multi-warehouse ERP.'
      },
      {
        id: 'day-6',
        dayNumber: 6,
        title: 'Search Engine Optimization (SEO): Organic Ranking Without False Guarantees',
        serviceCategory: 'Digital Marketing',
        durationMinutes: 50,
        learningObjective: 'Master SEO fundamentals, keyword research, on-page optimization, and strict compliance against false ranking guarantees.',
        summary: 'How to pitch SEO as a long-term compounding digital asset vs temporary paid ads. Understand why promising "#1 rank in 15 days" is strictly prohibited.',
        fullContent: `
# SEO Sales Enablement & Compliance

## 1. What is SEO?
Search Engine Optimization is the technical and content strategy that allows a business website to rank organically on Google when buyers search for commercial keywords (e.g., *"Best dental implant clinic in South Delhi"*).

## 2. SEO vs Paid Ads
- **Paid Ads (Google Ads):** Instant traffic, but you pay ₹30 to ₹250 for every single click. The moment ad budget finishes, calls stop.
- **Organic SEO:** Takes 60 to 90 days to gain traction, but delivers free, high-intent inquiries 24 hours a day for months and years.

## 3. Strict Compliance Warning: No "#1 Rank Guarantees"
- Google’s algorithm has over 200 ranking factors and updates regularly.
- **NEVER say:** *"Main aapko 15 din me Google par #1 rank ki guarantee deta hoon."*
- **APPROVED PITCH:** *"Sir, hum 90 days ka structured white-hat optimization karte hain with target commercial keywords, regular blogs, and high-authority backlinks to achieve measurable first-page Google visibility."*

## 4. Approved Pricing:
- **Growth Organic SEO (15 Focus Keywords):** ₹18,000/month (minimum 3-month retainer).
        `,
        businessCaseExample: {
          client: 'Dr. Neha Cosmetic Clinic, Mumbai',
          industry: 'Cosmetic Dermatology',
          problem: 'Spending ₹60,000 every month on Google Search ads with escalating cost-per-click.',
          recommendedSolution: '6-Month White-Hat SEO Retainer on 15 high-ticket treatment keywords.',
          outcome: 'Achieved top 3 Google ranking for 9 key terms; reduced monthly ad spend by 50% while maintaining lead volume.'
        },
        pitchScript: {
          hinglish: 'Sir, Google Ads par aap jab tak paise dalenge tab tak call aayegi. SEO se aapki website Google ke first page par permanently rank hoti hai jisse aapko mahino tak free aur genuine customer calls aati hain.',
          english: 'Paid ads rent traffic; SEO owns it. We optimize your website architecture, content, and backlinks so high-intent buyers find your clinic or company organically without paying per click.',
          hook: 'Sir, jab aapke city me koi customer aapki service search karta hai, toh competitor first page par kyun dikh raha hai?'
        },
        flashcards: [
          { front: 'Why are guaranteed #1 Google rankings prohibited at Vahlay?', back: 'Google explicitly states no agency can guarantee #1 rank. Claiming it is false advertising and violates company compliance.' },
          { front: 'How long does organic SEO typically take to show noticeable lead generation results?', back: '60 to 90 days of consistent on-page optimization, content publishing, and backlink authority building.' },
          { front: 'What is the approved price for Vahlay’s Growth Organic SEO package?', back: '₹18,000 per month (15 keywords).' }
        ],
        quizQuestions: [
          {
            id: 'q-d6-1',
            type: 'single',
            question: 'An agent tells a prospect: "Sir, pay ₹18,000 and I guarantee you will be #1 on Google in 10 days." What is the status of this pitch?',
            options: [
              'Outstanding aggressive sales technique',
              'Compliant if the client is small',
              'Severe compliance violation: Vahlay strictly prohibits false #1 ranking guarantees',
              'Approved by Google'
            ],
            correctAnswer: 2,
            explanation: 'Vahlay policy strictly forbids false ranking guarantees. Agents must set honest expectations (60-90 days).',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'Handle a client who says "Agencies in Delhi promised me #1 rank in 10 days for ₹5,000. Why are you charging ₹18,000 and not guaranteeing #1?"',
        assignment: 'Write a 1-paragraph explanation of White-Hat SEO vs Black-Hat SEO that an agent can explain to a customer.'
      },
      {
        id: 'day-7',
        dayNumber: 7,
        title: 'Google Business Profile (GMB/GBP): Dominating Local Maps 3-Pack',
        serviceCategory: 'Digital Marketing',
        durationMinutes: 45,
        learningObjective: 'Master local SEO, Google Maps 3-Pack rankings, review acceleration workflows, and local citation building.',
        summary: 'The highest converting service for local clinics, salons, tattoo studios, and retailers. Learn how to audit a prospect’s Google profile in 2 minutes.',
        fullContent: `
# Google Business Profile Mastery

## 1. Why GMB is Pure Gold for Local Businesses
When someone opens Google on their mobile and types *"tattoo studio near me"* or *"dentist in Malviya Nagar"*, Google displays the **Google Maps 3-Pack** right at the top.
- 70% of mobile users click directly on the "Call" or "Directions" button from Maps without ever opening a website!
- If your client is not in the top 3 spots, they lose local footfall every single day.

## 2. Key Levers of GBP Optimization
1. **Primary & Secondary Category Precision:** Mismatched categories destroy rank.
2. **Local NAP Citations:** Consistent Name, Address, and Phone across 40+ Indian local directories (Justdial, Sulekha, IndiaMart, Bing, Apple Maps).
3. **Geotagged Weekly Photos:** Proving physical location activity to Google’s AI.
4. **Authentic Review Generation:** Smart QR standees for genuine 5-star customer feedback.
5. **No Fake Reviews:** Selling fake reviews triggers immediate Google listing suspension.

## 3. Approved Pricing:
- **Local Maps Dominance Package:** ₹9,500/month.
        `,
        businessCaseExample: {
          client: 'Ink Masters Tattoo Studio, Indiranagar, Bangalore',
          industry: 'Tattoo & Body Art',
          problem: 'Ranked at spot #14 on Google Maps; getting only 2-3 walk-ins a week despite prime high-street location.',
          recommendedSolution: 'GMB Local Dominance Retainer with Category realignment & Geotagged portfolio posts.',
          outcome: 'Moved into the top 3 Google Maps rank within 45 days; direct incoming phone calls jumped from 12 to 84 per month.'
        },
        pitchScript: {
          hinglish: 'Sir, jab bhi koi customer aapke area me service dhoondhta hai, Google Maps par top 3 me jo naam dikhta hai, usi ko 70% direct phone calls jaate hain. Hum aapka profile top 3 me rank karate hain taaki aapke competitor ke bajay customer aapse direct connect kare.',
          english: 'Local searches drive immediate buying decisions. The top 3 listings on Google Maps capture the vast majority of local calls and visits. We optimize your citations, categories, and reviews to dominate your local radius.',
          hook: 'Sir, kya aapne check kiya hai ki aapke area me aapki profile Google Maps par kaunse number par aati hai?'
        },
        flashcards: [
          { front: 'What is the Google Maps "3-Pack"?', back: 'The top 3 local business listings displayed prominently by Google for local "near me" searches.' },
          { front: 'Why are fake reviews forbidden at Vahlay Digital?', back: 'Google’s spam filters detect fake review rings, resulting in permanent profile suspension and loss of client business.' },
          { front: 'What is the approved price for Vahlay’s GMB Optimization package?', back: '₹9,500 per month.' }
        ],
        quizQuestions: [
          {
            id: 'q-d7-1',
            type: 'single',
            question: 'A client asks: "Can you provide 50 fake 5-star reviews to boost my Google Maps ranking quickly?" How should the agent respond?',
            options: [
              'Yes, we can buy them from Telegram groups',
              'No, Vahlay Digital never provides fake reviews as it violates Google policy and causes permanent listing suspension. We set up systems to collect genuine client reviews.',
              'Only if you pay in cash',
              'Yes, but only 20 reviews'
            ],
            correctAnswer: 1,
            explanation: 'Fake reviews violate Google policies and company ethics. We focus on legitimate citation and review collection systems.',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'Conduct a 2-minute live phone audit of a local clinic’s Google Maps presence and transition into the ₹9,500/mo package pitch.',
        assignment: 'Check 3 local businesses in your city on Google Maps and list 3 visible optimization mistakes on their profiles.'
      },
      {
        id: 'day-8',
        dayNumber: 8,
        title: 'Social Media Marketing: Brand Authority & Content Strategy',
        serviceCategory: 'Content & Creative',
        durationMinutes: 45,
        learningObjective: 'Understand how social media builds brand credibility, how to set expectations for organic vs paid reach, and how to pitch monthly graphic retainers.',
        summary: 'Learn why dead social media profiles kill trust, how cohesive visual branding establishes premium pricing, and how our 16-creative monthly plan works.',
        fullContent: `
# Social Media Marketing Enablement

## 1. Social Media as Modern Credibility
When an affluent Indian customer hears about an interior designer, clinic, or luxury brand, their first instinct is to open Instagram.
- If the last post was 6 months ago, or photos are blurry mobile screenshots with distorted fonts, **trust evaporates**.
- A polished, active Instagram profile validates that the business is thriving and modern.

## 2. Organic Reach Reality Check
- Static graphic posts alone do NOT bring viral customer surges.
- Social media graphics provide **Brand Trust, Social Proof, and Retention**.
- For immediate customer acquisition, pair Social Media with **Paid Ads** or **Reels**.

## 3. Approved Package:
- **Brand Growth Monthly Plan (16 Creatives):** ₹15,000/month.
  - 12 Branded Carousel / Static Creatives
  - 4 Motion Story Creatives
  - Captions + Hashtags + Bio Optimization
        `,
        businessCaseExample: {
          client: 'The Luxe Living Interior Studio, Gurgaon',
          industry: 'Interior Design',
          problem: 'Clients negotiating heavily on price because existing Instagram page looked like an amateur contractor.',
          recommendedSolution: '16-Creative Monthly Brand Identity Retainer showcasing luxury 3D renders and aesthetic color palettes.',
          outcome: 'Average interior project ticket size increased by 35% as clients perceived the firm as a luxury studio.'
        },
        pitchScript: {
          hinglish: 'Sir, aaj ke time me aapka Instagram page aapke business ka digital showroom hai. Agar showroom clean aur premium dikhega, toh customer high-ticket price pay karne me hesitate nahi karta. Hum aapka page ek well-established brand jaisa design karke dete hain.',
          english: 'Your social profile is your modern credential. We build cohesive, high-aesthetic creatives that position your company as the premier choice in your market, justifying premium pricing.',
          hook: 'Sir, kya aapka current social media page aapke real business ki quality ko accurately reflect karta hai?'
        },
        flashcards: [
          { front: 'What is the primary business benefit of social media marketing for local services?', back: 'Establishing brand credibility, premium perception, and social proof that supports closing high-ticket deals.' },
          { front: 'How many creatives are included in the Brand Growth monthly plan?', back: '16 Creatives (12 static/carousel posts + 4 animated motion story creatives).' },
          { front: 'What is the approved price for the 16-creative social media package?', back: '₹15,000 per month.' }
        ],
        quizQuestions: [
          {
            id: 'q-d8-1',
            type: 'single',
            question: 'Should a sales agent promise 50,000 viral views from 1 static social media image post without ad budget?',
            options: [
              'Yes, our graphic designers make magical images',
              'No, organic reach on static images is modest; viral reach requires Reels or paid advertising budget',
              'Only on Instagram verified accounts',
              'Yes, if posted at midnight'
            ],
            correctAnswer: 1,
            explanation: 'Honest expectation setting is vital. Static graphics establish brand credibility; virality comes from short-form video or paid ads.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Pitch the ₹15,000 monthly social media package to an interior designer whose Instagram page has not been updated since 4 months.',
        assignment: 'Write down a 1-week sample content theme (5 post ideas) for a cosmetic dental clinic.'
      },
      {
        id: 'day-9',
        dayNumber: 9,
        title: 'Reels Production & Editing: The Short-Form Video Engine',
        serviceCategory: 'Content & Creative',
        durationMinutes: 55,
        learningObjective: 'Master the mechanics of viral video production: on-site shoot logistics, 4K camera equipment, dynamic Hormozi-style subtitle editing, and package bundling.',
        summary: 'Learn why short-form video is the #1 organic growth channel for Indian clinics, salons, and studios, and how to pitch our Half-Day Shoot + Editing bundle.',
        fullContent: `
# Reels Shooting & Post-Production

## 1. Why Short-Form Video Dominates India
India has over 400 million active short-form video viewers. Instagram and YouTube algorithms prioritize Reels over all other content types.
- A single well-hooked transformation reel can generate 50,000+ local views for a salon or clinic for free.
- But shaky mobile videos with tinny audio look amateur and hurt brand prestige.

## 2. Our Two Video Offerings
### A. On-Site Reels Shooting (Half-Day Production): ₹18,000/project
- Videographer with 4K Cinema Camera + Gimbal
- Studio Lighting + Wireless Lapel Microphones
- Pre-scripted concepts & founder coaching on camera
- Captures raw footage for 10-12 reels in 4 hours on location

### B. High-Retention Reels Editing (12 Videos Pack): ₹12,000/project
- Dynamic Hormozi-style animated subtitles
- Sound design & SFX (whooshes, pops, bells)
- Zoom-cuts and retention pacing
- Color grading and trending audio sync

### The Combo Winner:
- Shoot + Edit Bundle: ₹28,000 (saves ₹2,000 with manager approval).
        `,
        businessCaseExample: {
          client: 'Alien Art Tattoo Studio, Mumbai',
          industry: 'Tattoo & Body Art',
          problem: 'Artist was posting raw 3-minute boring unedited phone clips getting 300 views.',
          recommendedSolution: '1 Half-Day Production Shoot + 12 High-Retention Dynamic Reel Edits.',
          outcome: 'Two reels crossed 85,000 local views; studio received 42 WhatsApp booking inquiries in 3 weeks.'
        },
        pitchScript: {
          hinglish: 'Sir, phone se shoot karne me sound me echo aata hai aur lighting dull rehti hai. Hamari cinema crew camera aur studio lights lekar aati hai aur 4 ghante me aapke 10-12 viral reels shoot kar leti hai. Phir hamare editors dynamic subtitles aur sound effects add karke ready-to-post deliver karte hain.',
          english: 'Stop posting dull mobile clips that get skipped in 2 seconds. Our production team brings cinema 4K cameras and studio lighting to your clinic or salon, capturing an entire month of viral short-form video in half a day.',
          hook: 'Sir, kya aapne notice kiya hai ki aapke competitors ke reels par thousands of views kaise aa rahe hain?'
        },
        flashcards: [
          { front: 'What equipment does Vahlay’s videographer bring for on-site reels shooting?', back: '4K cinema camera, gimbal stabilizer, wireless lapel microphones, and portable studio lighting.' },
          { front: 'What is the approved price for a Half-Day On-Site Production shoot?', back: '₹18,000 (captures raw footage for 10-12 reels).' },
          { front: 'What is the approved price for the 12-Reel High-Retention Editing pack?', back: '₹12,000 (Hormozi subtitles, sound design, color grading).' }
        ],
        quizQuestions: [
          {
            id: 'q-d9-1',
            type: 'single',
            question: 'Why are dynamic subtitles essential on short-form social media videos in India?',
            options: [
              'Because Instagram requires them by law',
              'Because over 80% of users watch social videos on mute or in public spaces; subtitles retain their attention',
              'They make the file size smaller',
              'Only doctors need subtitles'
            ],
            correctAnswer: 1,
            explanation: 'Most social media browsing occurs with audio muted. Engaging subtitles ensure the message is absorbed.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Overcome the objection: "Humara staff phone se hi reel bana leta hai, ₹18,000 kyun kharch karein?"',
        assignment: 'Outline a 3-part script (Hook, Meat, Call to Action) for a 30-second dental whitening reel.'
      },
      {
        id: 'day-10',
        dayNumber: 10,
        title: 'Pricing Discipline, Rate Charts & Mandatory Approval Workflow',
        serviceCategory: 'Pricing & Compliance',
        durationMinutes: 50,
        learningObjective: 'Master the approved company rate chart, payment milestone standards, quotation approval workflows, and zero-tolerance policy on unapproved discounts.',
        summary: 'Learn why unapproved pricing breaks delivery margins and client trust. Understand the pricing workflow: Draft -> Submitted -> Approved -> Published.',
        fullContent: `
# Pricing Discipline & Financial Integrity

## 1. Why Strict Pricing Matters
Every service at Vahlay Digital is budgeted with real developer, designer, and project manager hours.
- If an agent quotes an unapproved price (e.g., promising a dynamic site for ₹8,000), **the company makes a loss and the delivery team cannot maintain quality**.
- A confident salesperson sells **value and ROI**, not desperate discounts.

## 2. Standard Pricing Summary (Memorize These)
- **Static Website (5 Pages):** ₹12,000
- **Dynamic CMS Website:** ₹28,000
- **D2C E-commerce Website:** ₹35,000
- **Sales Flow CRM (15 Users):** ₹45,000
- **Modular ERP (4 Core Modules):** ₹1,20,000
- **Growth SEO Retainer:** ₹18,000/month
- **Google Business Profile (GMB):** ₹9,500/month
- **Social Media Marketing (16 Creatives):** ₹15,000/month
- **Paid Ads Performance Retainer:** ₹18,000/month
- **Reels On-Site Half-Day Shoot:** ₹18,000/project
- **Reels Editing (12 Videos):** ₹12,000/project
- **Website Maintenance AMC:** ₹4,500/month

## 3. The Approval Workflow
- **Discounts up to 10%:** Requires Sales Manager approval in the system.
- **Discounts > 10% or Custom Scope:** Requires Super Admin / Technical Lead signoff.
- **Unapproved proposals can NEVER be sent to customers.**
        `,
        businessCaseExample: {
          client: 'Policy Case Study: The Discount Trap',
          industry: 'Internal Discipline',
          problem: 'An agent gave a 40% verbal discount to close a deal quickly without manager approval.',
          recommendedSolution: 'Manager caught the discrepancy; the proposal was revised with adjusted scope matching approved rate cards.',
          outcome: 'Protected company margins and prevented client disputes over excluded features.'
        },
        pitchScript: {
          hinglish: 'Sir, hamare prices completely transparent aur fixed hain kyunki hum dedicated senior developers aur certified marketers assign karte hain jo time par delivery ensure karte hain. Hum quality me compromise nahi karte.',
          english: 'Our pricing is structured and transparent. Every rupee in our quotation corresponds to verified scope, dedicated developers, and high delivery standards without hidden costs.',
          hook: 'Sir, kya aap chahte hain ki project smoothly aur bina delay ke deliver ho?'
        },
        flashcards: [
          { front: 'What is the approved starting price for a 5-page static website?', back: '₹12,000.' },
          { front: 'What is the approved starting price for a dynamic CMS website?', back: '₹28,000.' },
          { front: 'What is the approved starting price for Vahlay Sales Flow CRM?', back: '₹45,000.' },
          { front: 'Can an agent send an unapproved discounted proposal directly to a customer?', back: 'Strictly No. Any custom rate or discount requires manager approval in the system.' }
        ],
        quizQuestions: [
          {
            id: 'q-d10-1',
            type: 'single',
            question: 'A prospect asks for a 20% discount on the ₹28,000 Dynamic Website package. What must the agent do?',
            options: [
              'Immediately agree on the phone to lock the deal',
              'Tell the prospect that Vahlay Digital never discounts, hang up the phone',
              'Explain the value, draft a proposal in the system, and submit a discount approval request to the Sales Manager before making any commitment',
              'Cut features secretly without telling the client'
            ],
            correctAnswer: 2,
            explanation: 'Discounts exceeding standard margins require formal manager approval in the system before client presentation.',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'A client demands: "Sir ₹20,000 me kar do na CRM, baaki market me toh 15,000 me mil raha hai." Defend the ₹45,000 price with confidence.',
        assignment: 'Memorize all 13 starting service prices and write them down on paper from memory.'
      },
      {
        id: 'day-11',
        dayNumber: 11,
        title: 'Customer Objection Handling: The Indian B2B Playbook',
        serviceCategory: 'Objection Handling',
        durationMinutes: 60,
        learningObjective: 'Master the top 10 most common Indian customer objections: "Price is too high", "Another agency is cheaper", "Call me next month", and "I already have a website".',
        summary: 'Learn the 4-step objection framework: Acknowledge -> Reframe -> Discover -> Hook. Practice overcoming resistance without arguing with the prospect.',
        fullContent: `
# Objection Handling Mastery

## 1. The 4-Step Objection Framework
When a customer raises an objection, **NEVER argue or defend defensively**.
1. **Acknowledge:** *"Bilkul samajh sakta hoon Sir, budget hamesha important factor hota hai."*
2. **Reframe:** Shift focus from expense to revenue growth or cost of inaction.
3. **Discover:** Ask an open diagnostic question to uncover the real reason.
4. **Hook:** Offer a low-friction proof point (demo, audit, or reference).

## 2. Top 3 Master Responses
### Objection 1: "Aapka price market se mehenga hai."
- **Response:** *"Sir, market me bohot log free template me logo daal kar de dete hain, par jab client call kare aur page na khule ya hack ho jaye toh poori lead waste ho jati hai. Hum conversion-engineered website banate hain jo high-speed aur secure ho. Cheap website expensive tab banti hai jab wo ek bhi customer nahi laati."*

### Objection 2: "Call me next month / Abhi budget nahi hai."
- **Response:** *"Samajh sakta hoon Sir. Par har mahine jo 50-60 customers Google par aapki locality me service dhoondh rahe hain, wo competitor ke paas ja rahe hain. Agar hum abhi start karein toh next month tak aapka system ready ho jayega jab season peak par hoga."*

### Objection 3: "Dusri company 5,000 me kar rahi hai."
- **Response:** *"Sir, auto-rickshaw aur car dono travel karati hain, par reliability me farak hota hai. 5,000 me log 10 din baad phone uthana band kar dete hain. Vahlay Digital corporate agreement aur dedicated support ke sath kaam karta hai."*
        `,
        businessCaseExample: {
          client: 'Mastering the Price Objection',
          industry: 'Sales Psychology',
          problem: 'Prospect said "₹18,000 per month for SEO is too expensive for my clinic".',
          recommendedSolution: 'Agent calculated: 1 dental implant case brings ₹35,000 profit. Ranking brings 3-5 implant cases monthly.',
          outcome: 'Prospect realized the ROI justified the expense and signed a 6-month retainer.'
        },
        pitchScript: {
          hinglish: 'Sir, market me 3,000 me bhi log bolte hain kar denge, par baad me domain apne naam par rakh lete hain ya phone switch off kar dete hain. Vahlay Digital me complete registered agreement, GST billing aur dedicated team milti hai.',
          english: 'A cheap website becomes the most expensive mistake when it fails to convert visitors. We build high-performing digital assets backed by corporate service level agreements.',
          hook: 'Sir, kya aap ek reliable team ke sath kaam karna chahenge jo time par deliver kare?'
        },
        flashcards: [
          { front: 'What are the 4 steps of Vahlay’s objection handling framework?', back: '1. Acknowledge, 2. Reframe, 3. Discover, 4. Hook.' },
          { front: 'How should you respond when a client says "Another freelancer is offering this for ₹3,000"?', back: 'Differentiate between cheap clone templates with zero support vs conversion-engineered assets with corporate SLAs and direct WhatsApp integrations.' },
          { front: 'What should you never do when a customer raises an objection?', back: 'Never argue, get defensive, or agree that Vahlay’s services are overpriced.' }
        ],
        quizQuestions: [
          {
            id: 'q-d11-1',
            type: 'single',
            question: 'When a prospect says "I need to ask my partner and will let you know", what is the most effective next step?',
            options: [
              'Say "Okay bye" and delete the lead',
              'Acknowledge the partner’s role, summarize the key ROI points, and offer a short joint 10-minute demo call with both partners together',
              'Tell them their partner will probably say no',
              'Call them every 15 minutes until they answer'
            ],
            correctAnswer: 1,
            explanation: 'Involving both decision-makers directly in a short, focused presentation prevents distorted communication.',
            category: 'objection'
          }
        ],
        practicalRoleplayPrompt: 'Roleplay with an angry, skeptical prospect who complains: "Digital marketing agencies are all frauds who take money and disappear." Win back their trust.',
        assignment: 'Write down responses to 5 objections from the Objection Handling Library in your own voice.'
      },
      {
        id: 'day-12',
        dayNumber: 12,
        title: 'Sales Discipline, Lead Pipeline & Mini CRM Data Entry',
        serviceCategory: 'Sales Operations',
        durationMinutes: 45,
        learningObjective: 'Master CRM hygiene: status progression (New -> Contacted -> Qualified -> Proposal Sent -> Won), follow-up notes, and call logging discipline.',
        summary: 'Learn why unlogged leads are dead leads and how consistent follow-up, accurate notes, and CRM hygiene improve conversions.',
        fullContent: `
# CRM Discipline & Pipeline Management

## 1. Why CRM Hygiene Decides Your Commissions
A sales agent who leaves empty notes and misses follow-ups will lose context and opportunities.
- Detailed call notes allow you to remember personal details: *"Client's son is opening a new clinic in November; prefer WhatsApp contact at 4 PM."*
- When you call them back, they feel valued and respected.

## 2. Lead Status Standards
1. **New:** Fresh lead, not yet contacted.
2. **Contacted:** Call attempted or spoken with secretary; decision-maker pending.
3. **Interested:** Spoken with decision-maker; expressed requirement.
4. **Qualified:** Budget, timeline, and decision authority verified.
5. **Demo Scheduled:** Meeting / screen share demo booked on calendar.
6. **Proposal Sent:** Approved proposal delivered; awaiting review.
7. **Negotiation:** Minor scope/pricing discussions underway.
8. **Won:** Advance received, project handed to Delivery!
9. **Lost:** Closed lost with clear mandatory reason recorded.

## 3. Follow-up and Data Entry Standards
- Log each meaningful client conversation with clear notes and the next action.
- Schedule follow-ups for the date and time agreed with the client.
- Keep lead status and quotation details current so the team can coordinate accurately.
        `,
        businessCaseExample: {
          client: 'The 3-Touch Follow-Up Victory',
          industry: 'Sales Discipline',
          problem: 'Prospect did not pick up on first two follow-up attempts after receiving proposal.',
          recommendedSolution: 'Agent maintained CRM discipline, logged attempts, and sent a polite value-add message with a recent case study.',
          outcome: 'Client called back on Day 4, apologized for being busy with travel, and released the ₹35,000 advance payment.'
        },
        pitchScript: {
          hinglish: 'Sir, maine CRM me hamari previous conversation ke according aapke liye tailored proposal prepare kiya hai. Kya aapke paas 5 minute hain jisme main scope of work walkthrough kar doon?',
          english: 'Good afternoon Sir. Following our discussion on Tuesday, I have prepared your tailored project proposal. I can walk you through the key deliverables in under 5 minutes.',
          hook: 'Sir, kya proposal review karne ke liye abhi convenient time hai?'
        },
        flashcards: [
          { front: 'What should an agent do after a meaningful client conversation?', back: 'Log clear notes, update the lead stage, and schedule the agreed next follow-up in the CRM.' },
          { front: 'Why must detailed notes be logged immediately after every call?', back: 'To maintain context, track specific client requirements, and ensure seamless follow-up execution.' },
          { front: 'What must be recorded when a lead is marked as "Lost"?', back: 'A mandatory reason (e.g., budget mismatch, competitor chosen, no requirement, invalid number).' }
        ],
        quizQuestions: [
          {
            id: 'q-d12-1',
            type: 'single',
            question: 'After an agent speaks to a qualified prospect who asks to be called on Friday at 4 PM, what must the agent do in the CRM?',
            options: [
              'Remember it in their head',
              'Update lead status to "Qualified", write detailed call notes, and schedule a Next Follow-Up reminder for Friday at 4 PM',
              'Mark the lead as Won immediately',
              'Delete the lead to keep the CRM clean'
            ],
            correctAnswer: 1,
            explanation: 'Proper CRM hygiene requires updating status, entering detailed discussion notes, and setting a calendar follow-up reminder.',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'Practice writing a concise, professional CRM note for a 5-minute call with an interested salon owner.',
        assignment: 'Log 5 mock lead entries in the Vahlay Mini CRM system with realistic client notes and follow-up dates.'
      },
      {
        id: 'day-13',
        dayNumber: 13,
        title: 'Proposal & Quotation Building: Structure, Payment Terms & PDF Generation',
        serviceCategory: 'Sales Operations',
        durationMinutes: 50,
        learningObjective: 'Master how to assemble winning commercial proposals with clear scopes of work, milestones (e.g., 50-50 or 40-40-20), and professional terms.',
        summary: 'Learn how to generate a branded Vahlay Digital quotation, avoid scope creep, and present proposals so clients feel excited rather than intimidated by the price.',
        fullContent: `
# Proposal Crafting & Delivery

## 1. Anatomy of a Vahlay Commercial Proposal
A winning proposal is not an invoice; it is a **confidence document**.
It contains:
1. **Executive Summary:** Demonstrating we understand their specific business goal.
2. **Approved Scope of Work:** Bulleted deliverables (e.g., 5 Pages, WhatsApp button, SSL).
3. **Explicit Exclusions:** What is NOT included (prevents client disputes later).
4. **Project Timeline:** Realistic business days for milestones.
5. **Commercials & Tax:** Subtotal, applicable GST, and payment milestones.
6. **Payment Milestones:** Standard 50% advance / 50% approval, or 40-40-20 for software.
7. **Validity Period:** Proposals are valid for 15 days (creates urgency).

## 2. Walking Through the Proposal Live
- **Never just email a PDF and hope they pay.**
- Always book a 10-minute screen share or phone call: *"Sir, proposal aapke WhatsApp par aa gayi hai. Main 3 minute me important points highlight kar deta hoon."*
        `,
        businessCaseExample: {
          client: 'Preventing Scope Creep with Clear Proposals',
          industry: 'Commercial Contracts',
          problem: 'A client demanded a free mobile app after signing a dynamic website proposal.',
          recommendedSolution: 'The proposal clearly listed "Mobile Responsive Web Application" under Scope and "Native iOS/Android App Store release" under Exclusions.',
          outcome: 'Dispute avoided; client happily paid an additional ₹60,000 for the mobile app add-on.'
        },
        pitchScript: {
          hinglish: 'Sir, maine proposal aapke WhatsApp aur email par bhej di hai. Isme complete scope of work aur delivery milestones clearly mentioned hain. Chaliye ek baar sath me review kar lete hain taaki sab clear rahe.',
          english: 'I have shared our official proposal with your team. It details every deliverable, timeline milestone, and technical inclusion. Let us take 3 minutes to review the key points together.',
          hook: 'Sir, page 2 par deliverables check karein — kya ye aapke requirement ko perfectly match karta hai?'
        },
        flashcards: [
          { front: 'Why must a proposal include explicit exclusions?', back: 'To protect the company against scope creep and set clear boundaries on what is and is not included.' },
          { front: 'What is the standard payment milestone for web development packages?', back: '50% advance on project kickoff, 50% upon demo approval before live deployment.' },
          { front: 'How long is an official Vahlay Digital proposal valid?', back: '15 calendar days from the date of issuance.' }
        ],
        quizQuestions: [
          {
            id: 'q-d13-1',
            type: 'single',
            question: 'After generating a proposal PDF for a qualified prospect, what is the best practice for presenting it?',
            options: [
              'Send the PDF on email without message and wait 2 weeks',
              'Send the proposal on WhatsApp/Email and immediately schedule a quick call to walk the client through the scope and answer questions',
              'Ask for payment before showing the proposal',
              'Post the proposal on social media'
            ],
            correctAnswer: 1,
            explanation: 'Walking the client through the proposal personally addresses questions immediately and dramatically increases close rates.',
            category: 'sales_discipline'
          }
        ],
        practicalRoleplayPrompt: 'Walk through a ₹28,000 Dynamic Website proposal with a prospect who is looking at page 2 on their phone.',
        assignment: 'Generate a mock proposal using the Proposal Builder for a dental clinic and export the final printable document.'
      },
      {
        id: 'day-14',
        dayNumber: 14,
        title: 'Full Interactive Mock Sales Calls & Calling Readiness Drill',
        serviceCategory: 'Roleplay & Assessment',
        durationMinutes: 60,
        learningObjective: 'Simulate complete end-to-end sales calls across various industries and difficulty levels using the AI Mock Customer Simulator.',
        summary: 'Put all 13 days of knowledge into action. Practice handling angry, price-sensitive, confused, and skeptical Indian business owners. Aim for an 80+ readiness score.',
        fullContent: `
# Full Mock Call Simulation Drill

## 1. What You Are Being Scored On (100 Marks Total)
1. **Opening Introduction (10 Marks):** Clear company name, professional tone, permission to speak.
2. **Product Knowledge (25 Marks):** Accurate explanation of service without false promises.
3. **Requirement Discovery (20 Marks):** Asking smart diagnostic questions about the client's current business.
4. **Pricing Accuracy (20 Marks):** Quoting approved rate charts and respecting approval workflows.
5. **Objection Handling (15 Marks):** Calm, structured response using the 4-step framework.
6. **Closing, Next Steps & CRM (10 Marks):** Securing next meeting, demo, or proposal review date.

## 2. Common Fresher Traps to Avoid
- *Trap 1: Talking too fast without pausing for customer response.*
- *Trap 2: Saying "Yes to everything" without checking feasibility.*
- *Trap 3: Quoting random discounts when the customer hesitates.*
- *Trap 4: Forgetting to agree on an exact time for the next follow-up call.*
        `,
        businessCaseExample: {
          client: 'From 62/100 to 92/100: An Agent Turnaround',
          industry: 'Coaching Case Study',
          problem: 'Fresher agent Rohan was scoring 62/100 due to guessing prices and pitching features before asking discovery questions.',
          recommendedSolution: 'Completed 5 rounds of the AI Mock Call Simulator with strict focus on requirement discovery.',
          outcome: 'Readiness score improved to 92/100; closed his first ₹35,000 e-commerce deal on Day 16.'
        },
        pitchScript: {
          hinglish: 'Namaste Sir, main Vahlay Digital se baat kar raha hoon. Maine notice kiya ki aapka business local market me kafi popular hai, par online Google par aapki presence competitor se peeche hai. Kya main 2 minute me share kar sakta hoon ki kaise aap direct customer inquiries double kar sakte hain?',
          english: 'Good afternoon Sir. I noticed your company has built a strong reputation offline, but your digital footprint on Google is being outranked by competitors. May I share two quick adjustments to help you capture those ready-to-buy customers?',
          hook: 'Sir, kya agle 2 minute me hum ek quick comparison review kar sakte hain?'
        },
        flashcards: [
          { front: 'What is the minimum benchmark score required to pass mock call readiness?', back: '80 marks out of 100.' },
          { front: 'Which category carries the highest weight in mock call evaluation?', back: 'Product Knowledge (25 marks) followed by Requirement Discovery (20 marks) and Pricing Accuracy (20 marks).' },
          { front: 'What must always be agreed upon before ending a successful sales call?', back: 'A clear, specific next step (date, time, and agenda for demo or proposal review).' }
        ],
        quizQuestions: [
          {
            id: 'q-d14-1',
            type: 'single',
            question: 'During a live mock call, the customer asks: "Will this website integrate with my custom 15-year-old accounting software?" What is the correct response?',
            options: [
              'Say "Yes 100% guaranteed" to keep them interested',
              'Say "Sir, our team can integrate with standard APIs, but for legacy custom software, I will document your exact software version and have our Technical Delivery Lead verify compatibility before we commit"',
              'Tell them their software is garbage',
              'Hang up the call'
            ],
            correctAnswer: 1,
            explanation: 'Accurate qualification and technical integrity protect both the client and delivery team.',
            category: 'product_knowledge'
          }
        ],
        practicalRoleplayPrompt: 'Complete a full 10-turn AI Mock Call session in the simulator with a Price-Sensitive Salon Owner scenario and achieve a score of 80+.',
        assignment: 'Review your AI Mock Call feedback report, identify your two lowest-scoring dimensions, and write an improvement action plan.'
      },
      {
        id: 'day-15',
        dayNumber: 15,
        title: 'Final Comprehensive Examination & Vahlay Sales Certification',
        serviceCategory: 'Assessment & Certification',
        durationMinutes: 60,
        learningObjective: 'Complete the comprehensive 20-question final assessment, achieve the 80% readiness benchmark, and earn your official Vahlay Digital Sales Enablement Certificate.',
        summary: 'The culmination of your 15-day journey. Test your product knowledge, pricing compliance, objection handling, and sales discipline across all 13 services.',
        fullContent: `
# Final Assessment & Graduation

## 1. You Are Now Ready
Over the past 14 days, you have learned:
- All 13 core Vahlay Digital service offerings
- The nuances between Static, Dynamic, and E-commerce websites
- The power of CRM and ERP systems
- How SEO and GMB drive organic customers without false guarantees
- How short-form video and paid ads generate rapid pipeline velocity
- Transparent rate charts and strict approval workflows
- Professional Indian objection handling and CRM discipline

## 2. Examination Rules
- Total Questions: 10 Comprehensive Multi-Category Questions
- Pass Threshold: 80% (8/10 correct answers)
- Mandatory Pricing & Compliance Accuracy: 100% on compliance questions
- Upon passing, your official Vahlay Digital Academy Completion Certificate will be automatically unlocked and generated!
        `,
        businessCaseExample: {
          client: 'Certified Agent Milestone',
          industry: 'Sales Enablement',
          problem: 'Graduating agents entering live calling floor with proven readiness and zero false commitment habits.',
          recommendedSolution: 'Rigorous certification benchmark ensuring high conversion rates and high customer satisfaction.',
          outcome: '8 certified fresher agents delivering over ₹10 Lakhs in verified closed business within their first 60 days.'
        },
        pitchScript: {
          hinglish: 'Namaste Sir, main certified sales consultant baat kar raha hoon Vahlay Digital se...',
          english: 'Good afternoon Sir, this is your certified digital solutions advisor from Vahlay Digital...',
          hook: 'Let us build something exceptional for your business.'
        },
        flashcards: [
          { front: 'What is the required pass mark for the Vahlay Final Certification Exam?', back: '80% (80 marks out of 100).' },
          { front: 'What happens once you pass the Day 15 assessment?', back: 'You receive an official Vahlay Digital Sales Academy Certificate with a unique verification ID and gain full live calling floor clearance.' },
          { front: 'What is the most important trait of a Vahlay Sales Agent?', back: 'Integrity, discipline, active listening, and prescribing real solutions rather than pushing empty sales pitches.' }
        ],
        quizQuestions: [
          {
            id: 'q-d15-1',
            type: 'single',
            question: 'What is the approved starting price of a 5-page Static Website?',
            options: ['₹5,000', '₹12,000', '₹28,000', '₹45,000'],
            correctAnswer: 1,
            explanation: 'The approved starting price is ₹12,000 for the Starter Business Brochure package.',
            category: 'pricing'
          },
          {
            id: 'q-d15-2',
            type: 'single',
            question: 'Can an agent promise #1 Google ranking in 15 days?',
            options: ['Yes', 'No, strictly prohibited under Vahlay compliance', 'Only if client pays in advance', 'Only in Tier-2 cities'],
            correctAnswer: 1,
            explanation: 'Promising #1 rank violates company policy and Google guidelines.',
            category: 'compliance'
          },
          {
            id: 'q-d15-3',
            type: 'single',
            question: 'What is the primary difference between a static website and dynamic website?',
            options: [
              'Static has faster loading with fixed content; dynamic has a database and admin panel for client updates',
              'Static is for mobile; dynamic is for laptops',
              'Static is free; dynamic is expensive',
              'There is no difference'
            ],
            correctAnswer: 0,
            explanation: 'Static websites are fast and uneditable without code; dynamic websites have a CMS and database.',
            category: 'product_knowledge'
          },
          {
            id: 'q-d15-4',
            type: 'single',
            question: 'What is the approved starting price for Vahlay Sales Flow CRM (15 users)?',
            options: ['₹15,000', '₹25,000', '₹45,000', '₹1,20,000'],
            correctAnswer: 2,
            explanation: 'Vahlay Sales Flow CRM starts at ₹45,000.',
            category: 'pricing'
          },
          {
            id: 'q-d15-5',
            type: 'single',
            question: 'What is the standard payment milestone structure for web development projects at Vahlay?',
            options: [
              '100% after project completion',
              '50% advance on kickoff, 50% on demo approval before live deployment',
              '0% advance, pay whenever client wants',
              '10% advance, 90% in 1 year'
            ],
            correctAnswer: 1,
            explanation: 'Standard milestone is 50% advance and 50% upon demo approval.',
            category: 'compliance'
          }
        ],
        practicalRoleplayPrompt: 'Celebrate your completion! Present your 60-second graduation pitch for why a prospective customer should choose Vahlay Digital over all competitors.',
        assignment: 'Complete the final exam, score 80%+, and download your official Vahlay Digital Sales Enablement Certificate.'
      }
    ]
  }
];

export const INITIAL_OBJECTIONS: ObjectionItem[] = [
  {
    id: 'obj-1',
    objection: 'Your price is too high / Aapka price bohot zyada hai.',
    category: 'Price & Budget',
    whyCustomerAsks: 'Customer compares custom agency work to cheap freelance templates or is testing if you will fold and give a fast discount.',
    shortAgentResponse: 'Sir, market me 3,000 me bhi log bolte hain kar denge, par wo standard templates me logo daal kar phone uthana band kar dete hain. Hum conversion-focused website banate hain jo direct inquiries generate kare.',
    hinglishResponse: 'Sir bilkul samajh sakta hoon ki budget important hai. Par ek cheap website jo load hone me 8 second lagaye aur customer call na kare, wo sabse mehengi padti hai. Vahlay Digital me speed, direct WhatsApp button aur corporate reliability milti hai.',
    professionalResponse: 'I understand budget is a critical factor, Sir. However, our pricing reflects a complete conversion engine — sub-second load times, mobile-first design, direct WhatsApp integration, and dedicated delivery managers. A cheap site that fails to convert is an expense; a high-converting site is an investment that pays for itself in weeks.',
    discoveryQuestion: 'Sir, currently mahine me aapko online kitne inquiries aati hain aur ek average client se kitna revenue generate hota hai?',
    whatNotToPromise: 'Do not panic and offer an instant discount. Never lower price without reducing scope or getting manager signoff.',
    suggestedNextAction: 'Share a 1-minute case study of a similar business whose inquiries doubled.',
    escalationConditions: 'If client requests a discount exceeding 10%, submit a pricing approval escalation ticket to Sales Manager.'
  },
  {
    id: 'obj-2',
    objection: 'Another company / freelancer is doing it much cheaper.',
    category: 'Competitor & Trust',
    whyCustomerAsks: 'Unaware of the hidden risks of unvetted freelancers (vanished support, domain hijacked, security vulnerabilities).',
    shortAgentResponse: 'Sir, auto aur car dono travel karati hain, par reliability me farak hota hai. Freelancers project ke beech me gayab ho jaate hain, jabki Vahlay Digital corporate SLA aur 100% ownership guarantee deta hai.',
    hinglishResponse: 'Sir freelancer ya sasti agency initial me kam quote karti hai, par baad me domain apne naam rakh leti hai ya text change ke alag paise maangti hai. Hum GST invoice, registered agreement aur direct source code handover karte hain.',
    professionalResponse: 'Sir, many low-cost providers use cracked themes that get flagged as malware by Google within months. Vahlay Digital delivers clean code, full Intellectual Property ownership, and transparent milestone contracts. Would you risk your brand reputation to save a few thousand rupees?',
    discoveryQuestion: 'Sir, kya uss provider ne aapko written timeline guarantee, source code ownership aur post-delivery support ka contract diya hai?',
    whatNotToPromise: 'Do not insult the competitor personally. Stay professional and focus on Vahlay’s security and support.',
    suggestedNextAction: 'Explain Vahlay’s delivery milestone process (50-50) and contract transparency.',
    escalationConditions: 'Standard rate card holds. No escalation needed unless competitor is an enterprise agency.'
  },
  {
    id: 'obj-3',
    objection: 'Can you guarantee #1 ranking on Google in 15 days?',
    category: 'Technical & Guarantee',
    whyCustomerAsks: 'Mislead by unethical spam agencies promising instant #1 rankings.',
    shortAgentResponse: 'Sir, Google khud official guidelines me kehta hai ki koi bhi legitimate agency first rank guarantee nahi de sakti. Par hum 90 din me target keywords par measurable first-page ranking deliver karte hain.',
    hinglishResponse: 'Sir jo log 15 din me #1 rank ka vaada karte hain wo black-hat spam techniques use karte hain jisse website Google par permanently ban ho sakti hai. Hum white-hat ethical SEO karte hain jisse permanent traffic aaye.',
    professionalResponse: 'Google’s official policy explicitly warns against anyone guaranteeing a #1 rank. Anyone making that promise is likely using black-hat automation that risks your domain being permanently blacklisted by Google. We deploy white-hat technical optimization, content architecture, and local citations that deliver compounding organic visibility over 60 to 90 days.',
    discoveryQuestion: 'Sir, kya aapko 15 din ka temporary spam spike chahiye ya aane wale 2 saal ke liye consistent organic phone calls chahiye?',
    whatNotToPromise: 'STRICT RULE: NEVER PROMISE A #1 GOOGLE RANKING IN A SPECIFIC NUMBER OF DAYS.',
    suggestedNextAction: 'Share a sample monthly SEO keyword progression report showing real growth.',
    escalationConditions: 'None. Educate client on white-hat standards.'
  },
  {
    id: 'obj-4',
    objection: 'I already have a website, I don’t need a new one.',
    category: 'Need & Timing',
    whyCustomerAsks: 'Believes having any URL is enough, unaware that their current site is slow, outdated, or not converting.',
    shortAgentResponse: 'Sir, website hona aur website se business aana do alag baatein hain. Kya aapki current website se monthly inquiries aa rahi hain?',
    hinglishResponse: 'Sir website hona car khadi rakhne jaisa hai. Agar usme petrol (speed, SEO, WhatsApp button) nahi hai toh wo aage nahi badhti. Hum aapki current website ka 2-minute free audit kar dete hain taaki pata chale kahan leads drop ho rahi hain.',
    professionalResponse: 'Having a website is step one, Sir; conversion optimization is what drives revenue. If your current website takes longer than 3 seconds to load on a mobile phone, 53% of potential clients bounce before seeing your services. May I run a complimentary speed and conversion audit on your current URL?',
    discoveryQuestion: 'Sir, last month aapki website se kitne direct phone calls ya WhatsApp inquiries aayi thi?',
    whatNotToPromise: 'Do not claim their current site is terrible without looking at it.',
    suggestedNextAction: 'Run live Google PageSpeed Insights on their website and show mobile score.',
    escalationConditions: 'If they want maintenance/revamp of existing WordPress, offer AMC or Redesign package.'
  },
  {
    id: 'obj-5',
    objection: 'What is the difference between CRM and ERP? I am confused.',
    category: 'Technical & Guarantee',
    whyCustomerAsks: 'Both sound like enterprise software; customer is unsure which solves their operational pain.',
    shortAgentResponse: 'Sir simple shabdon me: CRM aapke sales aur customers ko sambhalta hai; ERP aapke factory, inventory, warehouse aur accounts ko sambhalta hai.',
    hinglishResponse: 'CRM aapke bahar ke revenue (leads, phone calls, follow-ups) ke liye hai taaki lead chori na ho. ERP aapke company ke andar ke operations (raw materials, godown stock, billing) ke liye hai taaki inventory mismatch na ho.',
    professionalResponse: 'CRM is customer-facing: it manages your incoming leads, telecaller activities, follow-up reminders, and WhatsApp communication to maximize revenue. ERP is operations-facing: it manages your warehouse inventory, vendor purchases, factory production, and GST invoicing. If your main challenge is sales follow-ups, you need a CRM. If it is stock and factory dispatches, you need an ERP.',
    discoveryQuestion: 'Sir, currently sabse bada challenge leads follow-up karne me aa raha hai ya warehouse me stock manage karne me?',
    whatNotToPromise: 'Do not sell an ERP when a client only has 2 sales agents needing lead tracking.',
    suggestedNextAction: 'Direct them to the 5-minute CRM demo or schedule an ERP technical scoping call.',
    escalationConditions: 'If ERP is required, create a Technical Support escalation ticket.'
  },
  {
    id: 'obj-6',
    objection: 'Can my CRM integrate directly with WhatsApp?',
    category: 'Technical & Guarantee',
    whyCustomerAsks: 'WhatsApp is the #1 communication tool in India; clients want seamless automated messaging.',
    shortAgentResponse: 'Haan bilkul Sir! Hamara CRM official Meta WhatsApp Cloud API se integrate hota hai jisse 1-click me approved templates lead ko chale jaate hain.',
    hinglishResponse: 'Ji Sir, CRM ke andar lead card se hi direct WhatsApp send hota hai aur auto-welcome message bhi trigger ho sakta hai jab nayi lead form bharti hai.',
    professionalResponse: 'Yes, absolutely. We integrate with the official Meta WhatsApp Cloud API. You can trigger automated instant welcome messages when a new lead enters the pipeline and send pre-approved follow-up templates directly from the CRM with a single click.',
    discoveryQuestion: 'Sir, kya aapke paas already verified WhatsApp Business number hai ya hume naya setup karna hoga?',
    whatNotToPromise: 'Do not promise that Meta conversation message charges are free. Meta charges per-conversation fees directly.',
    suggestedNextAction: 'Explain the difference between official Cloud API vs risky unofficial automation bots.',
    escalationConditions: 'Standard addon at ₹10,000. Approved.'
  },
  {
    id: 'obj-7',
    objection: 'Can you provide a free demo or build a sample first?',
    category: 'Competitor & Trust',
    whyCustomerAsks: 'Wants to de-risk their investment, testing if the agency will work on speculative free labor.',
    shortAgentResponse: 'Sir hum existing live clients ke demonstration aur portfolio links dikha sakte hain. Hum live client project design custom advance ke baad start karte hain.',
    hinglishResponse: 'Sir, hamare paas har service ke live demo portals aur portfolio websites ready hain jo aap abhi test kar sakte hain. Custom design hamari team aapki specific requirement ke according contract ke baad banati hai taaki 100% focused attention mile.',
    professionalResponse: 'Sir, we maintain fully functional live demo environments for our CRM, websites, and dashboards that you can test immediately. However, our senior architects build custom client prototypes exclusively under contracted agreements to ensure dedicated engineering resources are allocated to your brand.',
    discoveryQuestion: 'Sir, kya main aapko hamare similar industry ke 2 live client portals share karoon taaki aap quality inspect kar sakein?',
    whatNotToPromise: 'NEVER agree to do free custom design work or build unpaid prototypes.',
    suggestedNextAction: 'Send demo URLs from the approved Services Knowledge Base.',
    escalationConditions: 'None. Stick to live demo links.'
  },
  {
    id: 'obj-8',
    objection: 'I need to ask my partner / director. Call me later.',
    category: 'Authority & Stall',
    whyCustomerAsks: 'Genuine multi-partner decision process, or a polite exit stall because value was not clear.',
    shortAgentResponse: 'Bilkul Sir! Partner ka align hona zaroori hai. Kya main aap dono ke sath kal ek 10-minute ka quick screen share call schedule karoon?',
    hinglishResponse: 'Samajh sakta hoon Sir. Partner ko convince karne ke liye main ek crisp 1-page summary WhatsApp kar deta hoon. Kal dono ke sath 10 minute ka quick call plan kar lein taaki unke technical doubts bhi clear ho jayein?',
    professionalResponse: 'I completely respect that, Sir. Major business decisions require full partner alignment. To save your time explaining the technical details, may I set up a brief 10-minute joint walk-through with both of you tomorrow afternoon? I can demonstrate the ROI directly.',
    discoveryQuestion: 'Sir, partner ka sabse main concern kis cheez par rehta hai — budget par ya delivery timeline par?',
    whatNotToPromise: 'Do not push aggressively or show frustration. Be an enabler.',
    suggestedNextAction: 'Send an executive summary PDF and schedule a calendar invite.',
    escalationConditions: 'Update CRM lead status to "Follow-up" with scheduled date.'
  },
  {
    id: 'obj-9',
    objection: 'Call me next month / Abhi budget nahi hai.',
    category: 'Need & Timing',
    whyCustomerAsks: 'Cash flow constraints, end-of-quarter freeze, or lack of perceived urgency.',
    shortAgentResponse: 'Samajh sakta hoon Sir. Par website aur SEO live hone me 2-3 hafte lagte hain. Agar hum abhi start karein toh next month tak aap ready rahenge naye season ke liye.',
    hinglishResponse: 'Sir budget timing samajh sakta hoon. Par har din jo naye customers aapke area me competitor ko call kar rahe hain, wo revenue loss ho raha hai. Hum 50% advance milestone par kickoff kar sakte hain taaki remaining payment next month completion par aaye.',
    professionalResponse: 'Understood, Sir. Cash flow planning is critical. However, building digital assets takes 2 to 3 weeks of production time. If we begin our architecture now with a 50% kickoff milestone, your system will be fully operational by next month right when your seasonal demand peaks.',
    discoveryQuestion: 'Sir, kya agle month koi specific financial milestone expected hai, ya hum 2 split milestones me plan karein?',
    whatNotToPromise: 'Do not offer work with 0% advance payment.',
    suggestedNextAction: 'Propose milestone split payment structure and keep weekly nurture contact.',
    escalationConditions: 'If custom payment terms are requested, escalate to Sales Manager.'
  },
  {
    id: 'obj-10',
    objection: 'I want an urgent website delivered in 2 days.',
    category: 'Technical & Guarantee',
    whyCustomerAsks: 'Upcoming exhibition, product launch, or legal deadline.',
    shortAgentResponse: 'Sir, hamara standard 5-page static website 5 se 7 working days me deliver hota hai quality testing ke sath. 2 din me deliver karna hai toh express rush approval chahiye hoga.',
    hinglishResponse: 'Sir 2 din me bohot log buggy template utha kar de dete hain jisme mobile me text cut ho jata hai. Agar aapka content aur logo 100% ready hai, toh hum technical team se express delivery ki feasibility check karwa sakte hain.',
    professionalResponse: 'Quality engineering requires rigorous mobile testing and form validation to prevent broken lead capture. Our standard delivery for a 5-page brochure is 5 to 7 days. If your copy and branding assets are 100% finalized, we can submit an expedited rush request to our delivery team for a 3-day turnaround.',
    discoveryQuestion: 'Sir, kya aapka logo, content text aur photos ready hain?',
    whatNotToPromise: 'NEVER promise 2-day delivery without checking with the Technical Delivery Lead first.',
    suggestedNextAction: 'Create an Escalation Ticket for Express Delivery Feasibility.',
    escalationConditions: 'MANDATORY: Requires Technical Delivery Lead confirmation before accepting order.'
  },
  {
    id: 'obj-11',
    objection: 'Why should I trust Vahlay Digital? How old is your company?',
    category: 'Competitor & Trust',
    whyCustomerAsks: 'Risk aversion; fears paying advance to an agency that underdelivers.',
    shortAgentResponse: 'Sir, Vahlay Digital registered Indian corporate firm hai GST billing, formal contracts aur proven client portfolio ke sath. Hum transparent 50-50 milestones par kaam karte hain.',
    hinglishResponse: 'Sir aapka concern 100% valid hai market me fraudsters ki wajah se. Vahlay Digital me sabhi payments official bank account me GST invoice ke sath aati hain, project ka legal agreement hota hai aur 50% payment demo approval ke baad li jaati hai.',
    professionalResponse: 'Sir, your caution is completely justified in an industry plagued by unverified freelancers. Vahlay Digital operates with full legal transparency: registered GST invoicing, contractual scope agreements, and strict 50/50 delivery milestones where final payment is only due once you have personally inspected and approved the staging website.',
    discoveryQuestion: 'Sir, kya aap hamare previous clients ke live project links aur Google review feedback dekhna chahenge?',
    whatNotToPromise: 'Do not fabricate company history or claim 20 years of experience.',
    suggestedNextAction: 'Share official company profile PDF with registration and live client links.',
    escalationConditions: 'None.'
  },
  {
    id: 'obj-12',
    objection: 'Is hosting and domain free forever?',
    category: 'Price & Budget',
    whyCustomerAsks: 'Mislead by deceptive marketing claiming "Free lifetime website".',
    shortAgentResponse: 'Sir domain aur hosting internet par zameen aur address jaisi hoti hain jo registry authorities se renew hoti hain. First year hum setup karke dete hain, renewal yearly cost par hota hai.',
    hinglishResponse: 'Sir koi bhi genuine company lifetime free domain nahi de sakti kyunki ICANN aur registries yearly fee leti hain. Domain 100% aapke naam par register hota hai taaki complete ownership aapki rahe.',
    professionalResponse: 'Sir, domain names and cloud servers are digital real estate governed by central registries. Any provider promising "free lifetime hosting" is usually cutting off your ownership and holding your domain hostage. We set up 100% of domain and hosting credentials in your company name so you have full sovereign ownership.',
    discoveryQuestion: 'Sir, kya aap chahte hain ki domain ki ownership hamesha aapke paas rahe ya kisi third-party ke paas?',
    whatNotToPromise: 'NEVER promise free lifetime hosting or free lifetime domains.',
    suggestedNextAction: 'Clarify first-year setup inclusion vs subsequent yearly renewal at direct registry cost.',
    escalationConditions: 'None.'
  },
  {
    id: 'obj-13',
    objection: 'Can I update the website myself later?',
    category: 'Technical & Guarantee',
    whyCustomerAsks: 'Wants independence from developers for small future changes.',
    shortAgentResponse: 'Agar aap Dynamic CMS website lete hain toh haan Sir, aap khud login karke 2 minute me text aur photos update kar sakte hain.',
    hinglishResponse: 'Ji Sir! Dynamic website me hum easy Admin Panel bana kar dete hain jisme aap phone se bhi text, photo ya blog update kar sakte hain. Static website me code edit karna hota hai toh developer chahiye hota hai.',
    professionalResponse: 'If you opt for our Dynamic CMS Website at ₹28,000, yes! You receive a dedicated, intuitive admin dashboard where you can edit text, upload photos, and publish new offerings with zero coding required. We even provide a 30-minute 1-on-1 video training session for your staff.',
    discoveryQuestion: 'Sir, kitni frequently aapko website par changes karne honge?',
    whatNotToPromise: 'Do not promise self-editing on a ₹12,000 static website without developer assistance.',
    suggestedNextAction: 'Demonstrate dynamic admin panel demo link.',
    escalationConditions: 'None.'
  },
  {
    id: 'obj-14',
    objection: 'What happens after the website is delivered? Will you disappear?',
    category: 'Competitor & Trust',
    whyCustomerAsks: 'Past trauma of agencies disappearing after receiving the final payment.',
    shortAgentResponse: 'Sir, delivery ke baad 30 days ka complimentary warranty support included hota hai bugs fix karne ke liye, aur hum ongoing AMC support retainers provide karte hain.',
    hinglishResponse: 'Sir Vahlay Digital me delivery ke baad dedicated support desk hota hai. Initial 30 days me koi bhi technical glitch free of cost solve hota hai. Saath hi hum monthly AMC provide karte hain jisme backups aur updates continuous rehte hain.',
    professionalResponse: 'Every Vahlay project includes a 30-day post-launch warranty period where any technical bug or display glitch is resolved immediately at zero charge. Beyond that, our Website Maintenance AMC provides 24/7 uptime monitoring, automated cloud backups, and dedicated monthly developer hours.',
    discoveryQuestion: 'Sir, kya aapke paas in-house IT team hai ya ongoing support ke liye AMC retainer prefer karenge?',
    whatNotToPromise: 'Do not promise infinite free lifetime feature additions.',
    suggestedNextAction: 'Share details of the 30-day warranty and the ₹4,500/month AMC retainer.',
    escalationConditions: 'None.'
  },
  {
    id: 'obj-15',
    objection: 'Are payment gateway charges included in e-commerce?',
    category: 'Price & Budget',
    whyCustomerAsks: 'Unclear about third-party bank fees vs developer fees.',
    shortAgentResponse: 'Hamara integration fee website cost me included hai. Razorpay / Cashfree jo standard ~2% per transaction lete hain, wo direct bank charge hota hai.',
    hinglishResponse: 'Sir website me payment gateway integrate karne ka kaam humara hai. Par transaction par jo bank fee lagti hai (lagbhag 2%), wo direct Razorpay/PhonePe ka charge hota hai. Vahlay Digital koi transaction commission nahi leta.',
    professionalResponse: 'Technical integration of Razorpay/PhonePe is 100% included in our ₹35,000 package. The standard ~2% processing fee per transaction is charged directly by the payment gateway/RBI-authorized aggregator, not Vahlay. 100% of your sales revenue transfers directly into your bank account.',
    discoveryQuestion: 'Sir, kya aapka business GST certificate aur current account ready hai payment gateway KYC ke liye?',
    whatNotToPromise: 'Do not promise 0% payment gateway processing fees.',
    suggestedNextAction: 'Help client prepare documents for Razorpay KYC.',
    escalationConditions: 'None.'
  }
];

export const INITIAL_MOCK_SCENARIOS: MockCallScenario[] = [
  {
    id: 'scen-salon-1',
    title: 'Price-Sensitive Luxury Salon Owner in South Delhi',
    industry: 'Salon & Spa',
    clientName: 'Rajesh Mehra',
    clientRole: 'Founder & Managing Director',
    businessType: 'Premium Hair & Skin Studio',
    personality: 'Price-sensitive',
    difficulty: 'Beginner',
    primaryInterest: 'Website & Google Business Profile',
    backstory: 'Rajesh opened a salon 6 months ago in Greater Kailash. Footfall is below expectations. He gets inquiries mostly from walk-bys. Spent ₹15,000 on Instagram boost with zero results and is suspicious of digital marketing. Wants local footfall and appointments.',
    openingPrompt: 'Haanji boliye kaun? Dekhiye mere paas time bohot kam hai, agar koi website bechni hai toh bata doon market me bohot log 3,000 me bana rahe hain. Aap kya naya karoge?',
    secretNeeds: ['Wants high-paying bridal and hair treatment clients', 'Wants 5-star Google reviews from real clients', 'Wants click-to-WhatsApp booking on mobile'],
    dealBreakers: ['Arguing about price', 'Promising fake reviews', 'Using heavy English jargon without explaining value']
  },
  {
    id: 'scen-tattoo-1',
    title: 'Skeptical Tattoo Artist in Bandra, Mumbai',
    industry: 'Tattoo Studio',
    clientName: 'Vikram "Kozmo" Sawant',
    clientRole: 'Lead Artist & Owner',
    businessType: 'Custom Tattoo & Body Piercing Studio',
    personality: 'Skeptical',
    difficulty: 'Intermediate',
    primaryInterest: 'Reels Shooting & Instagram Marketing',
    backstory: 'Vikram is an artistic purist. He believes talent speaks for itself, but his competitor down the road has 80k followers and gets booked out 3 weeks in advance because of viral reels. Vikram is camera-shy and skeptical about corporate marketing.',
    openingPrompt: 'Look man, I am an artist, not a businessman. A marketer promised me 100k views last month, took ₹20,000, and delivered robotic junk reels. Why should I trust Vahlay Digital?',
    secretNeeds: ['Needs professional 4K camera crew who understands lighting on tattoos', 'Needs guidance on what to say on camera without feeling silly', 'Needs local Bandra/Andheri bookings'],
    dealBreakers: ['Treating tattoo art as a generic commodity', 'Overpromising millions of views', 'Ignoring his creative vision']
  },
  {
    id: 'scen-mfg-1',
    title: 'Busy Engineering Components Manufacturer in Pune',
    industry: 'Manufacturing',
    clientName: 'Suresh Patil',
    clientRole: 'Managing Director',
    businessType: 'Precision Brass & CNC Turning Components',
    personality: 'Busy',
    difficulty: 'Intermediate',
    primaryInterest: 'ERP / B2B Website',
    backstory: 'Suresh has a factory with 45 workers. He is constantly on the shop floor or in vendor meetings. Raw material inventory mismatches are causing late dispatches to automotive OEMs. He uses Tally and messy registers.',
    openingPrompt: 'Patil speaking. Jaldi bataiye kya kaam hai, factory floor par machine inspection chal raha hai. Do minute hain mere paas.',
    secretNeeds: ['Needs real-time raw material stock visibility', 'Needs dispatch tracking connected to GST billing', 'Wants to stop inventory theft in the warehouse'],
    dealBreakers: ['Long rambling introductions without getting to the business point', 'Quoting instant ERP prices without understanding modules']
  },
  {
    id: 'scen-clinic-1',
    title: 'Conservative Dental Surgeon in Lucknow',
    industry: 'Clinic / Healthcare',
    clientName: 'Dr. Anurag Tandon',
    clientRole: 'Chief Dental Surgeon',
    businessType: 'Multi-Speciality Dental & Implant Clinic',
    personality: 'Technical',
    difficulty: 'Intermediate',
    primaryInterest: 'SEO & Google Maps 3-Pack',
    backstory: 'Dr. Tandon wants more dental implant cases (high ticket, ₹30,000+ each). He is ethical and strictly against commercialized hard-selling or fake claims. Previous agency put fake reviews that got his listing flagged by Google.',
    openingPrompt: 'Namaste. As a doctor, medical ethics are my utmost priority. Some agencies promised me #1 rank in 10 days and put fake reviews which harmed my reputation. What is your methodology for healthcare search ranking?',
    secretNeeds: ['Strictly white-hat local SEO', 'High-intent patient inquiries searching for "implants" and "root canal"', 'Clear compliance and reputation safety'],
    dealBreakers: ['Promising guaranteed #1 rank in 10 days', 'Offering fake reviews', 'Using sales pressure']
  },
  {
    id: 'scen-retail-1',
    title: 'Aggressive Clothing Boutique Owner in Chandni Chowk',
    industry: 'Retail & E-commerce',
    clientName: 'Harpreet Singh',
    clientRole: 'Proprietor',
    businessType: 'Bridal Lehengas & Sarees',
    personality: 'Angry',
    difficulty: 'Advanced',
    primaryInterest: 'E-commerce Website & Instagram Ads',
    backstory: 'Harpreet is frustrated. He paid ₹50,000 to a freelance developer who built a broken WordPress site that took 12 seconds to load. He lost ₹15,000 on COD orders because customers canceled at delivery. He is in a fighting mood.',
    openingPrompt: 'Aap log sab chor ho! Pehle bhi ek company ne website banayi, saare paise le liye aur ek order nahi aaya. Ab aap phone karke fir se chuna lagane aaye ho?',
    secretNeeds: ['Needs OTP-verified COD to stop return losses (RTO)', 'Needs fast UPI payment integration (PhonePe/Razorpay)', 'Needs someone who actually listens to his pain without fighting back'],
    dealBreakers: ['Arguing back with him', 'Defending the previous bad agency', 'Promising 0% return rates']
  },
  {
    id: 'scen-realestate-1',
    title: 'Ambitious Real Estate Brokerage Head in Noida',
    industry: 'Real Estate',
    clientName: 'Kunal Singhal',
    clientRole: 'Director of Sales',
    businessType: 'Luxury High-Rise Resale & Mandates',
    personality: 'Interested but hesitant',
    difficulty: 'Intermediate',
    primaryInterest: 'CRM Development & Lead Tracking',
    backstory: 'Kunal runs a 12-person telecalling team. They spend ₹1,50,000 a month on 99acres and Meta Ads. He knows leads are being lost because executives manage them on personal phones. He wants a CRM, but is hesitant about user adoption.',
    openingPrompt: 'Hello Kunal here. Look, we generate 500 leads a month. My biggest headache is that agents forget follow-ups and when they quit, my data is gone. But will my agents actually use your software or is it too complex?',
    secretNeeds: ['Simple mobile-friendly CRM with WhatsApp templates', 'Manager dashboard showing who called how many leads today', 'Restricted access so agents cannot download or steal data'],
    dealBreakers: ['Saying agents will need 3 months of training', 'Promising that CRM automatically makes cold calls itself']
  }
];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_PROPOSALS: Proposal[] = [];

export const INITIAL_ESCALATIONS: EscalationTicket[] = [];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'New Combo Offer Approved: Reels Shoot + 12 Reels Editing',
    content: 'Management has approved a unified bundle for on-site half-day reels shooting and 12-reel editing at ₹28,000 (regular price ₹30,000). Agents can pitch this to local salons, clinics, and studios starting today.',
    category: 'Pricing Update',
    author: 'Piyush Gond (Managing Director)',
    date: '2026-10-15',
    priority: 'high',
    readBy: []
  },
  {
    id: 'ann-2',
    title: 'Reminder: Strict Zero-Tolerance on False Google Ranking Guarantees',
    content: 'All sales agents are reminded that promising #1 rank on Google within a specific number of days is strictly prohibited by Vahlay compliance and Google Webmaster policies. Always sell white-hat structured optimization (60-90 days).',
    category: 'Important Rule',
    author: 'Piyush Gond (Managing Director)',
    date: '2026-10-10',
    priority: 'high',
    readBy: []
  }
];

export const INITIAL_BADGES: BadgeInfo[] = [
  { id: 'badge-fast-starter', name: 'Fast Starter', description: 'Completed Day 1 & Day 2 training with 80%+ quiz score.', icon: 'Zap', category: 'Academy' },
  { id: 'badge-website-whiz', name: 'Website Whiz', description: 'Mastered Static, Dynamic, and E-commerce sales battlecards.', icon: 'Globe', category: 'Academy' },
  { id: 'badge-crm-pro', name: 'CRM Architecture Pro', description: 'Passed CRM & ERP qualification assessments with flying colors.', icon: 'Cpu', category: 'Academy' },
  { id: 'badge-streak-5', name: '5-Day Discipline Streak', description: 'Maintained 5 consecutive days of training and call logging.', icon: 'Flame', category: 'Discipline' },
  { id: 'badge-objection-slayer', name: 'Objection Slayer', description: 'Achieved 90%+ in the Indian Customer Objection drill.', icon: 'ShieldCheck', category: 'Mock Call' },
  { id: 'badge-closer-elite', name: 'Closer Elite', description: 'Closed over ₹2,00,000 in approved client revenue.', icon: 'Trophy', category: 'Sales' },
  { id: 'badge-master-coach', name: 'Master Enablement Coach', description: 'Completed all 15 academy modules and guided team agents.', icon: 'Award', category: 'Academy' },
  { id: 'badge-founder', name: 'Vahlay Pillar', description: 'Founding executive of Vahlay Digital.', icon: 'Crown', category: 'Academy' },
  { id: 'badge-tech-wizard', name: 'Technical Wizard', description: 'Resolved 20+ technical feasibility and architectural tickets.', icon: 'Terminal', category: 'Academy' }
];

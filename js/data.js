/**
 * The Lashari Communication - Initial Mock Data & Settings
 * Stores initial data in LocalStorage so the Admin Panel can modify,
 * add, delete, and persist changes seamlessly.
 */

// Global AppState placeholder so that admin panel and storefront both operate safely
window.AppState = window.AppState || {
  products: [],
  brands: [],
  settings: {},
  cart: [],
  savedWishlist: [],
  activeFilter: "all",
  activeBrand: "all",
  activeCategory: "all",
  searchQuery: "",
  productQtyMap: {},
  currentOrderProduct: null,
  currentOrderQty: 1,
  collectionVisibleCount: 8,
  reviews: [],
  currentReviewPage: 0
};

const DEFAULT_SETTINGS = {
  brandName: "xcess",
  brandDot: ".",
  storeName: "The Lashari Communication",
  tagline: "Premium Mobile Back Covers & Accessories Across Pakistan",
  email: "thelasharicommunication@gmail.com",
  phone: "+92 321 2920914",
  whatsapp: "923212920914",
  shopAddress: "Shop #14, Ground Floor, Lashari Mobile Plaza, Pakistan",
  storeTimings: "Monday – Sunday: 11:00 AM – 11:00 PM (Friday Break: 1:00 PM – 2:30 PM)",
  locationHeading: "Find us in person.",
  locationDesc: "Experience our premium tech essentials, live checking warranty, and free precision mobile cover fitting at our official outlet.",
  googleMapsQuery: "Lashari Mobile Plaza, Pakistan",
  googleMapsUrl: "https://share.google/iiBvxUjHqCga5PFY1",
  socials: {
    instagram: "https://instagram.com/thelasharicommunication",
    facebook: "https://facebook.com/thelasharicommunication",
    tiktok: "https://tiktok.com/@thelasharicommunication"
  },
  deliveryFee: 200, // PKR 200 delivery fee as specified by user
  deliveryPartners: [
    { name: "TCS Express", badge: "Express Air Delivery", est: "1-2 Business Days" },
    { name: "Leopards Courier", badge: "Nationwide COD Reach", est: "2-3 Business Days" }
  ],
  paymentAccounts: [
    {
      id: "acc_1",
      bankName: "Meezan Bank Ltd",
      accountTitle: "Faizan Lashari",
      accountNumber: "0101-01020304050",
      active: true
    },
    {
      id: "acc_2",
      bankName: "JazzCash",
      accountTitle: "Faizan Lashari",
      accountNumber: "0300-1234567",
      active: true
    },
    {
      id: "acc_3",
      bankName: "EasyPaisa",
      accountTitle: "Faizan Lashari",
      accountNumber: "0345-9876543",
      active: true
    }
  ],
  announcementText: "THE EVERYDAY TECH EDIT · FLAT RS. 200 TCS & LEOPARDS DELIVERY",
  showAnnouncement: true,
  adminPin: "Speed150",
  specialOffer: {
    tag: "🔥 LIMITED TIME MEGA DROP",
    title: "FLAT 25% OFF · WEEKEND EDIT",
    desc: "Use promo code FLASH25 at checkout or claim flat Rs. 200 delivery nationwide with TCS & Leopards Express courier dispatch.",
    code: "FLASH25",
    btnText: "Shop Weekend Deals",
    btnLink: "#collection",
    note: "⚡ Valid for all orders across Pakistan · Limited Stock"
  },
  sectionVisibility: {
    announcement: true,
    hero: true,
    categories: true,
    collection: true,
    reviews: true,
    offer: true,
    editorial: false,
    closing: false,
    brands: true,
    location: true
  }
};

const DEFAULT_REVIEWS = [
  {
    id: "rev_1",
    name: "Ayesha Khan",
    city: "Karachi",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    item: "Ultra Smartwatch 2.0 Titanium",
    review: "Order kiya tha TCS se sirf 2 din me Karachi deliver ho gaya! Screen display aur battery backup dono 10/10 hain. Packaging bohot premium thi.",
    date: "2 days ago",
    verified: true
  },
  {
    id: "rev_2",
    name: "Muhammad Bilal",
    city: "Lahore",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    item: "20,000mAh Dual Fast Power Bank",
    review: "Meezan Bank se advance payment ki thi, pehle thora darr lag raha tha lekin WhatsApp par foran receipt aur Leopards tracking mil gayi. Super trusted store!",
    date: "3 days ago",
    verified: true
  },
  {
    id: "rev_3",
    name: "Fatima Zahra",
    city: "Islamabad",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    item: "Pro ANC Wireless Earbuds",
    review: "Sound clarity aur active noise cancellation bohot zabardast hai. Gym aur calls ke liye best earbuds hain is price bracket me.",
    date: "4 days ago",
    verified: true
  },
  {
    id: "rev_4",
    name: "Hamza Tariq",
    city: "Rawalpindi",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    item: "iPhone 15 Pro Matte Armor Case",
    review: "Cover ki fitting exact hai aur buttons click response bohot smooth hai. Flat 200 delivery fee pure Pakistan me best perk hai.",
    date: "5 days ago",
    verified: true
  },
  {
    id: "rev_5",
    name: "Zainab Ali",
    city: "Faisalabad",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    item: "LED Ring Light with Stand",
    review: "Content creation aur reels shoot karne ke liye order ki thi. Light modes bohot clear hain aur tripod bilkul sturdy hai. Highly recommend!",
    date: "1 week ago",
    verified: true
  },
  {
    id: "rev_6",
    name: "Usman Farooq",
    city: "Multan",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    item: "65W GaN Fast Charger",
    review: "Mera laptop aur mobile dono ek hi charger se fast charge ho jate hain. Heat up bilkul nahi hota. Original product mila.",
    date: "1 week ago",
    verified: true
  },
  {
    id: "rev_7",
    name: "Sana Javed",
    city: "Peshawar",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    item: "Magnetic Wireless Charging Pad",
    review: "Table setup bohot clean ho gaya hai. Magnet grip strong hai phone slip nahi hota. Customer support WhatsApp par bohot friendly hai.",
    date: "1 week ago",
    verified: true
  },
  {
    id: "rev_8",
    name: "Daniyal Sheikh",
    city: "Sialkot",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
    item: "Car Air Vent Phone Mount",
    review: "Bumpy roads par bhi mobile hold rakhta hai girne ka koi chance nahi. Solid build quality.",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: "rev_9",
    name: "Maryam Noor",
    city: "Gujranwala",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    item: "Heavy Bass Wireless Speaker",
    review: "Room me aisi sound deta hai jaise home theater ho. Battery backup 8 hours se zyada chalta hai. Loved it!",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: "rev_10",
    name: "Haris Ahmed",
    city: "Hyderabad",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    item: "Heavy Duty Bike Mobile Mount",
    review: "Bike ride ke doran Google Maps use karne ke liye perfect mount hai. Lock system bilkul tight hai.",
    date: "2 weeks ago",
    verified: true
  },
  {
    id: "rev_11",
    name: "Anum Malik",
    city: "Quetta",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    item: "Samsung S24 Ultra Silicone Case",
    review: "Color bilkul picture jaisa tha aur inside microfiber lining di hui hai scratches se bachane ke liye.",
    date: "3 weeks ago",
    verified: true
  },
  {
    id: "rev_12",
    name: "Saad Rasheed",
    city: "Lahore",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=150&q=80",
    item: "Braided 100W Type-C Cable",
    review: "Cables usually jaldi toot jati hain lekin yeh braided material bohot durable lag raha hai. Super fast charging support hai.",
    date: "3 weeks ago",
    verified: true
  },
  {
    id: "rev_13",
    name: "Hira Tariq",
    city: "Karachi",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80",
    item: "Aluminium Desk Phone Stand",
    review: "Study desk ke liye mangwaya tha, height aur angle easily adjust ho jata hai. Video calls ke liye bohot comfortable hai.",
    date: "3 weeks ago",
    verified: true
  },
  {
    id: "rev_14",
    name: "Zeeshan Haider",
    city: "Islamabad",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80",
    item: "Active 2 Smartwatch",
    review: "Calling feature aur WhatsApp notification alerts flawless kaam karte hain. 100% value for money.",
    date: "1 month ago",
    verified: true
  },
  {
    id: "rev_15",
    name: "Mahnoor Shah",
    city: "Rawalpindi",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    item: "Noise Cancellation Earbuds V2",
    review: "EasyPaisa se advance pay kiya tha. Same day dispatch ho gaya aur next day door par delivery. Outstanding service!",
    date: "1 month ago",
    verified: true
  }
];

const DEFAULT_COUPONS = [
  { code: "LASHARI10", discountType: "percent", value: 10, label: "10% Off Storewide" },
  { code: "FIRSTBUY", discountType: "fixed", value: 100, label: "Rs. 100 Off Welcome Gift" },
  { code: "VIP50", discountType: "fixed", value: 50, label: "Rs. 50 VIP Voucher" }
];

const DEFAULT_BRANDS = [
  {
    id: "apple",
    name: "Apple iPhone",
    modelsCount: "iPhone 11 to 16 Pro Max",
    icon: "fa-brands fa-apple",
    color: "#000000",
    popularModels: ["iPhone 16 Pro Max", "iPhone 15 Pro", "iPhone 14 Pro", "iPhone 13", "iPhone 12/11"]
  },
  {
    id: "samsung",
    name: "Samsung",
    modelsCount: "Galaxy S & A Series",
    icon: "fa-solid fa-mobile-screen-button",
    color: "#034ea2",
    popularModels: ["S24 Ultra", "S23 Ultra", "A55 5G", "A35 5G", "A15"]
  },
  {
    id: "xiaomi",
    name: "Xiaomi / Redmi",
    modelsCount: "Redmi Note & Poco Series",
    icon: "fa-solid fa-bolt",
    color: "#ff6900",
    popularModels: ["Redmi Note 13 Pro", "Poco X6 Pro", "Redmi 13C", "Xiaomi 14"]
  },
  {
    id: "vivo",
    name: "Vivo",
    modelsCount: "V-Series & Y-Series",
    icon: "fa-solid fa-gem",
    color: "#0055ff",
    popularModels: ["Vivo V30 5G", "Vivo V29e", "Vivo Y200", "Vivo Y28"]
  },
  {
    id: "oppo",
    name: "Oppo",
    modelsCount: "Reno & A-Series",
    icon: "fa-solid fa-circle-dot",
    color: "#0f7f38",
    popularModels: ["Reno 12", "Reno 11F", "Oppo A78", "Oppo A60"]
  },
  {
    id: "realme",
    name: "Realme",
    modelsCount: "Number & C-Series",
    icon: "fa-solid fa-crown",
    color: "#eab308",
    popularModels: ["Realme 12 Pro+", "Realme C67", "Realme 11 5G", "Realme C53"]
  },
  {
    id: "infinix",
    name: "Infinix",
    modelsCount: "Note, Hot & Smart Series",
    icon: "fa-solid fa-fire-flame-curved",
    color: "#22c55e",
    popularModels: ["Infinix Note 40 Pro", "Hot 40 Pro", "Zero 30 5G", "Smart 8"]
  },
  {
    id: "tecno",
    name: "Tecno",
    modelsCount: "Camon & Spark Series",
    icon: "fa-solid fa-shield-halved",
    color: "#06b6d4",
    popularModels: ["Camon 30 Pro", "Spark 20 Pro+", "Pova 6 Neo", "Spark Go 2024"]
  }
];

const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    title: "Luxury MagSafe Frosted Matte Armor Case",
    brand: "apple",
    brandName: "Apple iPhone",
    compatibleModels: ["iPhone 16 Pro Max", "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 14 Pro Max", "iPhone 13"],
    price: 1450,
    oldPrice: 1999,
    category: "Magnetic Armor",
    rating: 4.9,
    reviewsCount: 38,
    stock: 25,
    isFeatured: true,
    badge: "Best Seller",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Premium aviation-grade matte translucent magnetic case engineered for shock absorption and MagSafe charging. Scratch-resistant oleophobic coating prevents fingerprints. Raised camera bezels for total lens protection.",
    reviews: [
      { name: "Hamza Tariq", city: "Lahore", rating: 5, date: "2 days ago", comment: "Bhai zabardast quality he! MagSafe magnetic grip bohot strong he. TCS se 2 din me deliver hua." },
      { name: "Bilal Ahmed", city: "Karachi", rating: 5, date: "1 week ago", comment: "iPhone 15 Pro Max k liye mangwaya tha, fitting 100% accurate he. Highly recommended!" }
    ]
  },
  {
    id: "prod-2",
    title: "Heavy Duty Rugged Kickstand Defense Case",
    brand: "samsung",
    brandName: "Samsung",
    compatibleModels: ["S24 Ultra", "S23 Ultra", "A55 5G", "A35 5G", "A15"],
    price: 1250,
    oldPrice: 1750,
    category: "Shockproof Rugged",
    rating: 4.8,
    reviewsCount: 42,
    stock: 18,
    isFeatured: true,
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Military-grade dual-layer drop protection with built-in 360-degree rotating metal ring kickstand. Perfect for hands-free video viewing and magnetic car mount attachment.",
    reviews: [
      { name: "Kamran Lashari", city: "Hyderabad", rating: 5, date: "3 days ago", comment: "S24 Ultra ka cover bohot solid he. Girne par bhi phone bilkul mehfooz rehta he." },
      { name: "Usman Ghani", city: "Islamabad", rating: 4, date: "2 weeks ago", comment: "Kickstand bohot kaam ki cheez he. Leopards parcel time pe le aya." }
    ]
  },
  {
    id: "prod-3",
    title: "Electroplated Camera Lens Protector Soft TPU Case",
    brand: "xiaomi",
    brandName: "Xiaomi / Redmi",
    compatibleModels: ["Redmi Note 13 Pro", "Poco X6 Pro", "Redmi 13C", "Xiaomi 14"],
    price: 899,
    oldPrice: 1399,
    category: "Slim Electroplated",
    rating: 4.9,
    reviewsCount: 29,
    stock: 30,
    isFeatured: true,
    badge: "Hot Deal",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Ultra-slim soft flexible TPU bumper with metallic electroplated gold edges and built-in tempered camera glass protection ring. Crystal clear transparent back showcases your phone's authentic color.",
    reviews: [
      { name: "Asad Raza", city: "Faisalabad", rating: 5, date: "Yesterday", comment: "Poco X6 Pro pe bohot classy lag raha he. 899 PKR me itni achi quality kamal he." }
    ]
  },
  {
    id: "prod-4",
    title: "Executive Luxury Vegan Leather Protective Cover",
    brand: "vivo",
    brandName: "Vivo",
    compatibleModels: ["Vivo V30 5G", "Vivo V29e", "Vivo Y200", "Vivo Y28"],
    price: 1350,
    oldPrice: 1850,
    category: "Luxury Leather",
    rating: 4.9,
    reviewsCount: 31,
    stock: 14,
    isFeatured: true,
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Premium textured vegan PU leather with precision stitching and metallic accent logos. Provides non-slip luxury grip with comfortable hand feel and slim pocket profile.",
    reviews: [
      { name: "Danish Sheikh", city: "Multan", rating: 5, date: "4 days ago", comment: "Vivo V30 ke liye perfect leather finish. Packing bohot zabardast thi." }
    ]
  },
  {
    id: "prod-5",
    title: "Carbon Fiber Anti-Slip Shock Absorption Bumper",
    brand: "oppo",
    brandName: "Oppo",
    compatibleModels: ["Reno 12", "Reno 11F", "Oppo A78", "Oppo A60"],
    price: 950,
    oldPrice: 1400,
    category: "Carbon Fiber",
    rating: 4.7,
    reviewsCount: 22,
    stock: 22,
    isFeatured: false,
    badge: "Special",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Brushed carbon fiber texture design engineered with corner air cushion technology to safeguard against sudden drops, scratches, and dust.",
    reviews: [
      { name: "Waqas Ali", city: "Rawalpindi", rating: 5, date: "5 days ago", comment: "Grip bohot zabardast he. Haath se phisalta nahi he bilkul." }
    ]
  },
  {
    id: "prod-6",
    title: "Slide Camera Shutter Armor Shockproof Case",
    brand: "realme",
    brandName: "Realme",
    compatibleModels: ["Realme 12 Pro+", "Realme C67", "Realme 11 5G", "Realme C53"],
    price: 1100,
    oldPrice: 1600,
    category: "Camera Armor",
    rating: 4.8,
    reviewsCount: 26,
    stock: 19,
    isFeatured: false,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Patented sliding camera cover protects lenses from scratches and prevents privacy invasion. Textured anti-slip side grips and rugged TPU bumper frame.",
    reviews: [
      { name: "Zubair Lashari", city: "Sukkur", rating: 5, date: "1 week ago", comment: "Camera shutter mechanism bohot smooth he. 100% satisfied." }
    ]
  },
  {
    id: "prod-7",
    title: "Mecha Cyberpunk Gaming Edition Frosted Case",
    brand: "infinix",
    brandName: "Infinix",
    compatibleModels: ["Infinix Note 40 Pro", "Hot 40 Pro", "Zero 30 5G", "Smart 8"],
    price: 1199,
    oldPrice: 1699,
    category: "Gaming Cyberpunk",
    rating: 4.9,
    reviewsCount: 35,
    stock: 16,
    isFeatured: true,
    badge: "Gamer Choice",
    image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Futuristic mecha graphics designed with micro-matte backplate that repels sweat and heat during intense mobile gaming sessions. Compatible with magnetic wireless accessories.",
    reviews: [
      { name: "Shahzaib Khan", city: "Peshawar", rating: 5, date: "3 days ago", comment: "Note 40 Pro k liye perfect match he. Wireless charging bhi smoothly kaam kar rahi he." }
    ]
  },
  {
    id: "prod-8",
    title: "Crystal Clear Non-Yellowing Hybrid Airbag Case",
    brand: "tecno",
    brandName: "Tecno",
    compatibleModels: ["Camon 30 Pro", "Spark 20 Pro+", "Pova 6 Neo", "Spark Go 2024"],
    price: 799,
    oldPrice: 1199,
    category: "Crystal Clear",
    rating: 4.7,
    reviewsCount: 19,
    stock: 28,
    isFeatured: false,
    badge: "Budget King",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=700&q=80"
    ],
    description: "German Bayer optical material provides 99.9% transparency without yellowing. 4-corner drop impact airbag cushions reduce drop shock by up to 90%.",
    reviews: [
      { name: "M. Farhan", city: "Larkana", rating: 5, date: "5 days ago", comment: "Spark 20 Pro+ ka original color dikhta he, aur delivery bhi 200 PKR me 2 din me pohach gai." }
    ]
  },
  {
    id: "prod-9",
    title: "Ultra AMOLED Smartwatch With Bluetooth Calling & Fitness Tracker",
    brand: "apple",
    brandName: "Smartwatches",
    compatibleModels: ["Universal iOS & Android", "iPhone / Samsung / Xiaomi Compatible"],
    price: 3450,
    oldPrice: 4999,
    category: "Smartwatches",
    rating: 4.9,
    reviewsCount: 47,
    stock: 20,
    isFeatured: true,
    badge: "Hot Wearable",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Crisp 2.02-inch HD AMOLED display with high-definition Bluetooth calling, heart rate & SpO2 tracking, multiple sports modes, and 5-7 days battery backup.",
    reviews: [
      { name: "Adnan Malik", city: "Lahore", rating: 5, date: "2 days ago", comment: "Display quality bohot shaandaar he, calling bilkul clear he. TCS deliver fast!" }
    ]
  },
  {
    id: "prod-10",
    title: "Pro Active Noise Cancelling (ANC) Wireless Earbuds",
    brand: "apple",
    brandName: "Earbuds / Audio",
    compatibleModels: ["Universal Bluetooth 5.3", "All Smartphones & Laptops"],
    price: 2199,
    oldPrice: 3200,
    category: "Earbuds",
    rating: 4.8,
    reviewsCount: 39,
    stock: 25,
    isFeatured: true,
    badge: "Deep Bass",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80"
    ],
    description: "True wireless stereo earbuds with Active Noise Cancellation (ANC), Transparency mode, deep dynamic bass, and 28 hours playtime with charging case.",
    reviews: [
      { name: "Shoaib Akhtar", city: "Islamabad", rating: 5, date: "3 days ago", comment: "Bass bohot zabardast he aur noise cancellation kaam karta he. COD safe delivery." }
    ]
  },
  {
    id: "prod-11",
    title: "20,000mAh 22.5W Super Fast Charge PD Power Bank with Digital Display",
    brand: "samsung",
    brandName: "Power Banks",
    compatibleModels: ["All Type-C & iPhone", "Quick Charge 3.0 & PD Fast"],
    price: 2650,
    oldPrice: 3800,
    category: "Power Banks",
    rating: 4.9,
    reviewsCount: 52,
    stock: 18,
    isFeatured: true,
    badge: "22.5W Fast",
    image: "https://images.unsplash.com/photo-1609592807664-07e3a388726e?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1609592807664-07e3a388726e?auto=format&fit=crop&w=700&q=80"
    ],
    description: "High capacity 20,000mAh polymer battery with 22.5W two-way fast charging, LED percentage indicator, and multi-device simultaneous charging.",
    reviews: [
      { name: "Tariq Jameel", city: "Karachi", rating: 5, date: "4 days ago", comment: "Phone ko 4 dafa full charge kar deta he. Fast charging display accurate he." }
    ]
  },
  {
    id: "prod-12",
    title: "15W 3-in-1 Magnetic Fast Wireless Charger Stand",
    brand: "apple",
    brandName: "Wireless Chargers",
    compatibleModels: ["MagSafe iPhone 12 to 16", "Apple Watch & AirPods", "Qi Wireless Android"],
    price: 2350,
    oldPrice: 3499,
    category: "Wireless Chargers",
    rating: 4.8,
    reviewsCount: 31,
    stock: 15,
    isFeatured: true,
    badge: "MagSafe Stand",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Foldable aluminum 3-in-1 desktop charging station for smartphone, smartwatch, and wireless earbuds. Intelligent heat dissipation and overcharge protection.",
    reviews: [
      { name: "Rehan Siddiqui", city: "Faisalabad", rating: 5, date: "1 week ago", comment: "Desk setup bohot clean ho gaya he, wires ki tension khatam." }
    ]
  },
  {
    id: "prod-13",
    title: "65W GaN Super Fast Charger with 100W Braided Type-C Fast Cable",
    brand: "samsung",
    brandName: "Cables & Chargers",
    compatibleModels: ["Samsung 45W PPS Super Fast", "Xiaomi Fast Charge", "iPhone 27W PD"],
    price: 1750,
    oldPrice: 2450,
    category: "Cables & Chargers",
    rating: 4.9,
    reviewsCount: 64,
    stock: 35,
    isFeatured: false,
    badge: "GaN Fast",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Next-gen Gallium Nitride (GaN) fast charger with 100W heavy nylon-braided Type-C cable. Charges phone from 0% to 70% in just 30 minutes.",
    reviews: [
      { name: "Khurram Shah", city: "Rawalpindi", rating: 5, date: "3 days ago", comment: "Speed zabardast he! S24 Ultra pe 'Super Fast Charging 2.0' likha ata he." }
    ]
  },
  {
    id: "prod-14",
    title: "Dual Port 35W PD + USB QC 3.0 Fast Travel Adapter",
    brand: "xiaomi",
    brandName: "Adapters",
    compatibleModels: ["Universal Multi-Device", "Dual Simultaneous Fast Charge"],
    price: 1199,
    oldPrice: 1750,
    category: "Adapters",
    rating: 4.7,
    reviewsCount: 28,
    stock: 22,
    isFeatured: false,
    badge: "Dual Port",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Compact dual output travel adapter featuring USB-C Power Delivery and USB-A Quick Charge 3.0 with smart power distribution.",
    reviews: [
      { name: "Ali Raza", city: "Peshawar", rating: 5, date: "6 days ago", comment: "Bohot compact he, travel ke liye best adapter he." }
    ]
  },
  {
    id: "prod-15",
    title: "IPX7 Waterproof Bass Boost Portable Bluetooth Speaker",
    brand: "apple",
    brandName: "Speakers",
    compatibleModels: ["Universal Bluetooth 5.0", "12H Playtime Battery"],
    price: 2250,
    oldPrice: 3200,
    category: "Speakers",
    rating: 4.9,
    reviewsCount: 43,
    stock: 17,
    isFeatured: false,
    badge: "Bass Boost",
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Rugged waterproof outdoor wireless speaker with 360-degree surround sound, punchy bass radiators, and built-in hands-free microphone.",
    reviews: [
      { name: "Nabeel Khan", city: "Multan", rating: 5, date: "2 days ago", comment: "Sound quality bohot loud aur clear he, outdoor k liye best." }
    ]
  },
  {
    id: "prod-16",
    title: "12-Inch Professional LED Ring Light with 7ft Metal Tripod & Phone Mount",
    brand: "vivo",
    brandName: "LED Ring Light",
    compatibleModels: ["All Smartphones", "3 Light Color Temperatures & Dimmer"],
    price: 1850,
    oldPrice: 2650,
    category: "LED Ring Light",
    rating: 4.8,
    reviewsCount: 36,
    stock: 19,
    isFeatured: false,
    badge: "Creator Kit",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80"
    ],
    description: "High-luminance dimmable LED ring light with warm, cool, and daylight modes. Includes heavy-duty 7-foot extendable tripod and 360-degree phone holder.",
    reviews: [
      { name: "Ayesha Noor", city: "Lahore", rating: 5, date: "5 days ago", comment: "TikTok videos aur makeup tutorial ke liye best light he." }
    ]
  },
  {
    id: "prod-17",
    title: "360° Rotatable Heavy Metal Folding Desk Mobile & Tablet Holder",
    brand: "oppo",
    brandName: "Desk Mobile Holders",
    compatibleModels: ["All Phones & Tablets up to 11 inch", "Anti-Scratch Silicone Pads"],
    price: 899,
    oldPrice: 1350,
    category: "Desk Mobile Holders",
    rating: 4.9,
    reviewsCount: 58,
    stock: 30,
    isFeatured: false,
    badge: "Solid Metal",
    image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Ergonomic aluminum alloy desk phone stand with double-hinge angle adjustment, weighted non-tipping base, and cable pass-through hole.",
    reviews: [
      { name: "Zeeshan", city: "Karachi", rating: 5, date: "3 days ago", comment: "Heavy metal stand he, phone bilkul shake nahi hota. 899 me worth it." }
    ]
  },
  {
    id: "prod-18",
    title: "Auto-Lock Gravity & Magnetic Air Vent Dashboard Car Phone Mount",
    brand: "realme",
    brandName: "Car Mobile Holders",
    compatibleModels: ["Universal 4.7 to 7.0 Inch Phones", "One-Hand Quick Release"],
    price: 999,
    oldPrice: 1500,
    category: "Car Mobile Holders",
    rating: 4.8,
    reviewsCount: 44,
    stock: 24,
    isFeatured: false,
    badge: "Auto Grip",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=700&q=80"
    ],
    description: "One-second auto-clamping mechanism with triangle gravity locking and dual-mount compatibility for car AC air vents or flat dashboard.",
    reviews: [
      { name: "Faraz Ahmed", city: "Islamabad", rating: 5, date: "1 week ago", comment: "Car me bumps pe bhi phone securely hold rehta he." }
    ]
  },
  {
    id: "prod-19",
    title: "Shockproof Waterproof 360° Motorcycle & Bicycle Handlebar Phone Mount",
    brand: "infinix",
    brandName: "Bike Mobile Holders",
    compatibleModels: ["Universal Bike Handlebars 22-32mm", "Sensitive Touch TPU Screen"],
    price: 1199,
    oldPrice: 1750,
    category: "Bike Mobile Holders",
    rating: 4.9,
    reviewsCount: 37,
    stock: 21,
    isFeatured: false,
    badge: "Waterproof",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=700&q=80"
    ],
    description: "Fully sealed IPX6 waterproof bike mount case with high sensitivity touch window, sun visor hood, and internal silicone shock absorption cushions.",
    reviews: [
      { name: "Bilal Butt", city: "Gujranwala", rating: 5, date: "4 days ago", comment: "Bykea / rider ke liye perfect holder he. Baarish me phone safe rehta he." }
    ]
  }
];

const DEFAULT_ORDERS = [
  {
    id: "ORD-94821",
    customerName: "Muhammad Farhan",
    phone: "0312-3456789",
    email: "farhan.pk@gmail.com",
    address: "House 24, Street 5, Gulshan-e-Iqbal Block 13-D",
    city: "Karachi",
    items: [
      { title: "Luxury MagSafe Frosted Matte Armor Case", model: "iPhone 15 Pro", qty: 1, price: 1450 }
    ],
    subtotal: 1450,
    deliveryFee: 200,
    total: 1650,
    paymentMethod: "Cash on Delivery",
    courierPartner: "TCS Express",
    status: "Shipped",
    trackingNumber: "TCS-839210492",
    date: "2026-10-28 14:32"
  },
  {
    id: "ORD-94820",
    customerName: "Kashif Lashari",
    phone: "0300-9876543",
    email: "kashif.lashari@gmail.com",
    address: "B-12 Defence Phase 5",
    city: "Lahore",
    items: [
      { title: "Heavy Duty Rugged Kickstand Defense Case", model: "S24 Ultra", qty: 2, price: 1250 }
    ],
    subtotal: 2500,
    deliveryFee: 200,
    total: 2700,
    paymentMethod: "Advance Payment (EasyPaisa)",
    transactionRef: "EP-981240182",
    courierPartner: "Leopards Courier",
    status: "Confirmed",
    trackingNumber: "LEO-40192019",
    date: "2026-10-27 18:15"
  },
  {
    id: "ORD-94819",
    customerName: "Noman Siddiqui",
    phone: "0333-1122334",
    email: "noman.siddiqui@yahoo.com",
    address: "Flat 402, Al-Razi Heights, F-10/3",
    city: "Islamabad",
    items: [
      { title: "Slide Camera Shutter Armor Shockproof Case", model: "Realme 12 Pro+", qty: 1, price: 1100 }
    ],
    subtotal: 1100,
    deliveryFee: 200,
    total: 1300,
    paymentMethod: "Cash on Delivery",
    courierPartner: "TCS Express",
    status: "Delivered",
    trackingNumber: "TCS-10928374",
    date: "2026-10-25 11:20"
  }
];

// Helper functions for LocalStorage persistence
const Storage = {
  getSettings: () => {
    const saved = localStorage.getItem("lashari_settings");
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      let changed = false;
      if (!parsed.paymentAccounts || !Array.isArray(parsed.paymentAccounts)) {
        parsed.paymentAccounts = DEFAULT_SETTINGS.paymentAccounts;
        changed = true;
      }
      if (!parsed.brandName) {
        parsed.brandName = DEFAULT_SETTINGS.brandName || "xcess";
        changed = true;
      }
      if (parsed.brandDot === undefined) {
        parsed.brandDot = DEFAULT_SETTINGS.brandDot || ".";
        changed = true;
      }
      if (!parsed.specialOffer) {
        parsed.specialOffer = DEFAULT_SETTINGS.specialOffer;
        changed = true;
      }
      if (!parsed.sectionVisibility) {
        parsed.sectionVisibility = DEFAULT_SETTINGS.sectionVisibility;
        changed = true;
      }
      if (!parsed._sec_defaults_v2) {
        parsed.sectionVisibility = parsed.sectionVisibility || {};
        parsed.sectionVisibility.editorial = false;
        parsed.sectionVisibility.closing = false;
        parsed._sec_defaults_v2 = true;
        changed = true;
      }
      if (!parsed._phone_update_914 || parsed.phone === "+92 314 4494605" || parsed.whatsapp === "923144494605") {
        parsed.phone = "+92 321 2920914";
        parsed.whatsapp = "923212920914";
        parsed.storeTimings = parsed.storeTimings || "Monday – Sunday: 11:00 AM – 11:00 PM (Friday Break: 1:00 PM – 2:30 PM)";
        parsed.locationHeading = parsed.locationHeading || "Find us in person.";
        parsed.locationDesc = parsed.locationDesc || "Experience our premium tech essentials, live checking warranty, and free precision mobile cover fitting at our official outlet.";
        parsed._phone_update_914 = true;
        changed = true;
      }
      if (!parsed._pin_speed150 || parsed.adminPin === "1234") {
        parsed.adminPin = "Speed150";
        parsed._pin_speed150 = true;
        changed = true;
      }
      if (!parsed.googleMapsUrl || !parsed._map_url_share_v1) {
        parsed.googleMapsUrl = "https://share.google/iiBvxUjHqCga5PFY1";
        parsed._map_url_share_v1 = true;
        changed = true;
      }
      if (changed) {
        localStorage.setItem("lashari_settings", JSON.stringify(parsed));
      }
      return parsed;
    } catch(e) {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings: (settings) => {
    localStorage.setItem("lashari_settings", JSON.stringify(settings));
  },
  getBrands: () => {
    const saved = localStorage.getItem("lashari_brands");
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  },
  getProducts: () => {
    const saved = localStorage.getItem("lashari_products");
    if (!saved) {
      try {
        localStorage.setItem("lashari_products", JSON.stringify(DEFAULT_PRODUCTS));
      } catch(e) {}
      return DEFAULT_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return DEFAULT_PRODUCTS;
    } catch(e) {
      return DEFAULT_PRODUCTS;
    }
  },
  saveProducts: async (products) => {
    localStorage.setItem("lashari_products", JSON.stringify(products));
    window.dispatchEvent(new CustomEvent("lashari:products-updated", { detail: products }));

    const apiUrl = window.PRODUCTS_API_URL || "/api/products";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products })
      });
      if (!response.ok) {
        let errMessage = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) errMessage = errData.error;
        } catch(e) {}
        throw new Error(errMessage);
      }
      return true;
    } catch (error) {
      console.error("Shared product save failed:", error);
      if (window.showToast) {
        window.showToast(error.message, "error");
      }
      return false;
    }
  },
  loadProducts: async () => {
    const apiUrl = window.PRODUCTS_API_URL || "/api/products";
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.ok) {
        const products = await response.json();
        if (Array.isArray(products) && products.length > 0) {
          localStorage.setItem("lashari_products", JSON.stringify(products));
          return products;
        }
      }
    } catch (error) {
      console.warn("Shared products API error:", error);
    }

    // Direct GitHub Raw Fallback (Always live for everyone)
    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/lasharicommunication/shop/main/data/products.json?_t=${Date.now()}`, { cache: "no-store" });
      if (rawRes.ok) {
        const rawProducts = await rawRes.json();
        if (Array.isArray(rawProducts) && rawProducts.length > 0) {
          localStorage.setItem("lashari_products", JSON.stringify(rawProducts));
          return rawProducts;
        }
      }
    } catch (rawError) {
      console.warn("Direct GitHub raw fallback unavailable:", rawError);
    }

    return Storage.getProducts();
  },
  getOrders: () => {
    const saved = localStorage.getItem("lashari_orders");
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  },
  saveOrders: (orders) => {
    localStorage.setItem("lashari_orders", JSON.stringify(orders));
  },
  addOrder: (newOrder) => {
    const orders = Storage.getOrders();
    orders.unshift(newOrder);
    Storage.saveOrders(orders);
    return orders;
  },
  getCoupons: () => {
    const saved = localStorage.getItem("lashari_coupons");
    return saved ? JSON.parse(saved) : DEFAULT_COUPONS;
  },
  saveCoupons: (coupons) => {
    localStorage.setItem("lashari_coupons", JSON.stringify(coupons));
  },
  resetDemoData: () => {
    localStorage.setItem("lashari_settings", JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem("lashari_brands", JSON.stringify(DEFAULT_BRANDS));
    localStorage.setItem("lashari_products", JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem("lashari_orders", JSON.stringify(DEFAULT_ORDERS));
    localStorage.setItem("lashari_coupons", JSON.stringify(DEFAULT_COUPONS));
  }
};

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
  collectionVisibleCount: 12,
  reviews: [],
  currentReviewPage: 0
};

const DEFAULT_SETTINGS = {
  brandName: "Lashari Communication",
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
    "id": "prod-1794126572312",
    "title": "usb",
    "category": "Power Bank",
    "brand": "samsung",
    "brandName": "Samsung",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1500,
    "oldPrice": null,
    "isOnSale": true,
    "rating": 4.8,
    "reviewsCount": 42,
    "stock": 25,
    "sizes": [],
    "colors": [
      {
        "name": "Silver / Grey",
        "hex": "#9ca3af"
      },
      {
        "name": "Gold / Champagne",
        "hex": "#d4af37"
      }
    ],
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80",
    "images": [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80",
      "https://i.postimg.cc/59Hnf0zP/images-(28).jpg"
    ],
    "description": "Premium authentic tech accessory backed with official checking warranty."
  },
  {
    "id": "prod-1794072150273",
    "title": "P47 Wireless Bluetooth Headphones – Foldable Over-Ear Stereo Headset with Built-in Mic, FM Radio & Micro SD Card Slot",
    "category": "Headphones",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1099,
    "oldPrice": 1999,
    "isOnSale": true,
    "rating": 4.7,
    "reviewsCount": 89,
    "stock": 250,
    "sizes": [],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      },
      {
        "name": "White",
        "hex": "#ffffff"
      },
      {
        "name": "Red",
        "hex": "#dc2626"
      },
      {
        "name": "Blue",
        "hex": "#3b82f6"
      },
      {
        "name": "Yellow",
        "hex": "#3b82f6"
      }
    ],
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/3R98qgt5/images.jpg",
    "images": [
      "https://i.postimg.cc/3R98qgt5/images.jpg",
      "https://i.postimg.cc/GpCbhMNd/images.jpg",
      "https://i.postimg.cc/Bbk0WNDR/images.jpg"
    ],
    "description": "Enjoy wireless freedom and crisp stereo sound with the P47 Wireless Bluetooth Headphones. Featuring an advanced Bluetooth 4.2+EDR chipset, these lightweight, foldable headphones deliver reliable connectivity and powerful audio performance for your daily commute, workouts, or relaxing at home. Designed with plush on-ear cushions and a collapsible frame, they combine portability with all-day comfort."
  },
  {
    "id": "prod-1794070609966",
    "title": "P9 Wireless Bluetooth Over-Ear Headphones – Premium Deep Bass Stereo Headset with Built-in Mic, Soft Cushion Earpads & SD Card Slot",
    "category": "Headphones",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1549,
    "oldPrice": 2699,
    "isOnSale": true,
    "rating": 4.9,
    "reviewsCount": 114,
    "stock": 250,
    "sizes": [],
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      },
      {
        "name": "White",
        "hex": "#ffffff"
      },
      {
        "name": "Pink",
        "hex": "#3b82f6"
      },
      {
        "name": "Blue",
        "hex": "#3b82f6"
      },
      {
        "name": "Green",
        "hex": "#3b82f6"
      }
    ],
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/zBFpWf0r/images.jpg",
    "images": [
      "https://i.postimg.cc/zBFpWf0r/images.jpg",
      "https://i.postimg.cc/fy0LpVFp/images.jpg",
      "https://i.postimg.cc/4NVvhydD/images.jpg",
      "https://i.postimg.cc/LsCjMZCB/images.jpg",
      "https://i.postimg.cc/qR66VD6L/images.jpg",
      "https://i.postimg.cc/ZKtpZmcw/images.jpg"
    ],
    "description": "Experience high-fidelity audio and all-day comfort with the P9 Wireless Over-Ear Bluetooth Headphones. Designed with a stylish breathable mesh headband and soft memory-foam ear cushions, these headphones deliver deep bass, clear highs, and passive noise isolation for immersive music listening, gaming, and calls."
  },
  {
    "id": "prod-1793905297002",
    "title": "3G PLUS ENJOYHOME G-18 10000mAh Power Bank – 10W Fast Charging Portable External Battery with Type-C Input & LED Indicator",
    "category": "Power Bank",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 2749,
    "oldPrice": 3699,
    "isOnSale": true,
    "rating": 4.8,
    "reviewsCount": 56,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/7PJh3rLb/3g-plus-10000mah-portable-power-bank-pakistan-priceoye-4hcjg.jpg",
    "images": [
      "https://i.postimg.cc/7PJh3rLb/3g-plus-10000mah-portable-power-bank-pakistan-priceoye-4hcjg.jpg"
    ],
    "description": "Keep your smartphones and gadgets powered up throughout the day with the 3G PLUS ENJOYHOME G-18 10000mAh Power Bank. Built with high-capacity battery cells to deliver stable power supply, this compact external battery features a sleek dual-texture body design, 10W output for fast charging, and a Type-C input port. An integrated 4-LED indicator light display lets you check your remaining charge at a glance."
  },
  {
    "id": "prod-1793904841319",
    "title": "VEN-DENS 10000mAh 22.5W Fast Charging Power Bank with Built-In Cables & Digital LED Display – Portable External Battery Pack",
    "category": "Power Bank",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 2899,
    "oldPrice": 4599,
    "isOnSale": true,
    "rating": 4.9,
    "reviewsCount": 98,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/0y0qYcmS/vens-dens-vd-pb061-20000-mah-power-bank-pakistan-priceoye-68prk-270x270.webp",
    "images": [
      "https://i.postimg.cc/0y0qYcmS/vens-dens-vd-pb061-20000-mah-power-bank-pakistan-priceoye-68prk-270x270.webp",
      "https://i.postimg.cc/8598p389/5c6752aeb35669ba978961b952959cb1.jpg"
    ],
    "description": "Never worry about low battery again with the VEN-DENS 10000mAh 22.5W Fast Charging Power Bank. Designed for maximum convenience, this high-performance external battery features integrated built-in output cables (Type-C and Lightning), allowing you to charge your devices without carrying extra wires. The digital LED display screen shows exact battery percentage levels at a glance."
  },
  {
    "id": "prod-1793904452863",
    "title": "USB to Lightning Fast Charging Cable – High-Speed Data Sync Charger Wire for iPhone & iPad",
    "category": "Cables",
    "brand": "apple",
    "brandName": "Apple",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 549,
    "oldPrice": 999,
    "isOnSale": true,
    "rating": 4.6,
    "reviewsCount": 31,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/CMQXk9QJ/download.jpg",
    "images": [
      "https://i.postimg.cc/CMQXk9QJ/download.jpg"
    ],
    "description": "Keep your devices charged and synced with this USB to Lightning Fast Charging Cable. Featuring a standard USB-A connector on one end and an 8-pin Lightning connector on the other, this cable provides reliable power delivery and fast data transfer for iPhones, iPads, and iPods. Its flexible, tangle-free design and reinforced strain relief ensure durable performance for everyday home, office, or travel use.",
    "sizes": [],
    "colors": []
  },
  {
    "id": "prod-1793904338351",
    "title": "Apple USB-C to Lightning Cable (1m) – Fast Charging & High-Speed Data Sync Wire",
    "category": "Cables",
    "brand": "apple",
    "brandName": "Apple",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 799,
    "oldPrice": 1499,
    "isOnSale": true,
    "rating": 5,
    "reviewsCount": 119,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/BZmsyhwB/iphone-e1747148396709.jpg",
    "images": [
      "https://i.postimg.cc/BZmsyhwB/iphone-e1747148396709.jpg"
    ],
    "description": "Connect your iPhone, iPad, or iPod with a Lightning connector to your USB-C or Thunderbolt 3 (USB-C) enabled Mac, iPad, or Power Adapter for seamless charging and syncing. The Apple USB-C to Lightning Cable (1m) supports Power Delivery fast charging, allowing you to quickly charge compatible iPhone models when paired with an Apple USB-C Power Adapter."
  },
  {
    "id": "prod-1793904116099",
    "title": "Type-C to Type-C Fast Charging Cable – High-Speed Data Sync & Power Delivery USB-C Wire",
    "category": "Cables",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 499,
    "oldPrice": 1099,
    "isOnSale": true,
    "rating": 4.8,
    "reviewsCount": 77,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/N0nmp7vF/2948-90-758288-product-1.webp",
    "images": [
      "https://i.postimg.cc/N0nmp7vF/2948-90-758288-product-1.webp",
      "https://i.postimg.cc/nr2Lwp9B/60W-USB-C-Charge-Cable-1-m.jpg"
    ],
    "description": "Upgrade your charging and data transfer setup with this USB Type-C to Type-C Fast Charging & Sync Cable. Designed for dual-way Type-C connectivity, this cable supports high-speed power delivery and fast data transmission across a wide variety of modern devices, including smartphones, tablets, laptops, and accessories. Built with durable TPE jacketing and reinforced connector strain reliefs to prevent fraying and ensure long-lasting daily performance."
  },
  {
    "id": "prod-1793903566247",
    "title": "Samsung 45W PD Power Adapter – Super Fast Charging Wall Charger with 5A/1.8m USB Type-C to C Cable",
    "category": "Charger",
    "brand": "samsung",
    "brandName": "Samsung",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1999,
    "oldPrice": 3849,
    "isOnSale": true,
    "rating": 4.9,
    "reviewsCount": 104,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/QtZPvsjL/Samsung-45W-PD-Power-Adapter-Qmart-2.jpg",
    "images": [
      "https://i.postimg.cc/QtZPvsjL/Samsung-45W-PD-Power-Adapter-Qmart-2.jpg"
    ],
    "description": "Power up your devices in no time with the Samsung 45W PD Power Adapter Set. Designed with a sleek, compact profile, this super-fast wall charger features a USB-C port and comes bundled with a high-capacity 5A USB Type-C to C cable (1.8 meters) for maximum charging efficiency. Perfect for charging smartphones, tablets, and compatible USB-C laptops reliably and quickly."
  },
  {
    "id": "prod-1793903332920",
    "title": "Infinix XPOS XPOWER GO 5000mAh Power Bank – 12W Fast Charger Portable External Battery Pack",
    "category": "Power Bank",
    "brand": "infinix",
    "brandName": "Infinix",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1499,
    "oldPrice": 3499,
    "isOnSale": true,
    "rating": 4.7,
    "reviewsCount": 26,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/W4Yz7WVR/2948-91-MZ2948200105ECAS-product-1.webp",
    "images": [
      "https://i.postimg.cc/W4Yz7WVR/2948-91-MZ2948200105ECAS-product-1.webp",
      "https://i.postimg.cc/59CywSRf/17865266151127276-120826142335411483.webp",
      "https://i.postimg.cc/7ZmZxsfc/73e24fdd341f45318dd4d946624e135a.jpg",
      "https://i.postimg.cc/GhjcQ7Jt/JR-BP005-9.png"
    ],
    "description": "Stay powered up on the go with the Infinix XPOS XPOWER GO 5000mAh Power Bank. Designed with a sleek, ultra-slim profile and vibrant color options, this 12W fast-charging power bank keeps your mobile devices charged wherever you are. Features 4 LED battery indicator lights for easy status tracking.",
    "sizes": [],
    "colors": [
      {
        "name": "Yellow",
        "hex": "#3b82f6"
      },
      {
        "name": "Blue",
        "hex": "#3b82f6"
      },
      {
        "name": "Light Purple",
        "hex": "#3b82f6"
      }
    ]
  },
  {
    "id": "prod-1793902399634",
    "title": "GTS-2008 Portable Karaoke Bluetooth Speaker with Wireless Microphone – 4 Inch Driver & LED Light Box Speaker",
    "category": "Speaker",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1899,
    "oldPrice": 2599,
    "isOnSale": true,
    "rating": 4.8,
    "reviewsCount": 65,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/4NHCS8Tr/b2d284ca43db918d6be760baa8c98c3d.jpg",
    "images": [
      "https://i.postimg.cc/4NHCS8Tr/b2d284ca43db918d6be760baa8c98c3d.jpg",
      "https://i.postimg.cc/rFG6TDKD/gts-2008-karaoke-speaker-with-mics-pakistan-priceoye-adwjf.jpg"
    ],
    "description": "Turn any space into a party with the GTS-2008 Portable Karaoke Speaker Set. Featuring a powerful 4-inch speaker driver, built-in RGB LED lights, and a dedicated wireless microphone, this sound system is perfect for karaoke sessions, outdoor gatherings, and casual listening. Designed with an ergonomic top handle for effortless portability."
  },
  {
    "id": "prod-1793902224355",
    "title": "GTS-1941 Portable Wireless Speaker with Microphone – 3 Inch Driver, LED Light & Handle Box Speaker",
    "category": "Speaker",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1599,
    "oldPrice": 2149,
    "isOnSale": true,
    "rating": 4.6,
    "reviewsCount": 19,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/bNrYNHfQ/S3636bd5757b2411f9767333aa8230367M.jpg",
    "images": [
      "https://i.postimg.cc/bNrYNHfQ/S3636bd5757b2411f9767333aa8230367M.jpg",
      "https://i.postimg.cc/xj7hMKbx/images.jpg"
    ],
    "description": "Bring the party anywhere with the GTS-1941 Portable Wireless Speaker with Microphone set. Featuring a 3-inch speaker driver, custom front LED lighting, and an included karaoke microphone, this speaker is built for music lovers, party hosts, and outdoor activities. The sturdy carrying handle makes it easy to transport while delivering loud, clear sound."
  },
  {
    "id": "prod-1793901838990",
    "title": "M3 Mini Portable Bluetooth Speaker – Wireless Pocket-Sized Sound Box with Strong Bass & Built-In Mic",
    "category": "Speaker",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1149,
    "oldPrice": 1799,
    "isOnSale": true,
    "rating": 4.7,
    "reviewsCount": 48,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/yx9PF3wm/154e97404cae36b5a781da00e5b12c82.png",
    "images": [
      "https://i.postimg.cc/yx9PF3wm/154e97404cae36b5a781da00e5b12c82.png",
      "https://i.postimg.cc/wjP1d4t0/8b9ab8b89dd38c76a14fc637dd79137a.jpg"
    ],
    "description": "Experience big sound on the go with the M3 Mini Portable Bluetooth Speaker. Designed to fit in the palm of your hand or pocket, this compact wireless speaker delivers surprisingly loud volume and crisp audio clarity, making it perfect for travel, outdoor activities, or daily indoor use."
  },
  {
    "id": "prod-1793561560126",
    "title": "Futuristic Red Gaming Wireless Earbuds with Breathing LED Charging Case",
    "category": "Earbuds",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1749,
    "oldPrice": 2499,
    "isOnSale": true,
    "rating": 4.9,
    "reviewsCount": 83,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/rwDc6ptv/61v-Pt-Py4c-L-jpg-BO30-255-255-255-UF750-750-SR1910-1000-0-C-QL100.jpg",
    "images": [
      "https://i.postimg.cc/rwDc6ptv/61v-Pt-Py4c-L-jpg-BO30-255-255-255-UF750-750-SR1910-1000-0-C-QL100.jpg"
    ],
    "description": "Elevate your audio and gaming setup with these futuristic red wireless earbuds. Featuring a stylish metallic-finish charging case highlighted by a vibrant circular LED ring, this pair offers sleek modern aesthetics along with powerful dynamic sound performance.",
    "colors": [
      "Cyber Red",
      "Stealth Black"
    ]
  },
  {
    "id": "prod-1793560651128",
    "title": "Pro 2 Wireless Earphones with Active Noise Cancellation (ANC) & Charging Case",
    "category": "Earbuds",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1549,
    "oldPrice": 2199,
    "isOnSale": true,
    "rating": 5,
    "reviewsCount": 112,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/7hZf8k4J/images.jpg",
    "images": [
      "https://i.postimg.cc/7hZf8k4J/images.jpg",
      "https://i.postimg.cc/mg5q7Nkj/images.jpg"
    ],
    "description": "Experience premium sound quality and advanced Active Noise Cancellation (ANC) with the Apple AirPods Pro. This package includes the wireless earbuds, charging case, a lanyard strap, and official packaging featuring a Redingonton 12-month warranty seal.   Active Noise Cancellation (ANC): Blocks out unwanted background noise for an immersive listening experience.   Ergonomic Design: Includes customizable silicone tips for a secure, comfortable fit.Charging Case: Sleek, white MagSafe-compatible case with a built-in lanyard loop.   Warranty: Backed by a 12-month Redington warranty sticker."
  },
  {
    "id": "prod-1793611576137",
    "title": "M10 TWS Stereo Wireless Headphones – Touch Control Sports Earbuds with Built-in Mic & Power Bank Feature",
    "category": "Earbuds",
    "brand": "general",
    "brandName": "Universal Tech",
    "compatibleModels": [
      "Universal Device Compatibility"
    ],
    "price": 1199,
    "oldPrice": 1999,
    "isOnSale": true,
    "rating": 4.8,
    "reviewsCount": 61,
    "stock": 2500,
    "isFeatured": true,
    "badge": "Sale Item",
    "image": "https://i.postimg.cc/7LwP89H7/images.jpg",
    "images": [
      "https://i.postimg.cc/7LwP89H7/images.jpg",
      "https://i.postimg.cc/dVqQgntT/tws-m10-earbuds-bluetooth-51-earphones-3500mah-charging-box-wireless-stereo-370383.jpg",
      "https://i.postimg.cc/dtncZFwS/images.jpg"
    ],
    "description": "Elevate your daily listening with the M10 TWS Wireless Earbuds. Engineered for seamless audio quality, clear calls, and all-day comfort, the M10 features advanced Bluetooth 5.1 technology for a fast, stable, and lag-free connection.\n\nKey Features:\n\nHD Stereo Sound & Deep Bass: Premium dynamic drivers deliver clear highs and rich bass for an immersive music experience.\n\nSmart LED Digital Display: Easily check the exact remaining battery percentage of both the charging case and individual earbuds at a glance.\n\nHigh-Capacity Charging Case: The included battery case not only recharges your earbuds multiple times on the go, but also doubles as an emergency power bank for your mobile phone.\n\nIntuitive Touch Controls: Manage music playback, answer or reject calls, adjust volume, and activate your voice assistant with simple taps.\n\nErgonomic & Sweatproof: Designed for a secure, comfortable fit during workouts, running, or daily commutes, featuring IPX7 sweat and splash resistance.\n\nAutomatic Pairing: Simply remove the earbuds from the case, and they immediately connect to your paired device.\n\nWhat’s in the Box:\n\n2 x M10 Wireless Earbuds (Left & Right)\n\n1 x Smart LED Charging Case\n\n1 x USB Charging Cable\n\n3 x Pairs of Silicone Ear Tips (S / M / L)\n\n1 x User Manual",
    "colors": [
      {
        "name": "Black",
        "hex": "#111111"
      }
    ],
    "sizes": []
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
      if (!parsed._brand_lashari_sync_v1 || !parsed.brandName || parsed.brandName.toLowerCase() === "xcess") {
        parsed.brandName = "Lashari Communication";
        parsed.brandDot = ".";
        parsed._brand_lashari_sync_v1 = true;
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
      if (!parsed.googleMapsUrl) {
        parsed.googleMapsUrl = "https://share.google/iiBvxUjHqCga5PFY1";
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
  saveSettings: async (settings) => {
    localStorage.setItem("lashari_settings", JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("lashari:settings-updated", { detail: settings }));

    const apiUrl = window.SETTINGS_API_URL || "/api/settings";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings })
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
      console.error("Shared settings save failed:", error);
      return false;
    }
  },
  loadSettings: async () => {
    const apiUrl = window.SETTINGS_API_URL || "/api/settings";
    try {
      const response = await fetch(apiUrl, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const settings = (data && data.settings) ? data.settings : data;
        if (settings && typeof settings === "object" && settings.brandName) {
          localStorage.setItem("lashari_settings", JSON.stringify(settings));
          window.dispatchEvent(new CustomEvent("lashari:settings-updated", { detail: settings }));
          return settings;
        }
      }
    } catch (error) {
      console.warn("Shared settings API error:", error);
    }

    // Direct GitHub Raw Fallback (Always live for everyone)
    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/lasharicommunication/shop/main/data/settings.json?_t=${Date.now()}`, { cache: "no-store" });
      if (rawRes.ok) {
        const rawSettings = await rawRes.json();
        if (rawSettings && typeof rawSettings === "object" && rawSettings.brandName) {
          localStorage.setItem("lashari_settings", JSON.stringify(rawSettings));
          window.dispatchEvent(new CustomEvent("lashari:settings-updated", { detail: rawSettings }));
          return rawSettings;
        }
      }
    } catch (rawError) {
      console.warn("Direct GitHub raw settings fallback unavailable:", rawError);
    }

    return Storage.getSettings();
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

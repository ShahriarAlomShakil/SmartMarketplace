const mongoose = require('mongoose');
require('dotenv').config();

console.log('📡 Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-marketplace');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-marketplace')
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Product schema (simplified for script)
const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  subcategory: String,
  condition: String,
  brand: String,
  model: String,
  images: [String],
  pricing: {
    basePrice: Number,
    minPrice: Number,
    currency: String,
    negotiable: Boolean
  },
  priceRange: {
    min: Number,
    max: Number,
    difference: Number,
    negotiabilityPercentage: String
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    shippingAvailable: Boolean,
    localPickupOnly: Boolean
  },
  specifications: {
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: String
    },
    customFields: [Object]
  },
  tags: [String],
  status: { type: String, default: 'active' },
  urgency: {
    level: String,
    expiresAt: Date
  },
  availability: {
    quantity: Number,
    reservedQuantity: { type: Number, default: 0 }
  },
  availableQuantity: { type: Number, default: 1 },
  analytics: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    negotiations: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    averageOfferPrice: { type: Number, default: 0 },
    impressions: [Date]
  },
  featured: {
    isFeatured: { type: Boolean, default: false },
    featuredLevel: { type: String, default: 'basic' }
  },
  primaryImage: String,
  url: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: Date
});

const Product = mongoose.model('Product', productSchema);

// Generate 10 diverse products
const products = [
  {
    title: "MacBook Pro 16-inch M3",
    description: "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for professional work and creative tasks. Includes original charger and box.",
    category: "electronics",
    subcategory: "laptops",
    condition: "like-new",
    brand: "Apple",
    model: "MacBook Pro 16-inch",
    pricing: {
      basePrice: 2200,
      minPrice: 2000,
      currency: "USD",
      negotiable: true
    },
    tags: ["laptop", "apple", "macbook", "professional", "m3"],
    urgency: { level: "medium" },
    availability: { quantity: 1 }
  },
  {
    title: "Vintage Gibson Les Paul Guitar",
    description: "1970s Gibson Les Paul Standard in sunburst finish. Original hardware, professionally maintained. Great sound and playability.",
    category: "musical-instruments",
    subcategory: "guitars",
    condition: "good",
    brand: "Gibson",
    model: "Les Paul Standard",
    pricing: {
      basePrice: 3500,
      minPrice: 3200,
      currency: "USD",
      negotiable: true
    },
    tags: ["guitar", "gibson", "vintage", "electric", "music"],
    urgency: { level: "low" },
    availability: { quantity: 1 }
  },
  {
    title: "Modern Minimalist Sofa",
    description: "Contemporary 3-seater sofa in charcoal gray fabric. Clean lines, comfortable cushions. Perfect for modern living rooms.",
    category: "furniture",
    subcategory: "seating",
    condition: "excellent",
    brand: "West Elm",
    pricing: {
      basePrice: 800,
      minPrice: 700,
      currency: "USD",
      negotiable: true
    },
    tags: ["sofa", "furniture", "modern", "minimalist", "living-room"],
    urgency: { level: "medium" },
    availability: { quantity: 1 }
  },
  {
    title: "Professional DSLR Camera Kit",
    description: "Canon EOS 5D Mark IV with 24-70mm lens, battery grip, extra batteries, and camera bag. Low shutter count, excellent condition.",
    category: "electronics",
    subcategory: "cameras",
    condition: "excellent",
    brand: "Canon",
    model: "EOS 5D Mark IV",
    pricing: {
      basePrice: 1800,
      minPrice: 1600,
      currency: "USD",
      negotiable: true
    },
    tags: ["camera", "dslr", "canon", "photography", "professional"],
    urgency: { level: "medium" },
    availability: { quantity: 1 }
  },
  {
    title: "Diamond Engagement Ring",
    description: "Beautiful 1.5 carat diamond solitaire ring in 14K white gold. GIA certified, excellent cut. Size 6, can be resized.",
    category: "jewelry",
    subcategory: "rings",
    condition: "like-new",
    pricing: {
      basePrice: 8000,
      minPrice: 7500,
      currency: "USD",
      negotiable: true
    },
    tags: ["diamond", "engagement", "ring", "jewelry", "gold"],
    urgency: { level: "low" },
    availability: { quantity: 1 }
  },
  {
    title: "Mountain Bike - Trek X-Caliber",
    description: "2023 Trek X-Caliber 8 mountain bike, size Large. 29-inch wheels, 12-speed Shimano drivetrain. Great for trails and commuting.",
    category: "sports",
    subcategory: "bicycles",
    condition: "good",
    brand: "Trek",
    model: "X-Caliber 8",
    pricing: {
      basePrice: 1200,
      minPrice: 1000,
      currency: "USD",
      negotiable: true
    },
    tags: ["bike", "mountain-bike", "trek", "cycling", "outdoor"],
    urgency: { level: "medium" },
    availability: { quantity: 1 }
  },
  {
    title: "Rare Pokemon Card Collection",
    description: "First edition Charizard and other rare Pokemon cards from Base Set. All cards in near mint condition, authenticated and graded.",
    category: "collectibles",
    subcategory: "trading-cards",
    condition: "excellent",
    pricing: {
      basePrice: 15000,
      minPrice: 14000,
      currency: "USD",
      negotiable: true
    },
    tags: ["pokemon", "cards", "collectible", "rare", "vintage"],
    urgency: { level: "low" },
    availability: { quantity: 1 }
  },
  {
    title: "Designer Handbag - Louis Vuitton",
    description: "Authentic Louis Vuitton Neverfull MM in Damier Ebene canvas. Excellent condition, comes with authenticity certificate and dust bag.",
    category: "fashion",
    subcategory: "handbags",
    condition: "excellent",
    brand: "Louis Vuitton",
    model: "Neverfull MM",
    pricing: {
      basePrice: 1400,
      minPrice: 1250,
      currency: "USD",
      negotiable: true
    },
    tags: ["handbag", "louis-vuitton", "designer", "luxury", "authentic"],
    urgency: { level: "medium" },
    availability: { quantity: 1 }
  },
  {
    title: "Gaming Setup - RTX 4080 PC",
    description: "High-end gaming PC with RTX 4080, Intel i7-13700K, 32GB DDR5 RAM, 2TB NVMe SSD. Perfect for 4K gaming and streaming.",
    category: "electronics",
    subcategory: "computers",
    condition: "like-new",
    pricing: {
      basePrice: 2800,
      minPrice: 2500,
      currency: "USD",
      negotiable: true
    },
    tags: ["gaming", "pc", "rtx-4080", "computer", "high-end"],
    urgency: { level: "high" },
    availability: { quantity: 1 }
  },
  {
    title: "Antique Persian Rug",
    description: "Beautiful hand-woven Persian rug, approximately 100 years old. 8x10 feet, intricate patterns in rich colors. Museum quality piece.",
    category: "home-decor",
    subcategory: "rugs",
    condition: "good",
    pricing: {
      basePrice: 5000,
      minPrice: 4500,
      currency: "USD",
      negotiable: true
    },
    tags: ["rug", "persian", "antique", "handmade", "vintage"],
    urgency: { level: "low" },
    availability: { quantity: 1 }
  }
];

async function generateProducts() {
  try {
    console.log('🚀 Starting product generation...');
    
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      // Calculate price range
      const difference = productData.pricing.basePrice - productData.pricing.minPrice;
      const negotiabilityPercentage = ((difference / productData.pricing.basePrice) * 100).toFixed(2);
      
      productData.priceRange = {
        min: productData.pricing.minPrice,
        max: productData.pricing.basePrice,
        difference: difference,
        negotiabilityPercentage: negotiabilityPercentage
      };
      
      // Set default values
      productData.images = [];
      productData.seller = null;
      productData.location = {
        coordinates: {},
        shippingAvailable: false,
        localPickupOnly: true
      };
      productData.specifications = {
        dimensions: { unit: "cm" },
        customFields: []
      };
      productData.analytics = {
        views: Math.floor(Math.random() * 100),
        favorites: Math.floor(Math.random() * 20),
        negotiations: Math.floor(Math.random() * 10),
        inquiries: Math.floor(Math.random() * 15),
        averageOfferPrice: 0,
        impressions: []
      };
      productData.featured = {
        isFeatured: false,
        featuredLevel: "basic"
      };
      productData.primaryImage = null;
      productData.status = "active";
      productData.availableQuantity = 1;
      
      // Set expiration date (30 days from now)
      productData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Generate URL
      const product = new Product(productData);
      productData.url = `/products/${product._id}`;
      
      const savedProduct = await Product.create(productData);
      console.log(`✅ Created product ${i + 1}: ${savedProduct.title}`);
    }
    
    console.log('🎉 Successfully generated 10 products!');
    
    // Display summary
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products in database: ${totalProducts}`);
    
  } catch (error) {
    console.error('❌ Error generating products:', error);
  } finally {
    mongoose.connection.close();
  }
}

generateProducts();

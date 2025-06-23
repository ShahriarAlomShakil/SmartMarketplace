// Simple product generator using existing models
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function main() {
  console.log('Starting product generation...');
  
  try {
    // Import the database connection and models
    const connectDB = require('./src/config/database');
    const Product = require('./src/models/Product');
    
    // Connect to database
    await connectDB();
    console.log('Database connected successfully');
    
    // Product data
    const products = [
      {
        title: "MacBook Pro 16-inch M3",
        description: "Latest MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for professional work and creative tasks. Includes original charger and box.",
        category: "electronics",
        condition: "like-new",
        pricing: { basePrice: 2200, minPrice: 2000, currency: "USD", negotiable: true },
        tags: ["laptop", "apple", "macbook", "professional", "m3"]
      },
      {
        title: "Vintage Gibson Les Paul Guitar",
        description: "1970s Gibson Les Paul Standard in sunburst finish. Original hardware, professionally maintained. Great sound and playability.",
        category: "musical-instruments",
        condition: "good",
        pricing: { basePrice: 3500, minPrice: 3200, currency: "USD", negotiable: true },
        tags: ["guitar", "gibson", "vintage", "electric", "music"]
      },
      {
        title: "Modern Minimalist Sofa",
        description: "Contemporary 3-seater sofa in charcoal gray fabric. Clean lines, comfortable cushions. Perfect for modern living rooms.",
        category: "furniture",
        condition: "excellent",
        pricing: { basePrice: 800, minPrice: 700, currency: "USD", negotiable: true },
        tags: ["sofa", "furniture", "modern", "minimalist", "living-room"]
      },
      {
        title: "Professional DSLR Camera Kit",
        description: "Canon EOS 5D Mark IV with 24-70mm lens, battery grip, extra batteries, and camera bag. Low shutter count, excellent condition.",
        category: "electronics",
        condition: "excellent",
        pricing: { basePrice: 1800, minPrice: 1600, currency: "USD", negotiable: true },
        tags: ["camera", "dslr", "canon", "photography", "professional"]
      },
      {
        title: "Diamond Engagement Ring",
        description: "Beautiful 1.5 carat diamond solitaire ring in 14K white gold. GIA certified, excellent cut. Size 6, can be resized.",
        category: "jewelry",
        condition: "like-new",
        pricing: { basePrice: 8000, minPrice: 7500, currency: "USD", negotiable: true },
        tags: ["diamond", "engagement", "ring", "jewelry", "gold"]
      },
      {
        title: "Mountain Bike - Trek X-Caliber",
        description: "2023 Trek X-Caliber 8 mountain bike, size Large. 29-inch wheels, 12-speed Shimano drivetrain. Great for trails and commuting.",
        category: "sports",
        condition: "good",
        pricing: { basePrice: 1200, minPrice: 1000, currency: "USD", negotiable: true },
        tags: ["bike", "mountain-bike", "trek", "cycling", "outdoor"]
      },
      {
        title: "Rare Pokemon Card Collection",
        description: "First edition Charizard and other rare Pokemon cards from Base Set. All cards in near mint condition, authenticated and graded.",
        category: "collectibles",
        condition: "excellent",
        pricing: { basePrice: 15000, minPrice: 14000, currency: "USD", negotiable: true },
        tags: ["pokemon", "cards", "collectible", "rare", "vintage"]
      },
      {
        title: "Designer Handbag - Louis Vuitton",
        description: "Authentic Louis Vuitton Neverfull MM in Damier Ebene canvas. Excellent condition, comes with authenticity certificate and dust bag.",
        category: "fashion",
        condition: "excellent",
        pricing: { basePrice: 1400, minPrice: 1250, currency: "USD", negotiable: true },
        tags: ["handbag", "louis-vuitton", "designer", "luxury", "authentic"]
      },
      {
        title: "Gaming Setup - RTX 4080 PC",
        description: "High-end gaming PC with RTX 4080, Intel i7-13700K, 32GB DDR5 RAM, 2TB NVMe SSD. Perfect for 4K gaming and streaming.",
        category: "electronics",
        condition: "like-new",
        pricing: { basePrice: 2800, minPrice: 2500, currency: "USD", negotiable: true },
        tags: ["gaming", "pc", "rtx-4080", "computer", "high-end"]
      },
      {
        title: "Antique Persian Rug",
        description: "Beautiful hand-woven Persian rug, approximately 100 years old. 8x10 feet, intricate patterns in rich colors. Museum quality piece.",
        category: "home-decor",
        condition: "good",
        pricing: { basePrice: 5000, minPrice: 4500, currency: "USD", negotiable: true },
        tags: ["rug", "persian", "antique", "handmade", "vintage"]
      }
    ];
    
    let created = 0;
    for (const productData of products) {
      try {
        const product = await Product.create(productData);
        console.log(`✅ Created: ${product.title}`);
        created++;
      } catch (error) {
        console.error(`❌ Failed to create ${productData.title}:`, error.message);
      }
    }
    
    const total = await Product.countDocuments();
    console.log(`\n🎉 Successfully created ${created} products!`);
    console.log(`📊 Total products in database: ${total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

main();

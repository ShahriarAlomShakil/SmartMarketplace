const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');

class DatabaseSeeder {
  constructor() {
    this.users = [];
    this.products = [];
    this.negotiations = [];
  }

  // Main seeding function
  async seed() {
    console.log('🌱 Starting database seeding...');
    
    try {
      // Check if database is already seeded
      const userCount = await User.countDocuments();
      if (userCount > 0) {
        console.log('📚 Database already contains data, skipping seed');
        return;
      }

      await this.createUsers();
      await this.createProducts();
      await this.createNegotiations();
      
      console.log('🎉 Database seeding completed successfully!');
      this.printSeedingSummary();
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  // Create sample users
  async createUsers() {
    console.log('👥 Creating sample users...');
    
    const sampleUsers = [
      {
        username: 'admin',
        email: 'admin@smartmarketplace.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        profile: {
          bio: 'Platform administrator',
          verificationStatus: {
            email: true,
            phone: true,
            identity: true,
            address: true
          },
          rating: { average: 5.0, count: 1, reviews: [] }
        }
      },
      {
        username: 'johnSeller',
        email: 'john@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'seller',
        isVerified: true,
        profile: {
          bio: 'Electronics enthusiast selling quality gadgets',
          location: {
            city: 'San Francisco',
            state: 'CA',
            country: 'USA'
          },
          verificationStatus: {
            email: true,
            phone: true,
            identity: false,
            address: false
          },
          rating: { average: 4.5, count: 23, reviews: [] }
        }
      },
      {
        username: 'sarahBuyer',
        email: 'sarah@example.com',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Smith',
        role: 'buyer',
        isVerified: true,
        profile: {
          bio: 'Love finding great deals on unique items',
          location: {
            city: 'New York',
            state: 'NY',
            country: 'USA'
          },
          verificationStatus: {
            email: true,
            phone: false,
            identity: false,
            address: false
          },
          rating: { average: 4.8, count: 15, reviews: [] }
        }
      },
      {
        username: 'mikeTech',
        email: 'mike@example.com',
        password: 'Password123!',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'seller',
        isVerified: true,
        profile: {
          bio: 'Tech collector with rare vintage computers',
          location: {
            city: 'Austin',
            state: 'TX',
            country: 'USA'
          },
          verificationStatus: {
            email: true,
            phone: true,
            identity: true,
            address: false
          },
          rating: { average: 4.9, count: 31, reviews: [] }
        }
      },
      {
        username: 'emilyArt',
        email: 'emily@example.com',
        password: 'Password123!',
        firstName: 'Emily',
        lastName: 'Chen',
        role: 'seller',
        isVerified: true,
        profile: {
          bio: 'Artist selling handmade crafts and vintage finds',
          location: {
            city: 'Portland',
            state: 'OR',
            country: 'USA'
          },
          verificationStatus: {
            email: true,
            phone: false,
            identity: false,
            address: false
          },
          rating: { average: 4.7, count: 18, reviews: [] }
        }
      }
    ];

    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await user.save();
      this.users.push(savedUser);
    }
    
    console.log(`✅ Created ${this.users.length} users`);
  }

  // Create sample products
  async createProducts() {
    console.log('📦 Creating sample products...');
    
    const sellers = this.users.filter(u => u.role === 'seller');
    
    const sampleProducts = [
      {
        title: 'iPhone 13 Pro Max 256GB',
        description: 'Excellent condition iPhone 13 Pro Max with 256GB storage. Includes original box, charger, and protective case. Battery health at 95%. No scratches or damage.',
        category: 'electronics',
        subcategory: 'smartphones',
        condition: 'excellent',
        brand: 'Apple',
        model: 'iPhone 13 Pro Max',
        pricing: { basePrice: 899, minPrice: 750, currency: 'USD', negotiable: true },
        seller: sellers[0]._id,
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        tags: ['iphone', 'apple', 'smartphone', '5g'],
        urgency: { level: 'medium' },
        images: [{
          url: '/uploads/products/iphone13-1.jpg',
          alt: 'iPhone 13 Pro Max front view',
          isPrimary: true
        }]
      },
      {
        title: 'MacBook Pro 14" M1 Pro',
        description: 'Like-new MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, 512GB SSD. Perfect for development and creative work. Includes original packaging and accessories.',
        category: 'electronics',
        subcategory: 'laptops',
        condition: 'like_new',
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        pricing: { basePrice: 1899, minPrice: 1650, currency: 'USD', negotiable: true },
        seller: sellers[1]._id,
        location: { city: 'Austin', state: 'TX', country: 'USA' },
        tags: ['macbook', 'apple', 'laptop', 'm1', 'pro'],
        urgency: { level: 'low' },
        images: [{
          url: '/uploads/products/macbook-1.jpg',
          alt: 'MacBook Pro 14 inch',
          isPrimary: true
        }]
      },
      {
        title: 'Vintage Leather Jacket',
        description: 'Authentic vintage leather jacket from the 1980s. Genuine cowhide leather, excellent craftsmanship. Size Large. Perfect for collectors or fashion enthusiasts.',
        category: 'clothing',
        subcategory: 'jackets',
        condition: 'good',
        brand: 'Vintage',
        pricing: { basePrice: 299, minPrice: 220, currency: 'USD', negotiable: true },
        seller: sellers[2]._id,
        location: { city: 'Portland', state: 'OR', country: 'USA' },
        tags: ['vintage', 'leather', 'jacket', '80s', 'fashion'],
        urgency: { level: 'high' },
        images: [{
          url: '/uploads/products/leather-jacket-1.jpg',
          alt: 'Vintage leather jacket',
          isPrimary: true
        }]
      },
      {
        title: 'Canon EOS R5 Camera',
        description: 'Professional mirrorless camera in excellent condition. 45MP full-frame sensor, 8K video recording. Includes battery, charger, and neck strap. Low shutter count.',
        category: 'electronics',
        subcategory: 'cameras',
        condition: 'excellent',
        brand: 'Canon',
        model: 'EOS R5',
        pricing: { basePrice: 2799, minPrice: 2400, currency: 'USD', negotiable: true },
        seller: sellers[0]._id,
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        tags: ['canon', 'camera', 'mirrorless', 'professional', '8k'],
        urgency: { level: 'medium' },
        images: [{
          url: '/uploads/products/canon-r5-1.jpg',
          alt: 'Canon EOS R5 camera',
          isPrimary: true
        }]
      },
      {
        title: 'Handmade Ceramic Vase Set',
        description: 'Beautiful set of 3 handmade ceramic vases. Unique glazing technique creates stunning color variations. Perfect for home decoration or as a gift.',
        category: 'art',
        subcategory: 'ceramics',
        condition: 'new',
        pricing: { basePrice: 149, minPrice: 110, currency: 'USD', negotiable: true },
        seller: sellers[2]._id,
        location: { city: 'Portland', state: 'OR', country: 'USA' },
        tags: ['handmade', 'ceramic', 'vase', 'art', 'decoration'],
        urgency: { level: 'low' },
        images: [{
          url: '/uploads/products/ceramic-vases-1.jpg',
          alt: 'Handmade ceramic vase set',
          isPrimary: true
        }]
      },
      {
        title: 'Sony PlayStation 5',
        description: 'Brand new PlayStation 5 console, still sealed in original packaging. Includes DualSense controller, HDMI cable, and power cord. Ready to ship.',
        category: 'electronics',
        subcategory: 'gaming',
        condition: 'new',
        brand: 'Sony',
        model: 'PlayStation 5',
        pricing: { basePrice: 599, minPrice: 550, currency: 'USD', negotiable: true },
        seller: sellers[1]._id,
        location: { city: 'Austin', state: 'TX', country: 'USA' },
        tags: ['ps5', 'playstation', 'gaming', 'console', 'sony'],
        urgency: { level: 'high' },
        images: [{
          url: '/uploads/products/ps5-1.jpg',
          alt: 'Sony PlayStation 5',
          isPrimary: true
        }]
      }
    ];

    for (const productData of sampleProducts) {
      const product = new Product(productData);
      const savedProduct = await product.save();
      this.products.push(savedProduct);
    }
    
    console.log(`✅ Created ${this.products.length} products`);
  }

  // Create sample negotiations
  async createNegotiations() {
    console.log('💬 Creating sample negotiations...');
    
    const buyers = this.users.filter(u => u.role === 'buyer');
    const products = this.products.slice(0, 3); // Use first 3 products
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const buyer = buyers[i % buyers.length];
      
      const initialOffer = product.pricing.basePrice * 0.8; // 20% discount offer
      
      const negotiation = new Negotiation({
        product: product._id,
        buyer: buyer._id,
        seller: product.seller,
        pricing: {
          initialOffer,
          currentOffer: initialOffer
        },
        status: 'in_progress',
        messages: [
          {
            sender: 'buyer',
            type: 'offer',
            content: `Hi! I'm interested in your ${product.title}. Would you accept $${initialOffer}?`,
            offer: {
              amount: initialOffer,
              currency: 'USD'
            }
          },
          {
            sender: 'ai',
            type: 'counter_offer',
            content: `Thanks for your interest! That's a good offer, but I was hoping for something closer to $${product.pricing.basePrice * 0.9}. How does that sound?`,
            offer: {
              amount: product.pricing.basePrice * 0.9,
              currency: 'USD'
            },
            metadata: {
              aiModel: 'gemini-pro',
              confidence: 0.8
            }
          }
        ],
        rounds: 2
      });
      
      const savedNegotiation = await negotiation.save();
      this.negotiations.push(savedNegotiation);
    }
    
    console.log(`✅ Created ${this.negotiations.length} negotiations`);
  }

  // Print seeding summary
  printSeedingSummary() {
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`👥 Users: ${this.users.length}`);
    console.log(`📦 Products: ${this.products.length}`);
    console.log(`💬 Negotiations: ${this.negotiations.length}`);
    console.log('\n🔐 Default Admin Credentials:');
    console.log('Email: admin@smartmarketplace.com');
    console.log('Password: Admin123!');
    console.log('\n🧪 Test User Credentials:');
    console.log('Seller: john@example.com / Password123!');
    console.log('Buyer: sarah@example.com / Password123!');
  }

  // Clear all data (for development/testing)
  async clearDatabase() {
    console.log('🗑️ Clearing database...');
    
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Negotiation.deleteMany({})
    ]);
    
    console.log('✅ Database cleared');
  }

  // Seed specific collection
  async seedCollection(collectionName) {
    switch (collectionName) {
      case 'users':
        await this.createUsers();
        break;
      case 'products':
        await this.createProducts();
        break;
      case 'negotiations':
        await this.createNegotiations();
        break;
      default:
        throw new Error(`Unknown collection: ${collectionName}`);
    }
  }
}

module.exports = DatabaseSeeder;

const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Negotiation = require('../models/Negotiation');

class DatabaseMigrations {
  constructor() {
    this.migrations = [
      {
        version: '1.0.0',
        name: 'initial_setup',
        description: 'Initial database setup with indexes',
        up: this.initialSetup.bind(this)
      },
      {
        version: '1.1.0',
        name: 'add_user_stats',
        description: 'Add user statistics fields',
        up: this.addUserStats.bind(this)
      },
      {
        version: '1.2.0',
        name: 'add_product_analytics',
        description: 'Add product analytics and SEO fields',
        up: this.addProductAnalytics.bind(this)
      },
      {
        version: '1.3.0',
        name: 'add_negotiation_timeline',
        description: 'Add timeline and analytics to negotiations',
        up: this.addNegotiationTimeline.bind(this)
      }
    ];
  }

  // Get current migration version
  async getCurrentVersion() {
    try {
      const collection = mongoose.connection.db.collection('migrations');
      const migration = await collection.findOne({}, { sort: { version: -1 } });
      return migration ? migration.version : '0.0.0';
    } catch (error) {
      console.log('No migration collection found, starting fresh');
      return '0.0.0';
    }
  }

  // Save migration version
  async saveMigrationVersion(version, name) {
    const collection = mongoose.connection.db.collection('migrations');
    await collection.insertOne({
      version,
      name,
      timestamp: new Date(),
      applied: true
    });
  }

  // Run all pending migrations
  async runMigrations() {
    console.log('🔄 Checking for database migrations...');
    
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(m => 
      this.compareVersions(m.version, currentVersion) > 0
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date');
      return;
    }

    console.log(`📝 Found ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`⚡ Running migration: ${migration.name} (v${migration.version})`);
        await migration.up();
        await this.saveMigrationVersion(migration.version, migration.name);
        console.log(`✅ Migration ${migration.name} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.name} failed:`, error);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully');
  }

  // Compare version strings
  compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;
      
      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }
    
    return 0;
  }

  // Migration: Initial setup
  async initialSetup() {
    console.log('🏗️ Setting up initial database indexes...');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ 'profile.rating.average': -1 });
    
    // Product indexes
    await Product.collection.createIndex({ title: 'text', description: 'text', tags: 'text' });
    await Product.collection.createIndex({ category: 1, status: 1 });
    await Product.collection.createIndex({ seller: 1, status: 1 });
    await Product.collection.createIndex({ 'pricing.basePrice': 1 });
    await Product.collection.createIndex({ 'location.coordinates': '2dsphere' });
    
    // Negotiation indexes
    await Negotiation.collection.createIndex({ product: 1, buyer: 1 }, { unique: true });
    await Negotiation.collection.createIndex({ seller: 1, status: 1 });
    await Negotiation.collection.createIndex({ createdAt: -1 });
  }

  // Migration: Add user stats
  async addUserStats() {
    console.log('📊 Adding user statistics fields...');
    
    await User.updateMany(
      { stats: { $exists: false } },
      {
        $set: {
          stats: {
            productsListed: 0,
            productsSold: 0,
            productsBought: 0,
            totalEarnings: 0,
            totalSpent: 0,
            successfulNegotiations: 0,
            averageNegotiationTime: 0,
            joinDate: new Date(),
            lastActive: new Date()
          }
        }
      }
    );
  }

  // Migration: Add product analytics
  async addProductAnalytics() {
    console.log('📈 Adding product analytics and SEO fields...');
    
    await Product.updateMany(
      { analytics: { $exists: false } },
      {
        $set: {
          analytics: {
            views: 0,
            favorites: 0,
            negotiations: 0,
            inquiries: 0,
            averageOfferPrice: 0,
            impressions: []
          },
          seo: {
            metaTitle: '',
            metaDescription: '',
            keywords: [],
            slug: ''
          }
        }
      }
    );
  }

  // Migration: Add negotiation timeline
  async addNegotiationTimeline() {
    console.log('⏰ Adding negotiation timeline and analytics...');
    
    await Negotiation.updateMany(
      { timeline: { $exists: false } },
      {
        $set: {
          timeline: [],
          analytics: {
            startTime: new Date(),
            totalMessages: 0,
            averageResponseTime: 0,
            priceMovement: {
              direction: 'stable',
              magnitude: 0,
              percentage: 0
            },
            sentimentAnalysis: {
              overall: 'neutral',
              trend: 'stable',
              confidence: 0.5
            },
            responseTimeHistory: []
          }
        }
      }
    );
  }

  // Rollback last migration (for development)
  async rollbackLastMigration() {
    console.log('🔄 Rolling back last migration...');
    
    const collection = mongoose.connection.db.collection('migrations');
    const lastMigration = await collection.findOne({}, { sort: { version: -1 } });
    
    if (!lastMigration) {
      console.log('No migrations to rollback');
      return;
    }

    // Remove the migration record
    await collection.deleteOne({ _id: lastMigration._id });
    console.log(`🔙 Rolled back migration: ${lastMigration.name}`);
  }
}

module.exports = DatabaseMigrations;

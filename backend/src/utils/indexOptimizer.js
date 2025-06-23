const mongoose = require('mongoose');

class IndexOptimizer {
  constructor() {
    this.collections = ['users', 'products', 'negotiations'];
  }

  // Get all indexes for a collection
  async getIndexes(collectionName) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const indexes = await collection.listIndexes().toArray();
      return indexes;
    } catch (error) {
      console.error(`Error getting indexes for ${collectionName}:`, error);
      return [];
    }
  }

  // Create optimized indexes for all collections
  async createOptimizedIndexes() {
    console.log('🔍 Creating optimized database indexes...');
    
    try {
      await this.createUserIndexes();
      await this.createProductIndexes();
      await this.createNegotiationIndexes();
      
      console.log('✅ All indexes created successfully');
    } catch (error) {
      console.error('❌ Index creation failed:', error);
      throw error;
    }
  }

  // User collection indexes
  async createUserIndexes() {
    const collection = mongoose.connection.db.collection('users');
    
    const indexes = [
      // Unique indexes
      { key: { email: 1 }, unique: true, name: 'email_unique' },
      { key: { username: 1 }, unique: true, name: 'username_unique' },
      
      // Query optimization indexes
      { key: { role: 1 }, name: 'role_index' },
      { key: { isActive: 1 }, name: 'active_index' },
      { key: { isVerified: 1 }, name: 'verified_index' },
      { key: { createdAt: -1 }, name: 'created_desc_index' },
      { key: { 'stats.lastActive': -1 }, name: 'last_active_index' },
      
      // Rating and stats indexes
      { key: { 'profile.rating.average': -1 }, name: 'rating_desc_index' },
      { key: { 'stats.productsSold': -1 }, name: 'products_sold_index' },
      { key: { 'stats.successfulNegotiations': -1 }, name: 'successful_negotiations_index' },
      
      // Location-based index
      { key: { 'profile.location.coordinates': '2dsphere' }, name: 'location_geo_index' },
      
      // Text search index
      { 
        key: { 
          username: 'text', 
          firstName: 'text', 
          lastName: 'text', 
          'profile.bio': 'text' 
        }, 
        name: 'user_text_search',
        weights: {
          username: 10,
          firstName: 5,
          lastName: 5,
          'profile.bio': 1
        }
      },
      
      // Compound indexes for common queries
      { key: { role: 1, isActive: 1 }, name: 'role_active_compound' },
      { key: { isActive: 1, createdAt: -1 }, name: 'active_created_compound' }
    ];

    await this.createIndexes(collection, indexes, 'users');
  }

  // Product collection indexes
  async createProductIndexes() {
    const collection = mongoose.connection.db.collection('products');
    
    const indexes = [
      // Basic query indexes
      { key: { seller: 1 }, name: 'seller_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { category: 1 }, name: 'category_index' },
      { key: { condition: 1 }, name: 'condition_index' },
      { key: { createdAt: -1 }, name: 'created_desc_index' },
      { key: { updatedAt: -1 }, name: 'updated_desc_index' },
      
      // Price indexes for sorting and filtering
      { key: { 'pricing.basePrice': 1 }, name: 'base_price_asc_index' },
      { key: { 'pricing.basePrice': -1 }, name: 'base_price_desc_index' },
      { key: { 'pricing.minPrice': 1 }, name: 'min_price_index' },
      
      // Analytics indexes for trending and popular products
      { key: { 'analytics.views': -1 }, name: 'views_desc_index' },
      { key: { 'analytics.favorites': -1 }, name: 'favorites_desc_index' },
      { key: { 'analytics.negotiations': -1 }, name: 'negotiations_desc_index' },
      { key: { 'analytics.lastViewed': -1 }, name: 'last_viewed_index' },
      
      // Featured products
      { key: { 'featured.isFeatured': 1 }, name: 'featured_index' },
      { key: { 'featured.featuredUntil': 1 }, name: 'featured_until_index' },
      
      // Location-based search
      { key: { 'location.coordinates': '2dsphere' }, name: 'location_geo_index' },
      
      // Text search index
      { 
        key: { 
          title: 'text', 
          description: 'text', 
          tags: 'text',
          brand: 'text',
          model: 'text'
        }, 
        name: 'product_text_search',
        weights: {
          title: 10,
          tags: 5,
          brand: 3,
          model: 3,
          description: 1
        }
      },
      
      // Compound indexes for common queries
      { key: { status: 1, category: 1 }, name: 'status_category_compound' },
      { key: { seller: 1, status: 1 }, name: 'seller_status_compound' },
      { key: { category: 1, 'pricing.basePrice': 1 }, name: 'category_price_compound' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created_compound' },
      { key: { status: 1, 'analytics.views': -1 }, name: 'status_views_compound' },
      { key: { 'featured.isFeatured': 1, createdAt: -1 }, name: 'featured_created_compound' },
      
      // Price range compound indexes
      { key: { status: 1, 'pricing.basePrice': 1, category: 1 }, name: 'status_price_category_compound' },
      { key: { category: 1, condition: 1, 'pricing.basePrice': 1 }, name: 'category_condition_price_compound' },
      
      // TTL index for expired products
      { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'expiry_ttl_index' }
    ];

    await this.createIndexes(collection, indexes, 'products');
  }

  // Negotiation collection indexes
  async createNegotiationIndexes() {
    const collection = mongoose.connection.db.collection('negotiations');
    
    const indexes = [
      // Basic relationship indexes
      { key: { product: 1 }, name: 'product_index' },
      { key: { buyer: 1 }, name: 'buyer_index' },
      { key: { seller: 1 }, name: 'seller_index' },
      { key: { status: 1 }, name: 'status_index' },
      { key: { createdAt: -1 }, name: 'created_desc_index' },
      { key: { updatedAt: -1 }, name: 'updated_desc_index' },
      
      // Unique constraint for one negotiation per product per buyer
      { key: { product: 1, buyer: 1 }, unique: true, name: 'product_buyer_unique' },
      
      // Analytics indexes
      { key: { rounds: 1 }, name: 'rounds_index' },
      { key: { 'pricing.initialOffer': 1 }, name: 'initial_offer_index' },
      { key: { 'pricing.finalPrice': 1 }, name: 'final_price_index' },
      { key: { 'analytics.duration': 1 }, name: 'duration_index' },
      
      // Status and time-based queries
      { key: { completedAt: -1 }, name: 'completed_desc_index' },
      { key: { cancelledAt: -1 }, name: 'cancelled_desc_index' },
      
      // Compound indexes for common queries
      { key: { buyer: 1, status: 1 }, name: 'buyer_status_compound' },
      { key: { seller: 1, status: 1 }, name: 'seller_status_compound' },
      { key: { product: 1, status: 1 }, name: 'product_status_compound' },
      { key: { status: 1, createdAt: -1 }, name: 'status_created_compound' },
      { key: { status: 1, updatedAt: -1 }, name: 'status_updated_compound' },
      
      // User activity compound indexes
      { key: { buyer: 1, createdAt: -1 }, name: 'buyer_created_compound' },
      { key: { seller: 1, createdAt: -1 }, name: 'seller_created_compound' },
      { key: { buyer: 1, status: 1, updatedAt: -1 }, name: 'buyer_status_updated_compound' },
      { key: { seller: 1, status: 1, updatedAt: -1 }, name: 'seller_status_updated_compound' },
      
      // TTL index for expired negotiations
      { key: { expiresAt: 1 }, expireAfterSeconds: 0, name: 'expiry_ttl_index' }
    ];

    await this.createIndexes(collection, indexes, 'negotiations');
  }

  // Helper method to create indexes
  async createIndexes(collection, indexes, collectionName) {
    console.log(`📝 Creating indexes for ${collectionName}...`);
    
    for (const indexSpec of indexes) {
      try {
        const options = { ...indexSpec };
        delete options.key;
        
        await collection.createIndex(indexSpec.key, options);
        console.log(`  ✅ Created index: ${indexSpec.name || 'unnamed'}`);
      } catch (error) {
        if (error.code === 85) {
          // Index already exists with different options
          console.log(`  ⚠️ Index ${indexSpec.name} already exists with different options`);
        } else if (error.code === 11000) {
          // Index already exists
          console.log(`  ℹ️ Index ${indexSpec.name} already exists`);
        } else {
          console.error(`  ❌ Failed to create index ${indexSpec.name}:`, error.message);
        }
      }
    }
  }

  // Drop all indexes for a collection (except _id)
  async dropAllIndexes(collectionName) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.dropIndexes();
      console.log(`🗑️ Dropped all indexes for ${collectionName}`);
    } catch (error) {
      console.error(`❌ Failed to drop indexes for ${collectionName}:`, error);
    }
  }

  // Analyze index usage
  async analyzeIndexUsage() {
    console.log('📊 Analyzing index usage...');
    
    for (const collectionName of this.collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const stats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        console.log(`\n${collectionName.toUpperCase()} Index Usage:`);
        console.log('================================');
        
        stats.forEach(stat => {
          console.log(`Index: ${stat.name}`);
          console.log(`  Operations: ${stat.accesses.ops}`);
          console.log(`  Since: ${stat.accesses.since}`);
          console.log('');
        });
      } catch (error) {
        console.error(`❌ Failed to analyze ${collectionName}:`, error);
      }
    }
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();
      
      console.log('\n📊 Database Statistics:');
      console.log('=======================');
      console.log(`Database: ${stats.db}`);
      console.log(`Collections: ${stats.collections}`);
      console.log(`Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Indexes: ${stats.indexes}`);
      console.log(`Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Objects: ${stats.objects}`);
      
      return stats;
    } catch (error) {
      console.error('❌ Failed to get database stats:', error);
      return null;
    }
  }

  // Optimize collection
  async optimizeCollection(collectionName) {
    console.log(`🔧 Optimizing ${collectionName} collection...`);
    
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Compact collection (MongoDB 4.4+)
      try {
        await mongoose.connection.db.command({ compact: collectionName });
        console.log(`  ✅ Compacted ${collectionName}`);
      } catch (error) {
        console.log(`  ℹ️ Compact not available or failed for ${collectionName}`);
      }
      
      // Reindex collection
      await collection.reIndex();
      console.log(`  ✅ Reindexed ${collectionName}`);
      
    } catch (error) {
      console.error(`  ❌ Failed to optimize ${collectionName}:`, error);
    }
  }
}

module.exports = IndexOptimizer;

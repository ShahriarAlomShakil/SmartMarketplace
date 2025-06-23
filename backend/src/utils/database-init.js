const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const connectDB = require('../config/database');
const DatabaseMigrations = require('../utils/migrations');
const DatabaseSeeder = require('../utils/seeders');
const IndexOptimizer = require('../utils/indexOptimizer');

/**
 * Complete Database Initialization System
 * 
 * This script handles:
 * - Database connection
 * - Schema migrations
 * - Index optimization
 * - Data seeding
 * - Health checks
 */
class DatabaseInitializer {
  constructor() {
    this.migrations = new DatabaseMigrations();
    this.seeder = new DatabaseSeeder();
    this.indexOptimizer = new IndexOptimizer();
    this.isConnected = false;
  }

  /**
   * Initialize database with full setup
   */
  async initialize(options = {}) {
    const {
      migrate = true,
      seed = false,
      optimize = true,
      healthCheck = true,
      clearFirst = false
    } = options;

    console.log('🚀 Starting Smart Marketplace Database Initialization');
    console.log('====================================================');

    try {
      // Step 1: Connect to database
      await this.connect();

      // Step 2: Health check
      if (healthCheck) {
        await this.performHealthCheck();
      }

      // Step 3: Clear database if requested
      if (clearFirst) {
        console.log('\n🗑️ Clearing existing data...');
        await this.seeder.clearDatabase();
      }

      // Step 4: Run migrations
      if (migrate) {
        console.log('\n📦 Running database migrations...');
        await this.migrations.runMigrations();
      }

      // Step 5: Optimize indexes
      if (optimize) {
        console.log('\n🔍 Optimizing database indexes...');
        await this.indexOptimizer.createOptimizedIndexes();
      }

      // Step 6: Seed data
      if (seed) {
        console.log('\n🌱 Seeding database...');
        await this.seeder.seed();
      }

      // Step 7: Final health check and stats
      if (healthCheck) {
        console.log('\n📊 Final database statistics...');
        await this.indexOptimizer.getDatabaseStats();
      }

      console.log('\n🎉 Database initialization completed successfully!');
      return true;

    } catch (error) {
      console.error('\n❌ Database initialization failed:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Connect to database
   */
  async connect() {
    if (this.isConnected) return;

    console.log('🔗 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await connectDB();
    this.isConnected = true;
    console.log('✅ Database connected successfully');
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (!this.isConnected) return;

    await mongoose.connection.close();
    this.isConnected = false;
    console.log('🔒 Database connection closed');
  }

  /**
   * Perform database health check
   */
  async performHealthCheck() {
    console.log('🏥 Performing database health check...');

    try {
      // Check connection state
      const connectionState = mongoose.connection.readyState;
      if (connectionState !== 1) {
        throw new Error('Database connection is not active');
      }

      // Check database accessibility
      await mongoose.connection.db.admin().ping();

      // Check collections existence
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      console.log('✅ Database health check passed');
      console.log(`📂 Found ${collections.length} collections: ${collectionNames.join(', ')}`);

      return {
        status: 'healthy',
        collections: collectionNames,
        connectionState
      };

    } catch (error) {
      console.error('❌ Database health check failed:', error);
      throw error;
    }
  }

  /**
   * Backup database data
   */
  async createBackup(backupPath = './backups') {
    console.log('💾 Creating database backup...');

    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Create backup directory
      await fs.mkdir(backupPath, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(backupPath, `backup-${timestamp}`);
      await fs.mkdir(backupDir);

      // Backup each collection
      const collections = ['users', 'products', 'negotiations'];
      
      for (const collectionName of collections) {
        const collection = mongoose.connection.db.collection(collectionName);
        const data = await collection.find({}).toArray();
        
        const backupFile = path.join(backupDir, `${collectionName}.json`);
        await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
        
        console.log(`  ✅ Backed up ${collectionName}: ${data.length} documents`);
      }

      console.log(`✅ Backup completed: ${backupDir}`);
      return backupDir;

    } catch (error) {
      console.error('❌ Backup failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupDir) {
    console.log(`🔄 Restoring database from backup: ${backupDir}`);

    try {
      const fs = require('fs').promises;
      const path = require('path');

      const collections = ['users', 'products', 'negotiations'];
      
      for (const collectionName of collections) {
        const backupFile = path.join(backupDir, `${collectionName}.json`);
        
        try {
          const data = JSON.parse(await fs.readFile(backupFile, 'utf8'));
          const collection = mongoose.connection.db.collection(collectionName);
          
          // Clear existing data
          await collection.deleteMany({});
          
          // Insert backup data
          if (data.length > 0) {
            await collection.insertMany(data);
          }
          
          console.log(`  ✅ Restored ${collectionName}: ${data.length} documents`);
        } catch (fileError) {
          console.log(`  ⚠️ Backup file not found for ${collectionName}, skipping`);
        }
      }

      console.log('✅ Database restore completed');

    } catch (error) {
      console.error('❌ Restore failed:', error);
      throw error;
    }
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity() {
    console.log('🔍 Validating data integrity...');

    const issues = [];

    try {
      // Check for orphaned records
      const Product = require('../models/Product');
      const User = require('../models/User');
      const Negotiation = require('../models/Negotiation');

      // Check for products with invalid sellers
      const orphanedProducts = await Product.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'seller',
            foreignField: '_id',
            as: 'sellerData'
          }
        },
        {
          $match: {
            sellerData: { $size: 0 }
          }
        },
        {
          $project: { _id: 1, title: 1, seller: 1 }
        }
      ]);

      if (orphanedProducts.length > 0) {
        issues.push({
          type: 'orphaned_products',
          count: orphanedProducts.length,
          description: 'Products with invalid seller references',
          items: orphanedProducts
        });
      }

      // Check for negotiations with invalid references
      const orphanedNegotiations = await Negotiation.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'product',
            foreignField: '_id',
            as: 'productData'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'buyer',
            foreignField: '_id',
            as: 'buyerData'
          }
        },
        {
          $match: {
            $or: [
              { productData: { $size: 0 } },
              { buyerData: { $size: 0 } }
            ]
          }
        },
        {
          $project: { _id: 1, product: 1, buyer: 1, seller: 1 }
        }
      ]);

      if (orphanedNegotiations.length > 0) {
        issues.push({
          type: 'orphaned_negotiations',
          count: orphanedNegotiations.length,
          description: 'Negotiations with invalid product or user references',
          items: orphanedNegotiations
        });
      }

      // Check for price validation issues
      const invalidPriceProducts = await Product.find({
        $expr: { $gt: ['$pricing.minPrice', '$pricing.basePrice'] }
      }).select('_id title pricing');

      if (invalidPriceProducts.length > 0) {
        issues.push({
          type: 'invalid_pricing',
          count: invalidPriceProducts.length,
          description: 'Products with minimum price greater than base price',
          items: invalidPriceProducts
        });
      }

      if (issues.length === 0) {
        console.log('✅ Data integrity validation passed');
        return { status: 'valid', issues: [] };
      } else {
        console.log(`⚠️ Found ${issues.length} data integrity issue(s):`);
        issues.forEach(issue => {
          console.log(`  - ${issue.description}: ${issue.count} records`);
        });
        return { status: 'issues_found', issues };
      }

    } catch (error) {
      console.error('❌ Data integrity validation failed:', error);
      throw error;
    }
  }

  /**
   * Clean up data issues
   */
  async cleanupDataIssues() {
    console.log('🧹 Cleaning up data issues...');

    try {
      const integrity = await this.validateDataIntegrity();
      
      if (integrity.status === 'valid') {
        console.log('✅ No data issues to clean up');
        return;
      }

      for (const issue of integrity.issues) {
        switch (issue.type) {
          case 'orphaned_products':
            // Could delete or reassign to admin user
            console.log(`  🗑️ Found ${issue.count} orphaned products (manual review recommended)`);
            break;
            
          case 'orphaned_negotiations':
            // Delete orphaned negotiations
            const Negotiation = require('../models/Negotiation');
            const ids = issue.items.map(item => item._id);
            await Negotiation.deleteMany({ _id: { $in: ids } });
            console.log(`  🗑️ Deleted ${issue.count} orphaned negotiations`);
            break;
            
          case 'invalid_pricing':
            // Fix pricing issues by setting minPrice = basePrice * 0.8
            const Product = require('../models/Product');
            for (const product of issue.items) {
              await Product.findByIdAndUpdate(product._id, {
                'pricing.minPrice': product.pricing.basePrice * 0.8
              });
            }
            console.log(`  🔧 Fixed ${issue.count} pricing issues`);
            break;
        }
      }

      console.log('✅ Data cleanup completed');

    } catch (error) {
      console.error('❌ Data cleanup failed:', error);
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const initializer = new DatabaseInitializer();

  const options = {
    migrate: !args.includes('--no-migrate'),
    seed: args.includes('--seed'),
    optimize: !args.includes('--no-optimize'),
    healthCheck: !args.includes('--no-health-check'),
    clearFirst: args.includes('--clear-first')
  };

  // Handle special commands
  if (args.includes('--backup')) {
    initializer.connect()
      .then(() => initializer.createBackup())
      .finally(() => initializer.disconnect());
  } else if (args.includes('--validate')) {
    initializer.connect()
      .then(() => initializer.validateDataIntegrity())
      .finally(() => initializer.disconnect());
  } else if (args.includes('--cleanup')) {
    initializer.connect()
      .then(() => initializer.cleanupDataIssues())
      .finally(() => initializer.disconnect());
  } else {
    initializer.initialize(options);
  }
}

module.exports = DatabaseInitializer;

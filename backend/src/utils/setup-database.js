#!/usr/bin/env node

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const connectDB = require('../config/database');
const DatabaseMigrations = require('./migrations');
const DatabaseSeeder = require('./seeders');

class DatabaseSetup {
  constructor() {
    this.migrations = new DatabaseMigrations();
    this.seeder = new DatabaseSeeder();
  }

  async run(options = {}) {
    try {
      // Connect to database
      await connectDB();
      console.log('🔗 Connected to MongoDB');

      // Run migrations if requested
      if (options.migrate !== false) {
        await this.migrations.runMigrations();
      }

      // Run seeding if requested
      if (options.seed) {
        if (options.clearFirst) {
          await this.seeder.clearDatabase();
        }
        await this.seeder.seed();
      }

      // Run specific operations
      if (options.clearDatabase) {
        await this.seeder.clearDatabase();
      }

      if (options.seedCollection) {
        await this.seeder.seedCollection(options.seedCollection);
      }

      if (options.rollbackMigration) {
        await this.migrations.rollbackLastMigration();
      }

      console.log('✅ Database setup completed successfully');

    } catch (error) {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('🔒 Database connection closed');
    }
  }

  // Print usage information
  static printUsage() {
    console.log(`
📊 Database Setup Tool
=====================

Usage: node setup-database.js [options]

Options:
  --migrate         Run database migrations (default: true)
  --no-migrate      Skip database migrations
  --seed            Run database seeding
  --clear-first     Clear database before seeding
  --clear           Clear all database data
  --seed-collection [collection]  Seed specific collection (users, products, negotiations)
  --rollback        Rollback last migration
  --help            Show this help message

Examples:
  node setup-database.js --migrate --seed
  node setup-database.js --seed --clear-first
  node setup-database.js --seed-collection users
  node setup-database.js --clear
  node setup-database.js --rollback
`);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    migrate: true,
    seed: false,
    clearFirst: false,
    clearDatabase: false,
    seedCollection: null,
    rollbackMigration: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        DatabaseSetup.printUsage();
        process.exit(0);
        break;
      case '--migrate':
        options.migrate = true;
        break;
      case '--no-migrate':
        options.migrate = false;
        break;
      case '--seed':
        options.seed = true;
        break;
      case '--clear-first':
        options.clearFirst = true;
        break;
      case '--clear':
        options.clearDatabase = true;
        break;
      case '--seed-collection':
        options.seedCollection = args[i + 1];
        i++; // Skip next argument
        break;
      case '--rollback':
        options.rollbackMigration = true;
        break;
      default:
        console.warn(`⚠️ Unknown option: ${arg}`);
    }
  }

  return options;
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const setup = new DatabaseSetup();
  setup.run(options);
}

module.exports = DatabaseSetup;

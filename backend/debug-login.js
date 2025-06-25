#!/usr/bin/env node

/**
 * Debug script for testing login functionality
 * This script helps identify issues with the login process
 */

const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function debugLogin() {
  try {
    console.log('🔍 Starting login debug process...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartmarketplace');
    console.log('✅ Connected to MongoDB');

    // Check if there are any users in the database
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('\n⚠️  No users found in database. Creating a test user...');
      
      const testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        isVerified: true,
        isActive: true
      });

      await testUser.save();
      console.log('✅ Test user created successfully');
      console.log('📧 Email: test@example.com');
      console.log('🔐 Password: password123');
    }

    // List some users for debugging
    const users = await User.find({}, 'username email isActive isVerified createdAt').limit(5);
    console.log('\n👥 Sample users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - Active: ${user.isActive}, Verified: ${user.isVerified}`);
    });

    // Test password comparison for first user
    const testUser = await User.findOne({ email: 'test@example.com' }).select('+password');
    if (testUser) {
      console.log('\n🔐 Testing password verification...');
      console.log(`👤 User found: ${testUser.email}`);
      console.log(`🔒 Stored password hash: ${testUser.password ? 'Present' : 'Missing'}`);
      
      if (testUser.password) {
        const isPasswordValid = await testUser.comparePassword('TestPassword123!');
        console.log(`✅ Password comparison result: ${isPasswordValid}`);
        
        if (!isPasswordValid) {
          // Try to reset password for testing
          console.log('🔄 Resetting password for testing...');
          testUser.password = 'TestPassword123!';
          await testUser.save();
          console.log('✅ Password reset complete');
        }
      } else {
        console.log('🔄 Setting password for testing...');
        testUser.password = 'TestPassword123!';
        await testUser.save();
        console.log('✅ Password set complete');
      }
    }

    // Test API endpoint
    console.log('\n🌐 Testing login API endpoint...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      })
    });

    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login API test successful');
      console.log('🎯 Response data:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ Login API test failed');
      console.log('💥 Error response:', errorData);
    }

  } catch (error) {
    console.error('💥 Debug script error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the debug script
debugLogin();

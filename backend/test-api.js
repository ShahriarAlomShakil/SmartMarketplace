// 🚀 Day 6 API Testing Suite - Core API Routes Validation
// This script validates all Day 6 API requirements

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  timeout: 10000,
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Create axios instance
const api = axios.create(testConfig);

// Test results tracker
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS'.green : '❌ FAIL'.red;
  console.log(`${status} - ${testName}`);
  if (details) console.log(`    ${details}`.gray);
  
  testResults.tests.push({ testName, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

// Test authentication endpoints
async function testAuthEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints'.blue.bold);
  
  try {
    // Test registration endpoint structure
    const response = await api.post('/auth/register', {
      username: 'testuser',
      email: 'invalid-email', // Intentionally invalid for validation test
      password: 'weak' // Intentionally weak for validation test
    }).catch(err => err.response);
    
    if (response && response.status === 400 && response.data.message === 'Validation failed') {
      logTest('Auth validation middleware', true, 'Properly rejects invalid data');
    } else {
      logTest('Auth validation middleware', false, 'Should reject invalid registration data');
    }
  } catch (error) {
    logTest('Auth validation middleware', false, `Error: ${error.message}`);
  }

  // Test login endpoint exists
  try {
    const response = await api.post('/auth/login', {}).catch(err => err.response);
    if (response && response.status === 400) {
      logTest('Login endpoint', true, 'Endpoint exists and validates input');
    } else {
      logTest('Login endpoint', false, 'Endpoint missing or not validating');
    }
  } catch (error) {
    logTest('Login endpoint', false, `Error: ${error.message}`);
  }
}

// Test product endpoints
async function testProductEndpoints() {
  console.log('\n📦 Testing Product Endpoints'.blue.bold);
  
  try {
    // Test GET products (public endpoint)
    const response = await api.get('/products');
    if (response.status === 200) {
      logTest('GET /products', true, 'Public product listing works');
    } else {
      logTest('GET /products', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('GET /products', false, `Error: ${error.message}`);
  }

  try {
    // Test POST product (should require auth)
    const response = await api.post('/products', {
      title: 'Test Product',
      description: 'Test Description',
      price: 100
    }).catch(err => err.response);
    
    if (response && response.status === 401) {
      logTest('POST /products auth protection', true, 'Properly requires authentication');
    } else {
      logTest('POST /products auth protection', false, 'Should require authentication');
    }
  } catch (error) {
    logTest('POST /products auth protection', false, `Error: ${error.message}`);
  }

  try {
    // Test product search
    const response = await api.get('/products/search?q=test');
    if (response.status === 200) {
      logTest('Product search', true, 'Search endpoint works');
    } else {
      logTest('Product search', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Product search', false, `Error: ${error.message}`);
  }
}

// Test user endpoints
async function testUserEndpoints() {
  console.log('\n👤 Testing User Endpoints'.blue.bold);
  
  try {
    // Test user profile endpoint (should require auth)
    const response = await api.get('/users/profile').catch(err => err.response);
    if (response && response.status === 401) {
      logTest('User profile protection', true, 'Properly requires authentication');
    } else {
      logTest('User profile protection', false, 'Should require authentication');
    }
  } catch (error) {
    logTest('User profile protection', false, `Error: ${error.message}`);
  }

  try {
    // Test user search (public)
    const response = await api.get('/users/search?q=test').catch(err => err.response);
    if (response && (response.status === 200 || response.status === 400)) {
      logTest('User search endpoint', true, 'Search endpoint exists');
    } else {
      logTest('User search endpoint', false, 'Search endpoint missing');
    }
  } catch (error) {
    logTest('User search endpoint', false, `Error: ${error.message}`);
  }
}

// Test system endpoints
async function testSystemEndpoints() {
  console.log('\n⚙️ Testing System Endpoints'.blue.bold);
  
  try {
    // Test system info
    const response = await api.get('/system/info');
    if (response.status === 200 && response.data.api) {
      logTest('System info', true, 'API information available');
    } else {
      logTest('System info', false, 'System info incomplete');
    }
  } catch (error) {
    logTest('System info', false, `Error: ${error.message}`);
  }

  try {
    // Test health check
    const response = await api.get('/system/health');
    if (response.status === 200) {
      logTest('Health check', true, 'Health endpoint working');
    } else {
      logTest('Health check', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Health check', false, `Error: ${error.message}`);
  }

  try {
    // Test API status
    const response = await api.get('/system/status');
    if (response.status === 200) {
      logTest('System status', true, 'Status endpoint working');
    } else {
      logTest('System status', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('System status', false, `Error: ${error.message}`);
  }
}

// Test middleware functionality
async function testMiddleware() {
  console.log('\n🛡️ Testing Middleware'.blue.bold);
  
  try {
    // Test rate limiting (make rapid requests)
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(api.get('/system/info').catch(err => err.response));
    }
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r && r.status === 200).length;
    
    if (successCount > 0) {
      logTest('API connectivity', true, `${successCount}/5 requests successful`);
    } else {
      logTest('API connectivity', false, 'No successful requests');
    }
  } catch (error) {
    logTest('API connectivity', false, `Error: ${error.message}`);
  }

  try {
    // Test CORS headers
    const response = await api.get('/system/info');
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      logTest('CORS configuration', true, `CORS headers present`);
    } else {
      logTest('CORS configuration', false, 'CORS headers missing');
    }
  } catch (error) {
    logTest('CORS configuration', false, `Error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Day 6 API Testing Suite'.rainbow.bold);
  console.log('================================'.gray);
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...'.yellow);
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    await testSystemEndpoints();
    await testAuthEndpoints();
    await testProductEndpoints();
    await testUserEndpoints();
    await testMiddleware();
    
    // Print summary
    console.log('\n📊 Test Summary'.blue.bold);
    console.log('================'.gray);
    console.log(`✅ Passed: ${testResults.passed}`.green);
    console.log(`❌ Failed: ${testResults.failed}`.red);
    console.log(`📋 Total: ${testResults.tests.length}`.blue);
    
    const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`.cyan);
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All Day 6 API requirements met!'.green.bold);
    } else {
      console.log('\n⚠️ Some tests failed. Check the issues above.'.yellow.bold);
    }
    
    console.log('\n🔗 Available Endpoints:'.blue.bold);
    console.log('• Authentication: /api/auth/*'.yellow);
    console.log('• Products: /api/products/*'.yellow);
    console.log('• Users: /api/users/*'.yellow);
    console.log('• Negotiations: /api/negotiations/*'.yellow);
    console.log('• System: /api/system/*'.yellow);
    console.log('• Documentation: /api/docs'.yellow);
    
  } catch (error) {
    console.error('❌ Test runner error:'.red, error.message);
  }
}

// Run if called directly
if (require.main === module) {
  runTests().then(() => {
    console.log('\n✨ Day 6 testing complete!'.green.bold);
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test suite failed:'.red, error);
    process.exit(1);
  });
}

module.exports = { runTests, testConfig };

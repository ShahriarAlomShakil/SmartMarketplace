// Quick integration test for Gemini service
require('dotenv').config();
const GeminiService = require('./src/services/geminiService');

async function quickTest() {
  console.log('🧪 Quick Gemini Service Integration Test\n');
  
  const testContext = {
    productTitle: 'iPhone 14',
    basePrice: 600,
    minPrice: 500,
    currentOffer: 450,
    rounds: 2,
    maxRounds: 5,
    urgency: 'medium',
    personality: 'friendly',
    userMessage: 'Could you do $450?',
    userId: 'test-user'
  };

  try {
    console.log('🔄 Testing negotiation response generation...');
    const response = await GeminiService.generateNegotiationResponse(testContext);
    
    console.log('✅ Response generated successfully!');
    console.log('📝 Content:', response.content);
    console.log('🎯 Action:', response.action);
    if (response.offer) {
      console.log('💰 Offer:', response.offer);
    }
    console.log('📊 Confidence:', response.confidence);
    
    console.log('\n🔍 Testing health check...');
    const health = await GeminiService.checkHealth();
    console.log('✅ Health status:', health.status);
    
    console.log('\n📈 Testing analytics...');
    const analytics = GeminiService.getAnalyticsDashboard();
    console.log('✅ Analytics working');
    console.log('📊 Total requests:', analytics.metrics.totalRequests);
    
    console.log('\n🎉 All tests passed! Gemini integration is ready for Day 11 completion.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
  
  return true;
}

if (require.main === module) {
  quickTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = quickTest;

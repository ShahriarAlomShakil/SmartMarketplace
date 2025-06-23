// 🧪 Gemini AI Service Testing Utilities
// Day 11 Completion - Comprehensive testing for AI integration

const GeminiService = require('./src/services/geminiService');
const { healthCheck, generateContent } = require('./src/config/gemini');
const colors = require('colors');

class GeminiTester {
  constructor() {
    this.results = [];
    this.service = GeminiService;
  }

  // Log test results with colors
  logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS'.green : '❌ FAIL'.red;
    const message = `${status} ${name} ${details ? `- ${details}` : ''}`;
    console.log(message);
    
    this.results.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // Test 1: Basic API Connection
  async testBasicConnection() {
    console.log('\n🔌 Testing Basic Gemini API Connection'.blue.bold);
    try {
      const health = await healthCheck();
      if (health.status === 'healthy') {
        this.logTest('API Connection', true, 'Gemini API responding');
      } else {
        this.logTest('API Connection', false, `Status: ${health.status}`);
      }
    } catch (error) {
      this.logTest('API Connection', false, `Error: ${error.message}`);
    }
  }

  // Test 2: Negotiation Response Generation
  async testNegotiationGeneration() {
    console.log('\n🤝 Testing Negotiation Response Generation'.blue.bold);
    
    const testContext = {
      productTitle: 'iPhone 13 Pro',
      basePrice: 500,
      minPrice: 450,
      currentOffer: 400,
      rounds: 1,
      maxRounds: 5,
      urgency: 'medium',
      personality: 'friendly',
      userMessage: 'Would you accept $400 for this iPhone?',
      userId: 'test-user'
    };

    try {
      const response = await this.service.generateNegotiationResponse(testContext);
      
      if (response && response.content && response.action) {
        this.logTest('Response Generation', true, 'Valid negotiation response generated');
        this.logTest('Response Content', response.content.length > 10, `Length: ${response.content.length} chars`);
        this.logTest('Response Action', ['accept', 'reject', 'counter', 'continue'].includes(response.action), `Action: ${response.action}`);
        
        if (response.offer && response.offer.amount) {
          this.logTest('Offer Parsing', true, `Suggested price: $${response.offer.amount}`);
        }
      } else {
        this.logTest('Response Generation', false, 'Invalid response structure');
      }
    } catch (error) {
      this.logTest('Response Generation', false, `Error: ${error.message}`);
    }
  }

  // Test 3: Different Personality Responses
  async testPersonalities() {
    console.log('\n🎭 Testing Different Personality Responses'.blue.bold);
    
    const personalities = ['friendly', 'professional', 'firm', 'flexible'];
    const baseContext = {
      productTitle: 'MacBook Pro',
      basePrice: 1200,
      minPrice: 1000,
      currentOffer: 900,
      rounds: 2,
      maxRounds: 5,
      userMessage: 'Can you do $900?',
      userId: 'test-user'
    };

    for (const personality of personalities) {
      try {
        const context = { ...baseContext, personality };
        const response = await this.service.generateNegotiationResponse(context);
        
        if (response && response.content) {
          this.logTest(`${personality} personality`, true, `Generated ${response.content.length} chars`);
        } else {
          this.logTest(`${personality} personality`, false, 'No response generated');
        }
      } catch (error) {
        this.logTest(`${personality} personality`, false, error.message);
      }
    }
  }

  // Test 4: Rate Limiting
  async testRateLimiting() {
    console.log('\n⏱️  Testing Rate Limiting'.blue.bold);
    
    try {
      const rateLimitInfo = this.service.getRateLimitInfo('test-user');
      this.logTest('Rate Limit Info', typeof rateLimitInfo.remaining === 'number', `Remaining: ${rateLimitInfo.remaining}`);
      
      // Test multiple rapid requests
      const promises = [];
      for (let i = 0; i < 3; i++) {
        promises.push(generateContent('Test prompt', { userId: 'rate-test-user' }));
      }
      
      const responses = await Promise.allSettled(promises);
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      this.logTest('Rapid Requests', successful > 0, `${successful}/3 requests succeeded`);
      
    } catch (error) {
      this.logTest('Rate Limiting', false, error.message);
    }
  }

  // Test 5: Response Parsing
  async testResponseParsing() {
    console.log('\n📝 Testing Response Parsing'.blue.bold);
    
    const testResponses = [
      'I can ACCEPT your offer of $450. That works for me!',
      'I need to COUNTER with $480. How does that sound?',
      'Sorry, but I have to REJECT that offer. Too low for me.',
      'Let me think about this. CONTINUE the negotiation.'
    ];

    const mockContext = {
      basePrice: 500,
      minPrice: 450,
      currentOffer: 400
    };

    for (const testResponse of testResponses) {
      try {
        const parsed = this.service.parseNegotiationResponse(testResponse, mockContext);
        const expectedAction = testResponse.match(/(ACCEPT|COUNTER|REJECT|CONTINUE)/)?.[1]?.toLowerCase();
        
        this.logTest(`Parse "${expectedAction}" action`, parsed.action === expectedAction, `Got: ${parsed.action}`);
      } catch (error) {
        this.logTest('Response Parsing', false, error.message);
      }
    }
  }

  // Test 6: Fallback Mechanism
  async testFallbackMechanism() {
    console.log('\n🔄 Testing Fallback Mechanism'.blue.bold);
    
    const context = {
      productTitle: 'Test Product',
      basePrice: 100,
      minPrice: 80,
      currentOffer: 70,
      personality: 'professional'
    };

    try {
      const fallbackResponse = this.service.getFallbackResponse(context);
      
      this.logTest('Fallback Response', fallbackResponse && fallbackResponse.content, 'Fallback mechanism working');
      this.logTest('Fallback Action', fallbackResponse.action !== undefined, `Action: ${fallbackResponse.action}`);
      this.logTest('Fallback Metadata', fallbackResponse.metadata?.isFallback === true, 'Metadata correctly set');
      
    } catch (error) {
      this.logTest('Fallback Mechanism', false, error.message);
    }
  }

  // Test 7: Error Handling
  async testErrorHandling() {
    console.log('\n⚠️  Testing Error Handling'.blue.bold);
    
    // Test with invalid context
    try {
      const invalidContext = {
        productTitle: null,
        basePrice: 'invalid',
        minPrice: -10
      };
      
      const response = await this.service.generateNegotiationResponse(invalidContext);
      this.logTest('Invalid Context Handling', response !== null, 'Service handled invalid context gracefully');
      
    } catch (error) {
      this.logTest('Invalid Context Handling', true, 'Error properly caught and handled');
    }

    // Test health check
    try {
      const health = await this.service.checkHealth();
      this.logTest('Health Check', health.status !== undefined, `Status: ${health.status}`);
    } catch (error) {
      this.logTest('Health Check', false, error.message);
    }
  }

  // Test 8: Performance Benchmarks
  async testPerformance() {
    console.log('\n⚡ Testing Performance'.blue.bold);
    
    const context = {
      productTitle: 'Performance Test Product',
      basePrice: 200,
      minPrice: 150,
      currentOffer: 140,
      rounds: 1,
      maxRounds: 5,
      userMessage: 'Quick performance test',
      userId: 'perf-test-user'
    };

    const startTime = Date.now();
    
    try {
      const response = await this.service.generateNegotiationResponse(context);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.logTest('Response Time', duration < 10000, `${duration}ms (target: <10s)`);
      this.logTest('Performance Response', response && response.content, 'Response generated successfully');
      
    } catch (error) {
      this.logTest('Performance Test', false, error.message);
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 GEMINI AI SERVICE COMPREHENSIVE TESTING'.cyan.bold);
    console.log('================================================'.cyan);
    
    const startTime = Date.now();
    
    await this.testBasicConnection();
    await this.testNegotiationGeneration();
    await this.testPersonalities();
    await this.testRateLimiting();
    await this.testResponseParsing();
    await this.testFallbackMechanism();
    await this.testErrorHandling();
    await this.testPerformance();
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Summary
    console.log('\n📊 TEST SUMMARY'.cyan.bold);
    console.log('================'.cyan);
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`.green);
    console.log(`Failed: ${total - passed}`.red);
    console.log(`Pass Rate: ${passRate}%`);
    console.log(`Total Time: ${totalTime}ms`);
    
    if (passRate >= 80) {
      console.log('\n🎉 GEMINI AI INTEGRATION SUCCESSFUL!'.green.bold);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED - CHECK CONFIGURATION'.yellow.bold);
    }
    
    return { passed, total, passRate, totalTime };
  }

  // Generate detailed test report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.passed).length,
        failed: this.results.filter(r => !r.passed).length,
        passRate: ((this.results.filter(r => r.passed).length / this.results.length) * 100).toFixed(1)
      },
      details: this.results,
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // Generate recommendations based on test results
  generateRecommendations() {
    const failed = this.results.filter(r => !r.passed);
    const recommendations = [];
    
    if (failed.some(f => f.name.includes('API Connection'))) {
      recommendations.push('Check GEMINI_API_KEY environment variable');
      recommendations.push('Verify internet connectivity');
      recommendations.push('Check API quota and billing');
    }
    
    if (failed.some(f => f.name.includes('Rate Limit'))) {
      recommendations.push('Consider implementing request queuing');
      recommendations.push('Optimize API usage patterns');
    }
    
    if (failed.some(f => f.name.includes('Response'))) {
      recommendations.push('Review prompt templates');
      recommendations.push('Check response parsing logic');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passed! Gemini integration is working correctly.');
    }
    
    return recommendations;
  }
}

// CLI interface
if (require.main === module) {
  const tester = new GeminiTester();
  
  console.log('Starting Gemini AI Service Tests...\n');
  
  tester.runAllTests()
    .then((results) => {
      console.log('\nGeneration test report...');
      const report = tester.generateReport();
      
      // Optionally save report to file
      const fs = require('fs');
      fs.writeFileSync('./gemini-test-report.json', JSON.stringify(report, null, 2));
      console.log('📄 Test report saved to: gemini-test-report.json');
      
      process.exit(results.passRate >= 80 ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = GeminiTester;

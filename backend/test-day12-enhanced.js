// 🧪 Day 12 Comprehensive Testing Suite
// Enhanced Prompt System & Response Processing Validation - UPDATED

require('dotenv').config();
const GeminiService = require('./src/services/geminiService');
const responseProcessor = require('./src/utils/responseProcessor');
const contextManager = require('./src/utils/contextManager');
const { PromptTemplates, TemplateUtils } = require('./src/utils/promptTemplates');
const colors = require('colors');

class Day12TestSuite {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      testDetails: []
    };
    
    this.testContext = {
      productTitle: 'MacBook Pro 16"',
      basePrice: 2500,
      minPrice: 2000,
      currentOffer: 1800,
      rounds: 3,
      maxRounds: 8,
      urgency: 'medium',
      personality: 'friendly',
      category: 'electronics',
      userMessage: 'Would you consider $1800? I really need this for school.',
      negotiationId: 'test_nego_123',
      userId: 'test_user_456'
    };
  }

  // Main test runner
  async runAllTests() {
    console.log('🚀 Day 12 Testing Suite - Enhanced Prompt System & Response Processing\n'.cyan.bold);
    
    await this.testPromptTemplateSystem();
    await this.testResponseProcessingPipeline();
    await this.testContextManagement();
    await this.testAdvancedParsing();
    await this.testSafetyFilters();
    await this.testBusinessLogicValidation();
    await this.testFallbackMechanisms();
    await this.testIntegrationFlow();
    
    this.printSummary();
    return this.results.failed === 0;
  }

  // Test 1: Prompt Template System
  async testPromptTemplateSystem() {
    console.log('📝 Testing Prompt Template System...'.yellow);
    
    try {
      // Test template detection
      const scenario = TemplateUtils.detectScenario(this.testContext);
      this.assert(
        'Scenario Detection',
        scenario !== undefined && typeof scenario === 'string',
        `Expected string scenario, got: ${scenario}`
      );

      // Test context data generation
      const contextData = TemplateUtils.generateContextData(this.testContext);
      this.assert(
        'Context Data Generation',
        contextData.discountPercentage && contextData.offerQuality,
        'Should generate enhanced context data with calculations'
      );

      // Test template replacement
      const template = TemplateUtils.getTemplate('counter_offer', 'friendly', 'electronics');
      const filled = TemplateUtils.replacePlaceholders(template, contextData);
      this.assert(
        'Template Placeholder Replacement',
        !filled.includes('{') && filled.length > template.length / 2,
        'Should replace all placeholders with actual values'
      );

      // Test personality variations
      const personalities = ['friendly', 'professional', 'firm', 'flexible'];
      for (const personality of personalities) {
        const personalityTemplate = PromptTemplates.personality[personality];
        this.assert(
          `Personality Template - ${personality}`,
          personalityTemplate && personalityTemplate.greeting,
          `Should have ${personality} personality template`
        );
      }

      console.log('✅ Prompt Template System tests passed\n'.green);
    } catch (error) {
      console.log('❌ Prompt Template System tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 2: Response Processing Pipeline
  async testResponseProcessingPipeline() {
    console.log('⚙️ Testing Response Processing Pipeline...'.yellow);
    
    try {
      const testResponses = [
        'I accept your offer of $1800!',
        'Sorry, but I cannot go below $2200. How about $2100?',
        'That\'s too low for me. I need at least $2000.',
        'Let me think about it and get back to you.'
      ];

      for (const response of testResponses) {
        const processed = await responseProcessor.processResponse(response, this.testContext);
        
        this.assert(
          'Response Processing Structure',
          processed.status === 'success' && processed.data,
          'Should return success status with data'
        );

        this.assert(
          'Response Data Completeness',
          processed.data.message && processed.data.action && processed.data.confidence !== undefined,
          'Should have message, action, and confidence'
        );

        this.assert(
          'Response Metadata',
          processed.data.metadata && processed.data.metadata.timestamp,
          'Should include metadata with timestamp'
        );
      }

      // Test malformed response handling
      const malformedResponse = await responseProcessor.processResponse('', this.testContext);
      this.assert(
        'Malformed Response Handling',
        malformedResponse.status === 'error' || malformedResponse.data.confidence < 0.5,
        'Should handle empty/malformed responses gracefully'
      );

      console.log('✅ Response Processing Pipeline tests passed\n'.green);
    } catch (error) {
      console.log('❌ Response Processing Pipeline tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 3: Context Management
  async testContextManagement() {
    console.log('🧠 Testing Context Management System...'.yellow);
    
    try {
      // Create conversation context
      const context = contextManager.createContext(this.testContext.negotiationId, {
        productInfo: { title: this.testContext.productTitle, price: this.testContext.basePrice },
        settings: { maxRounds: this.testContext.maxRounds }
      });

      this.assert(
        'Context Creation',
        context && context.id === this.testContext.negotiationId,
        'Should create context with correct ID'
      );

      // Add messages to context
      const message1 = contextManager.addMessage(this.testContext.negotiationId, {
        content: 'Hi, interested in your MacBook',
        sender: 'buyer',
        action: 'message'
      });

      const message2 = contextManager.addMessage(this.testContext.negotiationId, {
        content: 'Would you take $1800?',
        sender: 'buyer',
        action: 'offer',
        offer: { amount: 1800 }
      });

      this.assert(
        'Message Addition',
        message1 && message2 && message1.id !== message2.id,
        'Should add messages with unique IDs'
      );

      // Test conversation summary
      const summary = contextManager.getConversationSummary(this.testContext.negotiationId);
      this.assert(
        'Conversation Summary',
        summary.includes('buyer') && summary.includes('1800'),
        'Should generate comprehensive conversation summary'
      );

      // Test analytics
      const contextWithAnalytics = contextManager.getContext(this.testContext.negotiationId, true);
      this.assert(
        'Context Analytics',
        contextWithAnalytics.analytics && contextWithAnalytics.analytics.successProbability !== undefined,
        'Should include success probability and other analytics'
      );

      console.log('✅ Context Management System tests passed\n'.green);
    } catch (error) {
      console.log('❌ Context Management System tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 4: Advanced Parsing
  async testAdvancedParsing() {
    console.log('🔍 Testing Advanced Response Parsing...'.yellow);
    
    try {
      const testCases = [
        {
          input: 'I accept your offer of $1800!',
          expectedAction: 'accept',
          expectedOffer: 1800
        },
        {
          input: 'How about we meet in the middle at $2150?',
          expectedAction: 'counter',
          expectedOffer: 2150
        },
        {
          input: 'That\'s way too low, I cannot accept anything under $2200',
          expectedAction: 'reject',
          expectedOffer: null
        },
        {
          input: 'Let me think about your proposal',
          expectedAction: 'continue',
          expectedOffer: null
        }
      ];

      for (const testCase of testCases) {
        const processed = await responseProcessor.processResponse(testCase.input, this.testContext);
        
        this.assert(
          `Action Detection - ${testCase.expectedAction}`,
          processed.data.action === testCase.expectedAction,
          `Expected ${testCase.expectedAction}, got ${processed.data.action}`
        );

        if (testCase.expectedOffer) {
          this.assert(
            `Offer Extraction - $${testCase.expectedOffer}`,
            processed.data.offer && Math.abs(processed.data.offer.amount - testCase.expectedOffer) < 100,
            `Expected ~$${testCase.expectedOffer}, got ${processed.data.offer?.amount}`
          );
        }
      }

      console.log('✅ Advanced Response Parsing tests passed\n'.green);
    } catch (error) {
      console.log('❌ Advanced Response Parsing tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 5: Safety Filters
  async testSafetyFilters() {
    console.log('🛡️ Testing Safety Filters...'.yellow);
    
    try {
      const unsafeInputs = [
        'Call me at 555-123-4567 to discuss',
        'My email is test@example.com',
        'This is a scam, don\'t buy this fake item',
        'Send payment to SSN: 123-45-6789'
      ];

      for (const unsafeInput of unsafeInputs) {
        const processed = await responseProcessor.processResponse(unsafeInput, this.testContext);
        
        this.assert(
          'Safety Filter Application',
          processed.data.message.includes('FILTERED') || 
          processed.data.message !== unsafeInput,
          'Should filter or sanitize unsafe content'
        );
      }

      console.log('✅ Safety Filters tests passed\n'.green);
    } catch (error) {
      console.log('❌ Safety Filters tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 6: Business Logic Validation
  async testBusinessLogicValidation() {
    console.log('💼 Testing Business Logic Validation...'.yellow);
    
    try {
      // Test unreasonable offers
      const highOfferContext = { ...this.testContext, currentOffer: 5000 }; // Way above base price
      const highOfferResponse = await responseProcessor.processResponse(
        'I accept your generous offer!', 
        highOfferContext
      );

      this.assert(
        'High Offer Validation',
        highOfferResponse.data.metadata.businessValidationErrors || 
        highOfferResponse.data.confidence < 0.8,
        'Should flag unreasonably high offers'
      );

      // Test final round logic
      const finalRoundContext = { ...this.testContext, rounds: this.testContext.maxRounds };
      const finalResponse = await responseProcessor.processResponse(
        'Let\'s continue negotiating', 
        finalRoundContext
      );

      this.assert(
        'Final Round Logic',
        finalResponse.data.action !== 'continue' || 
        finalResponse.data.metadata.businessValidationErrors,
        'Should not allow continuation past max rounds'
      );

      console.log('✅ Business Logic Validation tests passed\n'.green);
    } catch (error) {
      console.log('❌ Business Logic Validation tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 7: Fallback Mechanisms
  async testFallbackMechanisms() {
    console.log('🔄 Testing Fallback Mechanisms...'.yellow);
    
    try {
      // Test with invalid context
      const invalidContext = { ...this.testContext, basePrice: -100 };
      const fallbackResponse = await responseProcessor.processResponse(
        'Test response', 
        invalidContext
      );

      this.assert(
        'Invalid Context Handling',
        fallbackResponse.status === 'error' || fallbackResponse.data.metadata.isFallback,
        'Should handle invalid context gracefully'
      );

      // Test GeminiService fallback
      const fallbackTest = GeminiService.getFallbackResponse(this.testContext);
      this.assert(
        'Gemini Service Fallback',
        fallbackTest.content && fallbackTest.action && fallbackTest.confidence !== undefined,
        'Should provide valid fallback response structure'
      );

      console.log('✅ Fallback Mechanisms tests passed\n'.green);
    } catch (error) {
      console.log('❌ Fallback Mechanisms tests failed\n'.red);
      console.error(error);
    }
  }

  // Test 8: Integration Flow
  async testIntegrationFlow() {
    console.log('🔗 Testing Full Integration Flow...'.yellow);
    
    try {
      // Test complete negotiation flow
      const negotiationId = 'integration_test_' + Date.now();
      
      // Step 1: Create context
      contextManager.createContext(negotiationId, {
        productInfo: { title: this.testContext.productTitle },
        settings: { maxRounds: 5 }
      });

      // Step 2: Generate AI response using enhanced system
      const aiResponse = await GeminiService.generateNegotiationResponse({
        ...this.testContext,
        negotiationId
      });

      this.assert(
        'AI Response Generation',
        aiResponse.content && aiResponse.action && aiResponse.confidence !== undefined,
        'Should generate complete AI response'
      );

      // Step 3: Process response
      const processed = await responseProcessor.processResponse(aiResponse.content, {
        ...this.testContext,
        negotiationId
      });

      this.assert(
        'Response Processing Integration',
        processed.status === 'success' && processed.data.message,
        'Should successfully process AI response'
      );

      // Step 4: Update context
      contextManager.addMessage(negotiationId, {
        content: processed.data.message,
        sender: 'ai',
        action: processed.data.action,
        offer: processed.data.offer,
        confidence: processed.data.confidence / 100
      });

      // Step 5: Verify context update
      const updatedContext = contextManager.getContext(negotiationId, true);
      this.assert(
        'Context Update Integration',
        updatedContext.messages.length > 0 && updatedContext.analytics.successProbability,
        'Should update context with analytics'
      );

      console.log('✅ Full Integration Flow tests passed\n'.green);
    } catch (error) {
      console.log('❌ Full Integration Flow tests failed\n'.red);
      console.error(error);
    }
  }

  // Helper method for assertions
  assert(testName, condition, message = '') {
    this.results.total++;
    
    if (condition) {
      this.results.passed++;
      this.results.testDetails.push({
        name: testName,
        status: 'PASS',
        message: message
      });
      console.log(`  ✅ ${testName}`.green);
    } else {
      this.results.failed++;
      this.results.testDetails.push({
        name: testName,
        status: 'FAIL',
        message: message
      });
      console.log(`  ❌ ${testName}: ${message}`.red);
    }
  }

  // Print test summary
  printSummary() {
    console.log('\n📊 Day 12 Test Summary'.cyan.bold);
    console.log('='.repeat(50).cyan);
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`.green);
    console.log(`Failed: ${this.results.failed}`.red);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:'.red.bold);
      this.results.testDetails
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.message}`.red);
        });
    }

    const status = this.results.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED';
    console.log(`\n${status}\n`.bold);
  }

  // Performance benchmark
  async runPerformanceBenchmark() {
    console.log('⚡ Running Performance Benchmark...'.yellow);
    
    const iterations = 10;
    const startTime = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      await responseProcessor.processResponse(
        `Test response ${i}: I would like to offer $${1800 + i * 50}`,
        this.testContext
      );
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / iterations;
    
    console.log(`Average processing time: ${avgTime.toFixed(2)}ms`.cyan);
    console.log(`Throughput: ${(1000 / avgTime).toFixed(1)} responses/second`.cyan);
    
    this.assert(
      'Performance Benchmark',
      avgTime < 1000, // Should process in under 1 second
      `Average processing time: ${avgTime.toFixed(2)}ms`
    );
  }
}

// CLI execution
if (require.main === module) {
  const testSuite = new Day12TestSuite();
  
  testSuite.runAllTests()
    .then(async (success) => {
      await testSuite.runPerformanceBenchmark();
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite error:', error);
      process.exit(1);
    });
}

module.exports = Day12TestSuite;

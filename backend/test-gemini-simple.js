// Simple Gemini API Test
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API Configuration...\n');
  
  try {
    // Initialize with correct configuration
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 100
      }
    });

    console.log('✅ Gemini AI initialized successfully');
    
    // Test basic generation
    const prompt = "Hello, please respond with 'API is working' to confirm connectivity.";
    console.log('🔄 Sending test prompt...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Received response:', text);
    console.log('🎉 Gemini API is working correctly!\n');
    
    return true;
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  testGeminiAPI()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = testGeminiAPI;

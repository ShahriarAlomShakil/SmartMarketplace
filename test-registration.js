const axios = require('axios');

async function testRegistration() {
  try {
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    };

    console.log('Testing registration with:', testUser);

    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('Registration successful!');
    console.log('Status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Verify the response contains the expected fields
    const { data } = response.data;
    if (data.accessToken && data.user) {
      console.log('✅ Registration returns correct token format');
      console.log('✅ Access Token:', data.accessToken ? 'Present' : 'Missing');
      console.log('✅ Refresh Token:', data.refreshToken ? 'Present' : 'Missing');
      console.log('✅ User Data:', data.user ? 'Present' : 'Missing');
    } else {
      console.log('❌ Registration response format incorrect');
    }

  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();

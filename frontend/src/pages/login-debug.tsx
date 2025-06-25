import React, { useState, useEffect } from 'react';
import Head from 'next/head';

/**
 * Comprehensive Login Debug Page
 * Tests all aspects of the login functionality
 */
const LoginDebugPage: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    addResult('🔍 Starting comprehensive login debug tests...');

    // Test 1: Check if fetch is available
    addResult('📡 Test 1: Checking fetch API availability...');
    if (typeof fetch === 'undefined') {
      addResult('❌ fetch API is not available!');
      setIsRunning(false);
      return;
    }
    addResult('✅ fetch API is available');

    // Test 2: Check environment variables
    addResult('🌍 Test 2: Checking environment variables...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    addResult(`📊 API_BASE_URL: ${apiUrl}`);

    // Test 3: Test backend connectivity
    addResult('🔗 Test 3: Testing backend connectivity...');
    try {
      const healthResponse = await fetch(`${apiUrl}/api/health`);
      addResult(`📡 Health check status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        addResult('✅ Backend server is reachable');
      } else {
        addResult('⚠️ Backend server responded but with error');
      }
    } catch (error) {
      addResult(`❌ Cannot reach backend server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Test CORS preflight
    addResult('🛡️ Test 4: Testing CORS preflight...');
    try {
      const corsResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      addResult(`📡 CORS preflight status: ${corsResponse.status}`);
      if (corsResponse.ok) {
        addResult('✅ CORS preflight successful');
      } else {
        addResult('❌ CORS preflight failed');
      }
    } catch (error) {
      addResult(`❌ CORS preflight error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 5: Test actual login API
    addResult('🔐 Test 5: Testing login API...');
    try {
      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
      });

      addResult(`📡 Login API status: ${loginResponse.status}`);
      
      if (loginResponse.ok) {
        const data = await loginResponse.json();
        addResult(`✅ Login API successful: ${data.user?.email}`);
        addResult(`🎫 Token received: ${data.accessToken ? 'Yes' : 'No'}`);
      } else {
        const errorData = await loginResponse.json();
        addResult(`❌ Login API failed: ${errorData.message}`);
      }
    } catch (error) {
      addResult(`❌ Login API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 6: Test localStorage
    addResult('💾 Test 6: Testing localStorage...');
    try {
      localStorage.setItem('test', 'value');
      const testValue = localStorage.getItem('test');
      localStorage.removeItem('test');
      if (testValue === 'value') {
        addResult('✅ localStorage is working');
      } else {
        addResult('❌ localStorage test failed');
      }
    } catch (error) {
      addResult(`❌ localStorage error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 7: Check for React dev tools and console
    addResult('🔧 Test 7: Environment check...');
    addResult(`🌍 Node ENV: ${process.env.NODE_ENV}`);
    addResult(`🔧 Dev mode: ${process.env.NODE_ENV === 'development' ? 'Yes' : 'No'}`);
    addResult(`📱 User agent: ${navigator.userAgent}`);
    addResult(`🌐 Location: ${window.location.href}`);

    addResult('🎉 All tests completed!');
    setIsRunning(false);
  };

  useEffect(() => {
    // Run tests on component mount
    runTests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Login Debug - Smart Marketplace</title>
      </Head>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '2rem',
        fontFamily: 'monospace'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
            🔍 Login Debug Dashboard
          </h1>

          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button
              onClick={runTests}
              disabled={isRunning}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isRunning ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {isRunning ? 'Running Tests...' : 'Run Tests Again'}
            </button>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1rem',
            borderRadius: '4px',
            maxHeight: '500px',
            overflowY: 'auto',
            border: '1px solid #dee2e6'
          }}>
            {results.map((result, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.25rem',
                  fontSize: '0.9rem',
                  color: result.includes('❌') ? '#dc3545' : 
                         result.includes('✅') ? '#28a745' :
                         result.includes('⚠️') ? '#ffc107' : '#333'
                }}
              >
                {result}
              </div>
            ))}
            {results.length === 0 && (
              <div style={{ textAlign: 'center', color: '#6c757d' }}>
                Test results will appear here...
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#6c757d' }}>
            <p><strong>Instructions:</strong></p>
            <ul>
              <li>Open browser console (F12) for detailed logs</li>
              <li>Check Network tab for failed requests</li>
              <li>Look for any JavaScript errors in Console</li>
              <li>Frontend: http://localhost:3001</li>
              <li>Backend: http://localhost:5000</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginDebugPage;

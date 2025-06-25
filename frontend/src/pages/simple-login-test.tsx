import React, { useState } from 'react';

/**
 * Simple Login Test Component - Minimal dependencies for debugging
 */
const SimpleLoginTest: React.FC = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPassword123!');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Simple login test started');
    
    setLoading(true);
    setResult('Testing...');

    try {
      console.log('📡 Making API request to:', 'http://localhost:5000/api/auth/login');
      console.log('📝 Request data:', { email, password: '***' });

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login successful:', data);
        setResult(`✅ SUCCESS: Logged in as ${data.user.email}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Login failed:', errorData);
        setResult(`❌ FAILED: ${errorData.message}`);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setResult(`💥 ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#333' }}>
          🔍 Simple Login Test
        </h1>

        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
        </form>

        {result && (
          <div style={{
            padding: '1rem',
            backgroundColor: result.includes('SUCCESS') ? '#d4edda' : '#f8d7da',
            color: result.includes('SUCCESS') ? '#155724' : '#721c24',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {result}
          </div>
        )}

        <div style={{
          fontSize: '0.875rem',
          color: '#666',
          textAlign: 'center'
        }}>
          <p>Open browser console (F12) to see detailed logs</p>
          <p>Frontend: localhost:3001 | Backend: localhost:5000</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginTest;

import React from 'react';

export default function TestPage() {
  return (
    <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center' }}>
        Test Page - Next.js is Working!
      </h1>
      <p style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>
        This is a minimal test page to verify Next.js is running correctly.
      </p>
    </div>
  );
}

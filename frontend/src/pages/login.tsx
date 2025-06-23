import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout';
import { LoginForm } from '../components/auth/LoginForm';
import { ProtectedRoute } from '../components/ProtectedRoute';

/**
 * Login Page - Modern login page with blurry background design
 * 
 * Features:
 * - Full page modern design with blur backgrounds
 * - Responsive layout
 * - SEO optimized
 * - Protected route integration
 */
const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign In - Smart Marketplace</title>
        <meta name="description" content="Sign in to your Smart Marketplace account" />
      </Head>
      
      <ProtectedRoute requireAuth={false}>
        <Layout navigation={false}>
          <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default LoginPage;

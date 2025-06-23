import React from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ProtectedRoute } from '../components/ProtectedRoute';

/**
 * Register Page - Modern registration page with blurry background design
 * 
 * Features:
 * - Full page modern design with blur backgrounds
 * - Responsive layout
 * - SEO optimized
 * - Protected route integration
 */
const RegisterPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Create Account - Smart Marketplace</title>
        <meta name="description" content="Create your Smart Marketplace account and start buying and selling" />
      </Head>
      
      <ProtectedRoute requireAuth={false}>
        <Layout navigation={false}>
          <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
              <RegisterForm />
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default RegisterPage;

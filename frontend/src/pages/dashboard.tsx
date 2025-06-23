import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { UserProfileCard } from '../components/auth/UserProfileCard';
import { SellerDashboard } from '../components/dashboard/SellerDashboard';
import { BlurCard } from '../components/ui/BlurCard';
import { ModernButton } from '../components/ui/ModernButton';

/**
 * Dashboard Page - User dashboard with profile and overview
 * 
 * Features:
 * - Protected route for authenticated users
 * - User profile card display
 * - Modern design with blur backgrounds
 * - Quick action buttons
 */
const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'seller'>('overview');

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    // Implement profile editing logic
  };

  const handleViewProfile = () => {
    console.log('View profile clicked');
    // Implement profile viewing logic
  };

  const handleCreateProduct = () => {
    router.push('/sell');
  };

  return (
    <>
      <Head>
        <title>Dashboard - Smart Marketplace</title>
        <meta name="description" content="Your Smart Marketplace dashboard" />
      </Head>
      
      <ProtectedRoute>
        <Layout>
          <div className="py-12">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Welcome Section */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-white/70">
                  Manage your account and explore the marketplace
                </p>
              </div>

              {/* Tab Navigation */}
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('seller')}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'seller'
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Seller Dashboard
                  </button>
                </div>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'overview' ? (
                <>
                  {/* User Profile Section */}
                  {user && (
                    <UserProfileCard
                      user={user}
                      onEdit={handleEditProfile}
                      onViewProfile={handleViewProfile}
                    />
                  )}              {/* Quick Actions */}
              <BlurCard variant="elevated" className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ModernButton
                    variant="primary"
                    onClick={handleCreateProduct}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    }
                  >
                    List Product
                  </ModernButton>
                  
                  <ModernButton
                    variant="secondary"
                    onClick={() => router.push('/products')}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  >
                    Browse Products
                  </ModernButton>
                  
                  <ModernButton
                    variant="outline"
                    onClick={() => router.push('/negotiations')}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    }
                  >
                    My Negotiations
                  </ModernButton>
                </div>
              </BlurCard>

              {/* Account Settings */}
              <BlurCard variant="elevated" className="p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <h3 className="text-white font-medium">Profile Settings</h3>
                      <p className="text-white/60 text-sm">Update your personal information</p>
                    </div>
                    <ModernButton variant="ghost" size="sm" onClick={handleEditProfile}>
                      Edit
                    </ModernButton>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <h3 className="text-white font-medium">Security</h3>
                      <p className="text-white/60 text-sm">Manage password and 2FA</p>
                    </div>
                    <ModernButton variant="ghost" size="sm">
                      Manage
                    </ModernButton>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-white font-medium">Sign Out</h3>
                      <p className="text-white/60 text-sm">Sign out of your account</p>
                    </div>
                    <ModernButton 
                      variant="destructive" 
                      size="sm"
                      onClick={logout}
                    >
                      Sign Out
                    </ModernButton>
                  </div>
                </div>
              </BlurCard>
                </>
              ) : (
                <>
                  {/* Seller Dashboard */}
                  <SellerDashboard />
                </>
              )}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default DashboardPage;

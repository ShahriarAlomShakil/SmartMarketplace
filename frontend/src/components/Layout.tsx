import React from 'react';
import Head from 'next/head';
import { LayoutProps } from '../types/ui';
import { cn } from '../utils/design';
import { Navigation } from './Navigation';

/**
 * Layout - Main layout component with dynamic gradient backgrounds and blur overlays
 * 
 * Features:
 * - Dynamic gradient backgrounds
 * - Optional navigation
 * - Sidebar support
 * - Footer support
 * - Responsive design
 * - Modern blur overlays
 * - SEO head management
 */
interface ExtendedLayoutProps extends LayoutProps {
  title?: string;
  description?: string;
  showNavigation?: boolean;
}

export const Layout: React.FC<ExtendedLayoutProps> = ({
  children,
  navigation = true,
  sidebar,
  footer,
  className,
  title = 'Smart Marketplace',
  description = 'AI-powered marketplace with smart negotiation',
  showNavigation = true
}) => {
  const shouldShowNav = navigation && showNavigation;

  const defaultFooter = (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SM</span>
          </div>
          <div>
            <span className="text-white font-semibold">Smart Marketplace</span>
            <div className="text-white/60 text-xs">AI-Powered Trading</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-white/60">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        
        <p className="text-white/50 text-sm">
          © 2025 Smart Marketplace. All rights reserved.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>

      <div className={cn('modern-layout', className)}>
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient orbs */}
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '0s', animationDuration: '8s' }} 
          />
          <div 
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '2s', animationDuration: '10s' }} 
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-float" 
            style={{ animationDelay: '4s', animationDuration: '12s' }} 
          />
          
          {/* Secondary ambient lights */}
          <div 
            className="absolute top-20 right-20 w-32 h-32 bg-cyan-400/15 rounded-full blur-2xl animate-float" 
            style={{ animationDelay: '1s', animationDuration: '6s' }} 
          />
          <div 
            className="absolute bottom-32 left-20 w-40 h-40 bg-emerald-400/15 rounded-full blur-2xl animate-float" 
            style={{ animationDelay: '3s', animationDuration: '9s' }} 
          />
          <div 
            className="absolute top-1/3 right-1/3 w-24 h-24 bg-rose-400/10 rounded-full blur-xl animate-float" 
            style={{ animationDelay: '5s', animationDuration: '7s' }} 
          />
        </div>

        {/* Navigation */}
        {shouldShowNav && <Navigation items={[]} />}

        {/* Main Content Area */}
        <div className="relative z-10 flex-1">
          {sidebar ? (
            <div className="flex">
              {/* Sidebar */}
              <aside className="w-64 flex-shrink-0 hidden lg:block">
                <div className="h-full p-4">
                  {sidebar}
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-h-screen">
                <div className="responsive-padding">
                  {children}
                </div>
              </main>
            </div>
          ) : (
            <main className="min-h-screen">
              <div className="responsive-padding">
                {children}
              </div>
            </main>
          )}
        </div>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-lg dark:bg-black/80">
          <div className="max-w-7xl mx-auto responsive-padding">
            {footer || defaultFooter}
          </div>
        </footer>

        {/* Ambient lighting effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
        </div>
      </div>
    </>
  );
};

export default Layout;

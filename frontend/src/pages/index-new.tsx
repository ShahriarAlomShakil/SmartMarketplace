import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { 
  BlurCard, 
  GlassButton, 
  BackdropBlur, 
  ThemeToggle,
  ModernButton
} from '../components/ui';

// Animation hook for staggered entrance effects
const useScrollAnimation = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => {
              const newSet = new Set(prev);
              newSet.add(entry.target.id);
              return newSet;
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return visibleElements;
};

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ 
  end, 
  suffix = '', 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${end}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [end, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <div 
      id={`counter-${end}`}
      className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
    >
      {count.toLocaleString()}{suffix}
    </div>
  );
};

export default function Home() {
  const visibleElements = useScrollAnimation();
  const [currentFeature, setCurrentFeature] = useState(0);

  // Auto-rotate features showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "AI-Powered Negotiations",
      description: "Experience intelligent bargaining with our Gemini-powered AI that understands market dynamics and human psychology.",
      gradient: "from-blue-500 to-purple-600",
      stats: "95% Success Rate"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Smart Price Discovery",
      description: "Our AI analyzes market trends, product conditions, and user preferences to suggest optimal pricing strategies.",
      gradient: "from-green-500 to-teal-600",
      stats: "Real-time Analysis"
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Personalized Matching",
      description: "Advanced algorithms connect buyers and sellers based on preferences, location, and transaction history.",
      gradient: "from-purple-500 to-pink-600",
      stats: "Smart Connections"
    }
  ];

  return (
    <Layout 
      title="Smart Marketplace - AI-Powered Trading Platform" 
      description="Experience the future of online trading with AI-powered negotiations, smart recommendations, and seamless transactions."
    >
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 lg:py-24">
          <div className="text-center">
            {/* Theme Toggle */}
            <div className="mb-8 flex justify-center">
              <div 
                data-animate
                id="theme-toggle"
                className={`transition-all duration-700 ${
                  visibleElements.has('theme-toggle') 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
              >
                <ThemeToggle />
              </div>
            </div>

            {/* Main Headline */}
            <div 
              data-animate
              id="hero-title"
              className={`transition-all duration-1000 delay-200 ${
                visibleElements.has('hero-title') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <h1 className="heading-xl text-white dark:text-white mb-6">
                Smart Marketplace
              </h1>
              <div className="text-2xl lg:text-4xl font-medium bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
                AI-Powered Buy & Sell Platform
              </div>
            </div>
            
            {/* Hero Description */}
            <div 
              data-animate
              id="hero-description"
              className={`transition-all duration-1000 delay-400 ${
                visibleElements.has('hero-description') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <p className="body-lg text-white/80 dark:text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience intelligent negotiations powered by <strong className="text-white">Google Gemini</strong>. 
                List products with flexible pricing, let buyers bargain with AI, and close deals faster than ever.
              </p>
            </div>

            {/* CTA Buttons */}
            <div 
              data-animate
              id="hero-cta"
              className={`transition-all duration-1000 delay-600 ${
                visibleElements.has('hero-cta') 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/register">
                  <ModernButton variant="primary" size="lg" className="group">
                    <span className="mr-2">🚀</span>
                    Start Selling Now
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/20 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </ModernButton>
                </Link>
                
                <Link href="/dashboard">
                  <ModernButton variant="outline" size="lg" className="group">
                    <span className="mr-2">🛍️</span>
                    Browse Products
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </ModernButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24">
          <div 
            data-animate
            id="features-title"
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has('features-title') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-lg text-white dark:text-white mb-4">
              Why Choose Smart Marketplace?
            </h2>
            <p className="body-lg text-white/70 dark:text-white/60 max-w-2xl mx-auto">
              Powered by cutting-edge AI technology for smarter, faster, and more profitable trading experiences.
            </p>
          </div>

          {/* Interactive Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                data-animate
                id={`feature-${index}`}
                className={`transition-all duration-1000 ${
                  visibleElements.has(`feature-${index}`) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${600 + index * 200}ms` }}
              >
                <BlurCard 
                  variant="elevated" 
                  className={`p-8 h-full group cursor-pointer transform transition-all duration-500 ${
                    currentFeature === index ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-white font-semibold text-xl mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/70 dark:text-white/60 mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="text-sm font-medium text-blue-400 dark:text-blue-300">
                    {feature.stats}
                  </div>
                  
                  {/* Animated border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
                </BlurCard>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 lg:py-24">
          <div 
            data-animate
            id="how-it-works"
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has('how-it-works') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-lg text-white dark:text-white mb-4">
              How It Works
            </h2>
            <p className="body-lg text-white/70 dark:text-white/60 max-w-2xl mx-auto mb-12">
              Simple, smart, and automated trading in three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "List Your Product",
                description: "Upload photos, set your base price and minimum acceptable price. Our AI will handle the rest.",
                icon: "📱"
              },
              {
                step: "02", 
                title: "AI Negotiates",
                description: "Buyers interact with our Gemini-powered AI that negotiates on your behalf using smart strategies.",
                icon: "🤖"
              },
              {
                step: "03",
                title: "Close the Deal",
                description: "When both parties agree, complete the transaction securely through our platform.",
                icon: "✅"
              }
            ].map((step, index) => (
              <div
                key={index}
                data-animate
                id={`step-${index}`}
                className={`text-center transition-all duration-1000 ${
                  visibleElements.has(`step-${index}`) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${400 + index * 200}ms` }}
              >
                <BlurCard variant="outlined" className="p-8 h-full group hover:scale-105 transition-transform duration-300">
                  <div className="text-6xl mb-4 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    {step.icon}
                  </div>
                  
                  <div className="text-4xl font-bold text-blue-400 dark:text-blue-300 mb-4">
                    {step.step}
                  </div>
                  
                  <h3 className="text-white font-semibold text-xl mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-white/70 dark:text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </BlurCard>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 lg:py-24">
          <BlurCard 
            variant="elevated" 
            className="p-8 lg:p-12"
            data-animate
            id="stats-section"
          >
            <div className={`text-center transition-all duration-1000 ${
              visibleElements.has('stats-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="heading-lg text-white dark:text-white mb-4">
                Trusted by Thousands
              </h2>
              <p className="body-lg text-white/70 dark:text-white/60 mb-12 max-w-2xl mx-auto">
                Join our growing community of smart traders who are revolutionizing online commerce.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { number: 15000, suffix: "+", label: "Active Users" },
                  { number: 75000, suffix: "+", label: "Successful Trades" },
                  { number: 99, suffix: ".8%", label: "Success Rate" },
                  { number: 2.5, suffix: "M+", label: "Total Volume" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <AnimatedCounter 
                      end={stat.number} 
                      suffix={stat.suffix}
                      duration={2500 + index * 200}
                    />
                    <div className="text-white/70 dark:text-white/60 mt-2 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurCard>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <BlurCard 
            variant="elevated" 
            className="text-center p-8 lg:p-12"
            data-animate
            id="final-cta"
          >
            <div className={`transition-all duration-1000 ${
              visibleElements.has('final-cta') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <h2 className="heading-lg text-white dark:text-white mb-4">
                Ready to Start Trading Smarter?
              </h2>
              <p className="body-lg text-white/80 dark:text-white/70 mb-8 max-w-xl mx-auto">
                Join thousands of users who are already experiencing the future of online trading.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/register">
                  <ModernButton variant="primary" size="lg" className="group">
                    <span className="mr-2">🎯</span>
                    Create Free Account
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/20 to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </ModernButton>
                </Link>
                
                <Link href="/dashboard">
                  <ModernButton variant="ghost" size="lg" className="group">
                    <span className="mr-2">👀</span>
                    Explore Demo
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                  </ModernButton>
                </Link>
              </div>
              
              <p className="text-white/60 dark:text-white/50 text-sm">
                No credit card required • Free forever • Start in 30 seconds
              </p>
            </div>
          </BlurCard>
        </section>
      </div>
    </Layout>
  );
}

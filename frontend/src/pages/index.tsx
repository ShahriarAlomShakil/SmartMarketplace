import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
// Using named exports for UI components
import { BlurCard } from '../components/ui/BlurCard';
import { ModernButton } from '../components/ui/ModernButton';
import { BackdropBlur } from '../components/ui/BackdropBlur';

// Simple theme toggle hook
const useSimpleTheme = () => {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    // Set initial theme
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  
  const toggleTheme = () => setIsDark(!isDark);
  
  return { isDark, toggleTheme };
};

// Simple Theme Toggle Component
const SimpleThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useSimpleTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-5 h-5 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

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

// Scroll progress indicator
const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(scrolled);
    };
    
    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
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
      showNavigation={true}
    >
      <ScrollProgress />
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
                <SimpleThemeToggle />
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
                
                <Link href="/products">
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

        {/* Testimonials Section */}
        <section className="py-16 lg:py-24">
          <div 
            data-animate
            id="testimonials-title"
            className={`text-center mb-16 transition-all duration-1000 ${
              visibleElements.has('testimonials-title') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="heading-lg text-white dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="body-lg text-white/70 dark:text-white/60 max-w-2xl mx-auto">
              Real feedback from traders who are already using Smart Marketplace to close better deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Sarah Chen",
                role: "Electronics Seller",
                avatar: "🧑‍💼",
                rating: 5,
                testimonial: "The AI negotiation is incredible! I sold my MacBook for 15% more than I expected. The AI knew exactly when to hold firm and when to compromise."
              },
              {
                name: "Mike Rodriguez", 
                role: "Car Enthusiast",
                avatar: "🚗",
                rating: 5,
                testimonial: "Bought my dream car through Smart Marketplace. The AI was so realistic, I almost forgot I wasn't talking to a human. Got a fair deal for both of us."
              },
              {
                name: "Emma Thompson",
                role: "Fashion Reseller", 
                avatar: "👗",
                rating: 5,
                testimonial: "As a busy mom, I love that the AI handles negotiations while I sleep. Woke up to 3 successful deals! This platform is a game-changer."
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                data-animate
                id={`testimonial-${index}`}
                className={`transition-all duration-1000 ${
                  visibleElements.has(`testimonial-${index}`) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${400 + index * 200}ms` }}
              >
                <BlurCard variant="elevated" className="p-6 h-full text-center">
                  <div className="text-4xl mb-4">{testimonial.avatar}</div>
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 dark:text-white/70 mb-4 italic leading-relaxed">
                    "{testimonial.testimonial}"
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/60 text-sm">{testimonial.role}</div>
                  </div>
                </BlurCard>
              </div>
            ))}
          </div>
        </section>

        {/* Live Demo Section */}
        <section className="py-16 lg:py-24">
          <BlurCard 
            variant="elevated" 
            className="p-8 lg:p-12"
            data-animate
            id="demo-section"
          >
            <div className={`transition-all duration-1000 ${
              visibleElements.has('demo-section') 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="heading-lg text-white dark:text-white mb-6">
                    See AI Negotiation in Action
                  </h2>
                  <p className="body-lg text-white/80 dark:text-white/70 mb-8 leading-relaxed">
                    Watch how our Gemini-powered AI handles real negotiations. Smart, adaptive, and surprisingly human-like.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    {[
                      "🧠 Learns from each interaction",
                      "⚡ Responds in real-time", 
                      "🎯 Optimizes for win-win outcomes",
                      "🔒 Respects your pricing boundaries"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="text-lg">{feature.split(' ')[0]}</div>
                        <span className="text-white/90">{feature.substring(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link href="/demo">
                    <ModernButton variant="primary" size="lg" className="group">
                      <span className="mr-2">▶️</span>
                      Try Live Demo
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-green-600/20 to-green-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                    </ModernButton>
                  </Link>
                </div>
                
                <div className="relative">
                  <BlurCard variant="outlined" className="p-6">
                    <div className="text-white/90 space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">B</div>
                        <div className="flex-1">
                          <div className="bg-blue-500/20 rounded-2xl p-3 border border-blue-500/30">
                            "I'd like to buy your iPhone for $600"
                          </div>
                          <div className="text-xs text-white/60 mt-1">Buyer • Just now</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 text-right">
                          <div className="bg-purple-500/20 rounded-2xl p-3 border border-purple-500/30 inline-block">
                            "Thanks for your interest! The iPhone is in excellent condition. I could do $750 - it's barely used and includes the original box."
                          </div>
                          <div className="text-xs text-white/60 mt-1">AI Agent • 2s ago</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">AI</div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">B</div>
                        <div className="flex-1">
                          <div className="bg-blue-500/20 rounded-2xl p-3 border border-blue-500/30">
                            "How about $680? That's my final offer"
                          </div>
                          <div className="text-xs text-white/60 mt-1">Buyer • Just now</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center py-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-white/60 text-sm ml-3">AI is thinking...</span>
                      </div>
                    </div>
                  </BlurCard>
                </div>
              </div>
            </div>
          </BlurCard>
        </section>

        {/* Trust & Security Section */}
        <section className="py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🔒",
                title: "Bank-Level Security",
                description: "Your data and transactions are protected with enterprise-grade encryption."
              },
              {
                icon: "🤝",
                title: "Verified Users",
                description: "All users go through identity verification for safe trading."
              },
              {
                icon: "💳",
                title: "Secure Payments",
                description: "Integrated with trusted payment processors for safe transactions."
              },
              {
                icon: "🛡️",
                title: "Fraud Protection",
                description: "AI-powered fraud detection keeps your trades secure."
              }
            ].map((item, index) => (
              <div
                key={index}
                data-animate
                id={`trust-${index}`}
                className={`text-center transition-all duration-1000 ${
                  visibleElements.has(`trust-${index}`) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + index * 150}ms` }}
              >
                <div className="text-4xl mb-4 animate-float" style={{ animationDelay: `${index * 0.5}s` }}>
                  {item.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">
                  {item.title}
                </h3>
                <p className="text-white/70 dark:text-white/60 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile FAB (Floating Action Button) */}
        <div className="fixed bottom-6 right-6 z-50 lg:hidden">
          <div 
            data-animate
            id="mobile-fab"
            className={`transition-all duration-1000 ${
              visibleElements.has('mobile-fab') 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            <Link href="/register">
              <button className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110">
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll to Top Button */}
        <div className="fixed bottom-6 left-6 z-50 hidden lg:block">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center justify-center group opacity-0 hover:opacity-100"
            style={{
              opacity: typeof window !== 'undefined' && window.scrollY > 500 ? 1 : 0
            }}
          >
            <svg className="w-5 h-5 text-white group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </div>

        <ScrollProgress />
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
  BlurCard, 
  ModernButton, 
  BackdropBlur, 
  ThemeToggle,
  useTheme 
} from '../components/ui';

/**
 * Day 3 Component Showcase
 * 
 * This page demonstrates all the modern UI components with blurry backgrounds
 * created for Day 3 of the Smart Marketplace development plan.
 */
export default function Day3Complete() {
  const [cardVariant, setCardVariant] = useState<'default' | 'elevated' | 'outlined' | 'filled'>('default');
  const [blurIntensity, setBlurIntensity] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [buttonVariant, setButtonVariant] = useState<'primary' | 'secondary' | 'outline' | 'ghost'>('primary');

  return (
    <Layout title="Day 3 Complete - Modern UI Components">
      <div className="space-y-12 py-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="heading-xl text-white">
            Day 3 Complete
          </h1>
          <p className="body-lg text-white/80 max-w-2xl mx-auto">
            Modern UI Foundation with Blurry Backgrounds - All core components implemented 
            with beautiful glass morphism effects, smooth animations, and responsive design.
          </p>
          <div className="flex justify-center">
            <ThemeToggle className="text-white" />
          </div>
        </div>

        {/* Component Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* BlurCard Showcase */}
          <BlurCard variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="heading-md text-white mb-4">BlurCard Component</h2>
              <p className="body-md text-white/80 mb-6">
                Modern card component with configurable blur intensity and multiple variants.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Card Variant
                  </label>
                  <div className="flex gap-2">
                    {(['default', 'elevated', 'outlined', 'filled'] as const).map((variant) => (
                      <ModernButton
                        key={variant}
                        variant={cardVariant === variant ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setCardVariant(variant)}
                      >
                        {variant}
                      </ModernButton>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Blur Intensity
                  </label>
                  <div className="flex gap-2">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((intensity) => (
                      <ModernButton
                        key={intensity}
                        variant={blurIntensity === intensity ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setBlurIntensity(intensity)}
                      >
                        {intensity}
                      </ModernButton>
                    ))}
                  </div>
                </div>

                <BlurCard 
                  variant={cardVariant} 
                  blur={blurIntensity}
                  padding="md"
                  className="mt-4"
                >
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Sample Card</h3>
                    <p className="text-white/70 text-sm">
                      Variant: {cardVariant} | Blur: {blurIntensity}
                    </p>
                  </div>
                </BlurCard>
              </div>
            </div>
          </BlurCard>

          {/* ModernButton Showcase */}
          <BlurCard variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="heading-md text-white mb-4">ModernButton Component</h2>
              <p className="body-md text-white/80 mb-6">
                Modern button with smooth hover effects, multiple variants, and loading states.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Button Variant
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(['primary', 'secondary', 'outline', 'ghost'] as const).map((variant) => (
                      <ModernButton
                        key={variant}
                        variant={buttonVariant === variant ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setButtonVariant(variant)}
                      >
                        {variant}
                      </ModernButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white/90 font-medium">Button Sizes</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <ModernButton variant={buttonVariant} size="sm">Small</ModernButton>
                    <ModernButton variant={buttonVariant} size="md">Medium</ModernButton>
                    <ModernButton variant={buttonVariant} size="lg">Large</ModernButton>
                    <ModernButton variant={buttonVariant} size="xl">Extra Large</ModernButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white/90 font-medium">Button States</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <ModernButton variant={buttonVariant}>Normal</ModernButton>
                    <ModernButton variant={buttonVariant} loading>Loading</ModernButton>
                    <ModernButton variant={buttonVariant} disabled>Disabled</ModernButton>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white/90 font-medium">With Icons</h4>
                  <div className="flex items-center gap-3 flex-wrap">
                    <ModernButton 
                      variant={buttonVariant}
                      leftIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Add Item
                    </ModernButton>
                    <ModernButton 
                      variant={buttonVariant}
                      rightIcon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      }
                    >
                      Continue
                    </ModernButton>
                  </div>
                </div>
              </div>
            </div>
          </BlurCard>

          {/* BackdropBlur Showcase */}
          <BlurCard variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="heading-md text-white mb-4">BackdropBlur Component</h2>
              <p className="body-md text-white/80 mb-6">
                Configurable backdrop blur wrapper with multiple intensity levels.
              </p>
              
              <div className="space-y-4">
                {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((intensity) => (
                  <BackdropBlur 
                    key={intensity}
                    intensity={intensity}
                    className="p-4 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">Backdrop Blur: {intensity}</span>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm mt-2">
                        Notice how the blur intensity changes the backdrop effect
                      </p>
                    </div>
                  </BackdropBlur>
                ))}
              </div>
            </div>
          </BlurCard>

          {/* Typography Showcase */}
          <BlurCard variant="elevated" padding="lg" className="space-y-6">
            <div>
              <h2 className="heading-md text-white mb-4">Typography System</h2>
              <p className="body-md text-white/80 mb-6">
                Modern font stacks with responsive scaling and proper hierarchy.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h1 className="heading-xl text-white">Heading XL</h1>
                  <p className="text-white/60 text-sm">heading-xl class - Main hero headings</p>
                </div>
                
                <div>
                  <h2 className="heading-lg text-white">Heading Large</h2>
                  <p className="text-white/60 text-sm">heading-lg class - Section headings</p>
                </div>
                
                <div>
                  <h3 className="heading-md text-white">Heading Medium</h3>
                  <p className="text-white/60 text-sm">heading-md class - Subsection headings</p>
                </div>
                
                <div>
                  <p className="body-lg text-white">Body Large Text</p>
                  <p className="text-white/60 text-sm">body-lg class - Lead paragraphs</p>
                </div>
                
                <div>
                  <p className="body-md text-white">Body Medium Text</p>
                  <p className="text-white/60 text-sm">body-md class - Regular content</p>
                </div>
                
                <div>
                  <p className="body-sm text-white">Body Small Text</p>
                  <p className="text-white/60 text-sm">body-sm class - Helper text, captions</p>
                </div>
              </div>
            </div>
          </BlurCard>
        </div>

        {/* Design System Colors */}
        <BlurCard variant="elevated" padding="lg" className="space-y-6">
          <div>
            <h2 className="heading-md text-white mb-4">Design System Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div>
                <h3 className="text-white font-semibold mb-3">✨ Blur Effects</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Configurable blur intensity</li>
                  <li>• Responsive blur levels</li>
                  <li>• Performance optimized</li>
                  <li>• Cross-browser compatible</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">🎨 Modern Design</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Glass morphism effects</li>
                  <li>• Smooth hover transitions</li>
                  <li>• Dynamic gradients</li>
                  <li>• Consistent spacing</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">📱 Responsive</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Mobile-first approach</li>
                  <li>• Adaptive typography</li>
                  <li>• Touch-friendly targets</li>
                  <li>• Flexible layouts</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">♿ Accessible</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• ARIA attributes</li>
                  <li>• Keyboard navigation</li>
                  <li>• Focus management</li>
                  <li>• Screen reader support</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">🌙 Theme Support</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Dark/light modes</li>
                  <li>• System preference</li>
                  <li>• Smooth transitions</li>
                  <li>• Persistent storage</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-3">⚡ Performance</h3>
                <ul className="text-white/80 text-sm space-y-1">
                  <li>• Optimized animations</li>
                  <li>• Minimal bundle size</li>
                  <li>• Tree-shaking support</li>
                  <li>• Efficient renders</li>
                </ul>
              </div>
            </div>
          </div>
        </BlurCard>

        {/* Implementation Status */}
        <BlurCard variant="elevated" padding="lg" className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="heading-lg text-white">Day 3 Complete! ✅</h2>
          <p className="body-lg text-white/80 max-w-2xl mx-auto">
            All core UI components with modern design and blurry backgrounds have been successfully implemented. 
            The foundation is ready for Day 4 development.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <ModernButton variant="primary" size="lg">
              Continue to Day 4
            </ModernButton>
            <ModernButton variant="outline" size="lg">
              View Documentation
            </ModernButton>
          </div>
        </BlurCard>
      </div>
    </Layout>
  );
}

import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  BlurCard, 
  ModernButton, 
  BackdropBlur, 
  ThemeToggle,
  FullscreenBackdrop
} from '../components/ui';

export default function ComponentsShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <Layout title="Components Showcase" description="Modern blurry background UI components demo">
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="heading-xl text-white mb-4">
            Modern Blurry Components
          </h1>
          <p className="body-lg text-white/80 mb-8">
            Showcase of all UI components with modern blurry background design
          </p>
          <ThemeToggle />
        </div>

        <div className="space-y-16">
          {/* BlurCard Variants */}
          <section>
            <h2 className="heading-lg text-white mb-6">
              BlurCard Variants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <BlurCard variant="default" className="p-6">
                <h3 className="text-white font-medium mb-2">Default Card</h3>
                <p className="text-white/70 text-sm">Basic glass morphism card with default styling</p>
              </BlurCard>
              
              <BlurCard variant="elevated" className="p-6">
                <h3 className="text-white font-medium mb-2">Elevated Card</h3>
                <p className="text-white/70 text-sm">Enhanced with stronger blur and shadow effects</p>
              </BlurCard>
              
              <BlurCard variant="outlined" className="p-6">
                <h3 className="text-white font-medium mb-2">Outlined Card</h3>
                <p className="text-white/70 text-sm">Clear border definition</p>
              </BlurCard>
              
              <BlurCard variant="filled" className="p-6">
                <h3 className="text-white font-medium mb-2">Filled Card</h3>
                <p className="text-white/70 text-sm">More opacity and presence</p>
              </BlurCard>
            </div>
          </section>

          {/* ModernButton Variants */}
          <section>
            <h2 className="heading-lg text-white mb-6">
              ModernButton Variants & Sizes
            </h2>
            <BlurCard className="p-8">
              <div className="space-y-6">
                {/* Button Variants */}
                <div>
                  <h3 className="text-white font-medium mb-4">Button Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <ModernButton variant="primary">Primary Button</ModernButton>
                    <ModernButton variant="secondary">Secondary Button</ModernButton>
                    <ModernButton variant="outline">Outline Button</ModernButton>
                    <ModernButton variant="ghost">Ghost Button</ModernButton>
                  </div>
                </div>

                {/* Button Sizes */}
                <div>
                  <h3 className="text-white font-medium mb-4">Button Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <ModernButton size="sm">Small</ModernButton>
                    <ModernButton size="md">Medium</ModernButton>
                    <ModernButton size="lg">Large</ModernButton>
                    <ModernButton size="xl">Extra Large</ModernButton>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h3 className="text-white font-medium mb-4">Button States</h3>
                  <div className="flex flex-wrap gap-4">
                    <ModernButton>Normal</ModernButton>
                    <ModernButton loading={loading} onClick={handleLoadingDemo}>
                      {loading ? 'Loading...' : 'Click for Loading'}
                    </ModernButton>
                    <ModernButton disabled>Disabled</ModernButton>
                  </div>
                </div>
              </div>
            </BlurCard>
          </section>

          {/* BackdropBlur */}
          <section>
            <h2 className="heading-lg text-white mb-6">
              BackdropBlur Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BackdropBlur intensity="md" className="rounded-2xl p-8">
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-2">Medium Blur</h3>
                  <p className="text-white/70 text-sm">Perfect balance of blur and visibility</p>
                </div>
              </BackdropBlur>
              
              <BackdropBlur intensity="lg" className="rounded-2xl p-8">
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6">
                  <h3 className="text-white font-medium mb-2">Large Blur</h3>
                  <p className="text-white/70 text-sm">Strong blur effect for dramatic backgrounds</p>
                </div>
              </BackdropBlur>
            </div>
          </section>

          {/* Interactive Examples */}
          <section>
            <h2 className="heading-lg text-white mb-6">
              Interactive Examples
            </h2>
            <BlurCard className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-medium mb-4">Modal Demo</h3>
                  <ModernButton onClick={() => setShowModal(true)}>
                    Open Fullscreen Modal
                  </ModernButton>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-4">Theme Toggle</h3>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <span className="text-white/70 text-sm">Toggle between light, dark, and system themes</span>
                  </div>
                </div>
              </div>
            </BlurCard>
          </section>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showModal && (
        <FullscreenBackdrop onClick={() => setShowModal(false)}>
          <BlurCard variant="elevated" className="max-w-md mx-auto p-8 m-4">
            <h3 className="heading-md text-white mb-4">Fullscreen Modal</h3>
            <p className="body-md text-white/80 mb-6">
              This is a fullscreen backdrop with a centered modal. The background is blurred
              and darkened to focus attention on the modal content.
            </p>
            <div className="flex gap-4">
              <ModernButton onClick={() => setShowModal(false)}>
                Close Modal
              </ModernButton>
              <ModernButton variant="outline">
                Secondary Action
              </ModernButton>
            </div>
          </BlurCard>
        </FullscreenBackdrop>
      )}
    </Layout>
  );
}

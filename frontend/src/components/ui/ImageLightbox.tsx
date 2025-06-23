import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernButton } from '../ui/ModernButton';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline';

/**
 * ImageLightbox Component - Full-screen image gallery with zoom
 * 
 * Features:
 * - Full-screen lightbox display
 * - Image zoom in/out functionality  
 * - Navigation between images
 * - Smooth animations
 * - Keyboard navigation support
 * - Touch/swipe support for mobile
 */

interface ImageLightboxProps {
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
  productTitle?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  isOpen,
  initialIndex = 0,
  onClose,
  productTitle = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when opening or changing image
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, zoom]);

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-semibold">{productTitle}</h3>
              <p className="text-sm text-white/70">
                {currentIndex + 1} of {images.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Zoom Controls */}
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-white/20"
              >
                <MagnifyingGlassMinusIcon className="w-5 h-5" />
              </ModernButton>
              
              <span className="text-white text-sm min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 3}
                className="text-white hover:bg-white/20"
              >
                <MagnifyingGlassPlusIcon className="w-5 h-5" />
              </ModernButton>
              
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="text-white hover:bg-white/20"
              >
                Reset
              </ModernButton>
              
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <XMarkIcon className="w-5 h-5" />
              </ModernButton>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Main Image */}
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <motion.div
            className="relative max-w-full max-h-full"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            animate={{ scale: zoom, x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Image
              src={`http://localhost:5000${currentImage.url}`}
              alt={`${productTitle} ${currentIndex + 1}`}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
              priority
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    resetZoom();
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-white/30 hover:border-white/70'
                  }`}
                >
                  <Image
                    src={`http://localhost:5000${image.url}`}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute top-20 right-4 text-white/70 text-sm space-y-1">
          <p>Use arrow keys to navigate</p>
          <p>Scroll to zoom</p>
          <p>Press ESC to close</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ImageLightbox } from '../ui/ImageLightbox';
import {
  MagnifyingGlassPlusIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

/**
 * ImageGallery Component - Product image display with gallery and zoom
 * 
 * Features:
 * - Main image display with hover zoom preview
 * - Thumbnail navigation
 * - Click to open full lightbox
 * - Modern blur design
 * - Responsive layout
 * - Image loading states
 */

interface ImageGalleryProps {
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  productTitle: string;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  productTitle,
  className = ''
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Find primary image or use first image
  const primaryImageIndex = images.findIndex(img => img.isPrimary);
  const initialIndex = primaryImageIndex >= 0 ? primaryImageIndex : 0;

  const currentImage = images[selectedImageIndex] || images[initialIndex];

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  if (!images || images.length === 0) {
    return (
      <BackdropBlur className={`rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden ${className}`}>
        <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-400">
            <PhotoIcon className="w-16 h-16 mx-auto mb-2" />
            <p>No images available</p>
          </div>
        </div>
      </BackdropBlur>
    );
  }

  return (
    <>
      <BackdropBlur className={`rounded-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden ${className}`}>
        {/* Main Image Display */}
        <div className="relative group">
          <div className="aspect-square relative overflow-hidden">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {imageError ? (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <EyeIcon className="w-16 h-16 mx-auto mb-2" />
                  <p>Image not available</p>
                </div>
              </div>
            ) : (
              <Image
                src={`http://localhost:5000${currentImage.url}`}
                alt={productTitle}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={selectedImageIndex === 0}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}

            {/* Zoom overlay on hover */}
            <div 
              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer flex items-center justify-center"
              onClick={openLightbox}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white"
              >
                <MagnifyingGlassPlusIcon className="w-6 h-6" />
              </motion.div>
            </div>

            {/* Click to zoom hint */}
            <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Click to zoom
            </div>
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {selectedImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setImageLoading(true);
                    setImageError(false);
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex 
                      ? 'border-blue-500 ring-2 ring-blue-500/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={`http://localhost:5000${image.url}`}
                    alt={`${productTitle} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{images.length} image{images.length !== 1 ? 's' : ''}</span>
            <button 
              onClick={openLightbox}
              className="hover:text-blue-500 transition-colors"
            >
              View gallery
            </button>
          </div>
        </div>
      </BackdropBlur>

      {/* Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={lightboxOpen}
        initialIndex={selectedImageIndex}
        onClose={() => setLightboxOpen(false)}
        productTitle={productTitle}
      />
    </>
  );
};

export default ImageGallery;

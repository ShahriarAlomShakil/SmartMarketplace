import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon, 
  ArrowsUpDownIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { BackdropBlur } from '../ui/BackdropBlur';

interface ImageUploadProps {
  data: {
    images: Array<{
      id: string;
      file: File;
      preview: string;
      isPrimary: boolean;
    }>;
  };
  onChange: (updates: any) => void;
  errors: any;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  data,
  onChange,
  errors
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Compress and resize image
      const compressedFile = await compressImage(file);
      const preview = await createPreview(compressedFile);

      newImages.push({
        id: `img_${Date.now()}_${i}`,
        file: compressedFile,
        preview,
        isPrimary: data.images.length === 0 && i === 0
      });
    }

    onChange({
      images: [...data.images, ...newImages]
    });

    setIsCompressing(false);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = data.images.filter(img => img.id !== imageId);
    
    // If we removed the primary image, make the first remaining image primary
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }
    
    onChange({ images: updatedImages });
  };

  const setPrimaryImage = (imageId: string) => {
    const updatedImages = data.images.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    }));
    
    onChange({ images: updatedImages });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...data.images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    
    onChange({ images: updatedImages });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Product Images
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add up to 10 high-quality images of your product. The first image will be the main photo.
        </p>
      </div>

      {/* Upload Area */}
      <BackdropBlur
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <div
          className="p-12 text-center cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <PhotoIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isCompressing ? 'Processing images...' : 'Upload your product photos'}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop images here, or click to browse
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Supports: JPG, PNG, WebP • Max size: 10MB each • Up to 10 images
          </div>
          
          {isCompressing && (
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </BackdropBlur>

      {/* Error Display */}
      {errors.images && (
        <div className="text-red-500 text-sm font-medium">
          {errors.images}
        </div>
      )}

      {/* Image Grid */}
      {data.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Uploaded Images ({data.images.length}/10)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag to reorder • Click star to set as main photo
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {data.images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    image.isPrimary
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  draggable
                  onDragStart={(e: React.DragEvent) => {
                    e.dataTransfer.setData('text/plain', index.toString());
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                    reorderImages(fromIndex, index);
                  }}
                >
                  <div className="aspect-square relative">
                    <img
                      src={image.preview}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Primary Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                        Main Photo
                      </div>
                    )}

                    {/* Image Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryImage(image.id);
                        }}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors duration-200"
                        title="Set as main photo"
                      >
                        <EyeIcon className="w-4 h-4 text-white" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition-colors duration-200"
                        title="Remove image"
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <ArrowsUpDownIcon className="w-4 h-4 text-white bg-black/50 rounded p-1" />
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add More Button */}
          {data.images.length < 10 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
            >
              + Add More Images ({10 - data.images.length} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

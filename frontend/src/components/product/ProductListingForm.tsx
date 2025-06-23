import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ImageUpload } from './ImageUpload';
import { ProductDetailsForm } from './ProductDetailsForm';
import { PricingForm } from './PricingForm';
import { LocationForm } from './LocationForm';
import { PreviewForm } from './PreviewForm';

interface ProductListingFormProps {
  onSubmit: (productData: FormData) => void;
  initialData?: ProductFormData;
  mode?: 'create' | 'edit';
  isSubmitting?: boolean;
  onCancel?: () => void;
}

interface ProductFormData {
  _id?: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  condition: string;
  brand: string;
  model: string;
  images: Array<{
    id: string;
    file: File;
    preview: string;
    isPrimary: boolean;
  }>;
  basePrice: string;
  minPrice: string;
  currency: string;
  negotiable: boolean;
  location: {
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    } | null;
    shippingAvailable: boolean;
    localPickupOnly: boolean;
  };
  specifications: Record<string, any>;
  tags: string[];
  urgency: {
    level: string;
    reason: string;
  };
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

interface ValidationErrors {
  [key: string]: string;
}

const steps: FormStep[] = [
  {
    id: 'details',
    title: 'Product Details',
    description: 'Tell us about your product',
    component: ProductDetailsForm
  },
  {
    id: 'images',
    title: 'Images',
    description: 'Upload product photos',
    component: ImageUpload
  },
  {
    id: 'pricing',
    title: 'Pricing',
    description: 'Set your prices',
    component: PricingForm
  },
  {
    id: 'location',
    title: 'Location',
    description: 'Where is your product?',
    component: LocationForm
  },
  {
    id: 'preview',
    title: 'Preview',
    description: 'Review your listing',
    component: PreviewForm
  }
];

export const ProductListingForm: React.FC<ProductListingFormProps> = ({
  onSubmit,
  initialData = {} as ProductFormData,
  mode = 'create',
  isSubmitting: externalIsSubmitting = false,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProductFormData>(() => ({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    subcategory: initialData.subcategory || '',
    condition: initialData.condition || 'good',
    brand: initialData.brand || '',
    model: initialData.model || '',
    images: initialData.images || [],
    basePrice: initialData.basePrice || '',
    minPrice: initialData.minPrice || '',
    currency: initialData.currency || 'USD',
    negotiable: initialData.negotiable !== undefined ? initialData.negotiable : true,
    location: {
      city: initialData.location?.city || '',
      state: initialData.location?.state || '',
      country: initialData.location?.country || '',
      zipCode: initialData.location?.zipCode || '',
      coordinates: initialData.location?.coordinates || null,
      shippingAvailable: initialData.location?.shippingAvailable || false,
      localPickupOnly: initialData.location?.localPickupOnly !== undefined ? initialData.location.localPickupOnly : true
    },
    specifications: initialData.specifications || {},
    tags: initialData.tags || [],
    urgency: {
      level: initialData.urgency?.level || 'medium',
      reason: initialData.urgency?.reason || ''
    }
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Use external isSubmitting if provided
  const finalIsSubmitting = externalIsSubmitting || isSubmitting;

  // Auto-save to localStorage
  useEffect(() => {
    const autoSaveKey = `product-listing-draft-${mode}`;
    const savedData = localStorage.getItem(autoSaveKey);
    
    if (savedData && !initialData._id) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData((prev: ProductFormData) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, [mode, initialData._id]);

  useEffect(() => {
    const autoSaveKey = `product-listing-draft-${mode}`;
    const timeoutId = setTimeout(() => {
      localStorage.setItem(autoSaveKey, JSON.stringify(formData));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, mode]);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev: ProductFormData) => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    const updatedFields = Object.keys(updates);
    setErrors((prev: ValidationErrors) => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => delete newErrors[field]);
      return newErrors;
    });
  };

  const validateStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    const stepErrors: ValidationErrors = {};

    switch (step.id) {
      case 'details':
        if (!formData.title.trim()) stepErrors.title = 'Title is required';
        if (formData.title.length < 3) stepErrors.title = 'Title must be at least 3 characters';
        if (!formData.description.trim()) stepErrors.description = 'Description is required';
        if (formData.description.length < 10) stepErrors.description = 'Description must be at least 10 characters';
        if (!formData.category) stepErrors.category = 'Category is required';
        if (!formData.condition) stepErrors.condition = 'Condition is required';
        break;

      case 'images':
        if (formData.images.length === 0) stepErrors.images = 'At least one image is required';
        break;

      case 'pricing':
        if (!formData.basePrice) stepErrors.basePrice = 'Base price is required';
        if (!formData.minPrice) stepErrors.minPrice = 'Minimum price is required';
        if (parseFloat(formData.minPrice) > parseFloat(formData.basePrice)) {
          stepErrors.minPrice = 'Minimum price cannot exceed base price';
        }
        break;

      case 'location':
        // Location is optional, but validate if provided
        break;

      case 'preview':
        // Final validation
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Convert form data to FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('subcategory', formData.subcategory);
      submitData.append('condition', formData.condition);
      submitData.append('brand', formData.brand);
      submitData.append('model', formData.model);
      submitData.append('basePrice', formData.basePrice);
      submitData.append('minPrice', formData.minPrice);
      submitData.append('currency', formData.currency);
      submitData.append('negotiable', formData.negotiable.toString());
      
      // Add location as JSON
      submitData.append('location', JSON.stringify(formData.location));
      
      // Add tags as JSON
      submitData.append('tags', JSON.stringify(formData.tags));
      
      // Add urgency as JSON
      submitData.append('urgency', JSON.stringify(formData.urgency));
      
      // Add image files
      formData.images.forEach((image, index) => {
        submitData.append('images', image.file);
        if (image.isPrimary) {
          submitData.append('primaryImageIndex', index.toString());
        }
      });

      await onSubmit(submitData);
      
      // Clear auto-save data on successful submission
      const autoSaveKey = `product-listing-draft-${mode}`;
      localStorage.removeItem(autoSaveKey);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Header */}
        <BackdropBlur className="mb-8 p-6 rounded-2xl border border-white/20 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {mode === 'create' ? 'List New Product' : 'Edit Product'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {steps[currentStep].description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {steps[currentStep].title}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index < steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </BackdropBlur>

        {/* Form Content */}
        <BackdropBlur className="rounded-2xl border border-white/20 dark:border-gray-700/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={formData}
                onChange={updateFormData}
                errors={errors}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3 text-gray-600 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-2" />
              Previous
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    {mode === 'create' ? 'Create Listing' : 'Update Listing'}
                    <CheckIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </BackdropBlur>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { BlurCard } from '../ui/BlurCard';
import { ModernInput } from '../ui/ModernInput';
import { ModernButton } from '../ui/ModernButton';
import { ModernBadge } from '../ui/ModernBadge';
import { SearchSuggestions } from '../ui/SearchSuggestions';
import { PriceRangeSlider } from '../ui/PriceRangeSlider';
import { 
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MapPinIcon,
  TagIcon,
  CurrencyDollarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

/**
 * ProductFilters Component - Search and filtering interface
 * 
 * Features:
 * - Real-time search with debouncing
 * - Category and condition filters
 * - Price range filtering
 * - Location-based filtering
 * - Active filter display with removal
 * - Responsive filter panel
 */

export interface FilterState {
  search: string;
  category: string;
  condition: string[];
  priceRange: {
    min: number | null;
    max: number | null;
  };
  location: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  locations: string[];
  popularTags: string[];
  totalResults?: number;
  className?: string;
}

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest First' },
  { value: 'pricing.basePrice', label: 'Price: Low to High' },
  { value: 'analytics.views', label: 'Most Viewed' },
  { value: 'analytics.likes', label: 'Most Liked' },
  { value: 'title', label: 'Name A-Z' }
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  locations,
  popularTags,
  totalResults,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search - handled by SearchSuggestions component
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        onFiltersChange({ ...filters, search: searchValue });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, filters, onFiltersChange]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    updateFilter('search', value);
  };

  const handleSearch = (query: string) => {
    updateFilter('search', query);
  };

  const toggleCondition = (condition: string) => {
    const currentConditions = filters.condition;
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    updateFilter('condition', newConditions);
  };

  const toggleTag = (tag: string) => {
    const currentTags = filters.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateFilter('tags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      condition: [],
      priceRange: { min: null, max: null },
      location: '',
      tags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchValue('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.condition.length > 0) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    if (filters.location) count++;
    if (filters.tags.length > 0) count++;
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <div className={`relative z-50 ${className}`}>
      {/* Search bar and filter toggle */}
      <BlurCard variant="default" className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Enhanced Search input with suggestions */}
          <div className="flex-1 relative z-[100]">
            <SearchSuggestions
              value={searchValue}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              placeholder="Search products, categories, brands..."
              className="w-full"
            />
          </div>

          {/* Sort and filter controls */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                updateFilter('sortBy', sortBy);
                updateFilter('sortOrder', sortOrder as 'asc' | 'desc');
              }}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md min-w-0"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={`${option.value}-desc`} className="bg-gray-900">
                  {option.label}
                </option>
              ))}
            </select>

            {/* Advanced filters toggle */}
            <ModernButton
              variant={showAdvanced ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowAdvanced(!showAdvanced)}
              leftIcon={<FunnelIcon className="w-5 h-5" />}
            >
              Advanced
            </ModernButton>

            {/* Filter toggle */}
            <ModernButton
              variant={showFilters ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
            >
              Filters
              {hasActiveFilters && (
                <ModernBadge variant="secondary" size="sm" className="ml-2">
                  {getActiveFilterCount()}
                </ModernBadge>
              )}
            </ModernButton>
          </div>
        </div>

        {/* Results count */}
        {totalResults !== undefined && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-white/70 text-sm">
              {totalResults} product{totalResults !== 1 ? 's' : ''} found
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Clear all filters
                </button>
              )}
            </p>
          </div>
        )}
      </BlurCard>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <ModernBadge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Search: "{filters.search}"
                <button
                  onClick={() => {
                    updateFilter('search', '');
                    setSearchValue('');
                  }}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            )}

            {filters.category && (
              <ModernBadge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                <TagIcon className="w-3 h-3" />
                {filters.category}
                <button
                  onClick={() => updateFilter('category', '')}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            )}

            {filters.condition.map(condition => (
              <ModernBadge 
                key={condition}
                variant="secondary" 
                className="flex items-center gap-1"
              >
                Condition: {condition}
                <button
                  onClick={() => toggleCondition(condition)}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            ))}

            {(filters.priceRange.min !== null || filters.priceRange.max !== null) && (
              <ModernBadge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                <CurrencyDollarIcon className="w-3 h-3" />
                Price: {filters.priceRange.min || 0} - {filters.priceRange.max || '∞'}
                <button
                  onClick={() => updateFilter('priceRange', { min: null, max: null })}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            )}

            {filters.location && (
              <ModernBadge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                <MapPinIcon className="w-3 h-3" />
                {filters.location}
                <button
                  onClick={() => updateFilter('location', '')}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            )}

            {filters.tags.map(tag => (
              <ModernBadge 
                key={tag}
                variant="secondary" 
                className="flex items-center gap-1"
              >
                #{tag}
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 hover:text-red-400"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </ModernBadge>
            ))}
          </div>
        </div>
      )}

      {/* Expandable filters panel */}
      {showFilters && (
        <BlurCard variant="default" className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category filter */}
            <div>
              <label className="block text-white font-medium mb-3">Category</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
              >
                <option value="" className="bg-gray-900">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-900">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="block text-white font-medium mb-3">Price Range</label>
              <div className="flex gap-2">
                <ModernInput
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    min: e.target.value ? Number(e.target.value) : null
                  })}
                  className="flex-1"
                />
                <ModernInput
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => updateFilter('priceRange', {
                    ...filters.priceRange,
                    max: e.target.value ? Number(e.target.value) : null
                  })}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Location filter */}
            <div>
              <label className="block text-white font-medium mb-3">Location</label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-md"
              >
                <option value="" className="bg-gray-900">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location} className="bg-gray-900">
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition filters */}
          <div className="mt-6">
            <label className="block text-white font-medium mb-3">Condition</label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map(condition => (
                <button
                  key={condition.value}
                  onClick={() => toggleCondition(condition.value)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filters.condition.includes(condition.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {condition.label}
                </button>
              ))}
            </div>
          </div>

          {/* Popular tags */}
          {popularTags.length > 0 && (
            <div className="mt-6">
              <label className="block text-white font-medium mb-3">Popular Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      filters.tags.includes(tag)
                        ? 'bg-green-600 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear filters button */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <ModernButton
                variant="ghost"
                onClick={clearAllFilters}
                leftIcon={<XMarkIcon className="w-4 h-4" />}
              >
                Clear All Filters
              </ModernButton>
            </div>
          )}
        </BlurCard>
      )}
    </div>
  );
};

export default ProductFilters;

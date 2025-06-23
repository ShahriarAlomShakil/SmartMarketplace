import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackdropBlur } from '../ui/BackdropBlur';
import { ModernInput } from '../ui/ModernInput';
import { productAPI } from '../../utils/api';
import {
  MagnifyingGlassIcon,
  ClockIcon,
  TagIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * SearchSuggestions Component - Enhanced search with autocomplete
 * 
 * Features:
 * - Real-time search suggestions
 * - Recent searches history
 * - Popular/trending searches
 * - Category suggestions
 * - Keyboard navigation
 * - Click outside to close
 */

interface SearchSuggestion {
  type: 'product' | 'category' | 'recent' | 'popular' | 'trending';
  text: string;
  count?: number;
  category?: string;
  id?: string;
}

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search products...",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Calculate dropdown position with better accuracy
  const updateDropdownPosition = () => {
    if (searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  // Also update position when opening
  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  // Load recent searches from localStorage and add event listeners
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }

    // Add listeners for position updates
    const handleScroll = () => {
      if (isOpen) updateDropdownPosition();
    };
    const handleResize = () => {
      if (isOpen) updateDropdownPosition();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Fetch suggestions when search value changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value.trim());
      }, 300);
    } else {
      setSuggestions(getDefaultSuggestions());
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        setSelectedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (value.trim()) {
          handleSearch(value.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      setLoading(true);
      const response = await productAPI.searchSuggestions(query);
      
      const newSuggestions: SearchSuggestion[] = [
        // Product matches
        ...response.data.products.map((product: any) => ({
          type: 'product' as const,
          text: product.title,
          id: product._id,
          category: product.category
        })),
        
        // Category matches
        ...response.data.categories.map((category: string) => ({
          type: 'category' as const,
          text: category,
          count: response.data.categoryCounts[category] || 0
        }))
      ];

      setSuggestions(newSuggestions.slice(0, 8)); // Limit to 8 suggestions
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSuggestions = (): SearchSuggestion[] => {
    const defaultSuggestions: SearchSuggestion[] = [];
    
    // Recent searches
    if (recentSearches.length > 0) {
      defaultSuggestions.push(
        ...recentSearches.slice(0, 3).map(search => ({
          type: 'recent' as const,
          text: search
        }))
      );
    }

    // Popular categories
    const popularCategories = [
      'Electronics', 'Clothing', 'Home & Garden', 'Sports'
    ];
    
    defaultSuggestions.push(
      ...popularCategories.map(category => ({
        type: 'popular' as const,
        text: category
      }))
    );

    // Trending searches
    const trendingSearches = [
      'iPhone', 'Laptop', 'Sneakers', 'Gaming Chair'
    ];
    
    defaultSuggestions.push(
      ...trendingSearches.map(search => ({
        type: 'trending' as const,
        text: search
      }))
    );

    return defaultSuggestions.slice(0, 8);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchText = suggestion.text;
    onChange(searchText);
    handleSearch(searchText);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Add to recent searches
      const updatedRecent = [
        query,
        ...recentSearches.filter(s => s !== query)
      ].slice(0, 10);
      
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      
      onSearch(query);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setSuggestions(getDefaultSuggestions());
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'category':
        return <TagIcon className="w-4 h-4 text-blue-500" />;
      case 'popular':
        return <FireIcon className="w-4 h-4 text-orange-500" />;
      case 'trending':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      default:
        return <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`search-suggestions-container ${className}`} style={{ position: 'relative', zIndex: 999999 }}>
      <div className="relative">
        <ModernInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsOpen(true);
            updateDropdownPosition();
            if (!value.trim()) {
              setSuggestions(getDefaultSuggestions());
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-4"
        />
        
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="search-suggestions-dropdown absolute top-full left-0 right-0 mt-2"
            style={{ zIndex: 999999 }}
          >
            <BackdropBlur className="rounded-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {/* Recent searches header */}
                {suggestions.some(s => s.type === 'recent') && (
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 dark:border-gray-700/50">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                )}

                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={`${suggestion.type}-${suggestion.text}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-3 flex items-center space-x-3 text-left hover:bg-white/10 dark:hover:bg-gray-700/50 transition-colors ${
                      index === selectedIndex ? 'bg-white/10 dark:bg-gray-700/50' : ''
                    }`}
                    whileHover={{ x: 2 }}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 dark:text-white truncate">
                          {suggestion.text}
                        </span>
                        
                        {suggestion.type === 'category' && suggestion.count && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({suggestion.count})
                          </span>
                        )}
                      </div>
                      
                      {suggestion.category && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          in {suggestion.category}
                        </span>
                      )}
                    </div>

                    {suggestion.type === 'trending' && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Trending
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Search tips */}
              <div className="px-4 py-2 border-t border-white/10 dark:border-gray-700/50 bg-white/5 dark:bg-gray-800/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press ↑↓ to navigate, Enter to search, Esc to close
                </p>
              </div>
            </BackdropBlur>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSuggestions;
